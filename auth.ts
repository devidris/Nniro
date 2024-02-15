import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from 'next-auth/providers/credentials';
import { jwtDecode } from "jwt-decode";
import axiosInstance from "./lib/axiosInstance";
const useSecureCookies = (process.env.NEXTAUTH_URL as string)?.startsWith(
  // https://pixels-ebon-three.vercel.app || https://localhsot:3000
  "https://"
);
const cookiePrefix = useSecureCookies ? "__Secure-" : "";

const cookies: Partial<{}> = {
  sessionToken: {
    name: `${cookiePrefix}next-auth.session-token`,
    options: {
      httpOnly: true,
      sameSite: false,
      path: "/",
      secure: useSecureCookies,
      domain:
        process.env.NODE_ENV === "development"
          ? "localhost"
          : "nniro.com",
    },
  },
  callbackUrl: {
    name: `__Secure-next-auth.callback-url`,
    options: {
      httpOnly: true,
      sameSite: false,
      path: "/",
      secure: useSecureCookies,
    },
  },

  pkceCodeVerifier: {
    name: 'next-auth.pkce.code_verifier',
    options: {
      httpOnly: true,
      sameSite: 'none',
      path: '/',
      secure: true
    }
  }
};
  
export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: {
    signIn: "/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      async profile(profile, tokens) {

        const data = {
          id: profile?.sub,
          first_name: profile?.given_name,
          last_name: profile?.family_name,
          email: profile?.email?.toLowerCase(),
          token: tokens,
        };
        try {
          const result = await axiosInstance.post('/google-auth', data)
          
          if (result.data.token) {
            return { ...profile, accessToken: result.data.token, id: profile.sub };
          }
  
          return null
          
        } catch (error) {
          console.log(error);
          throw new Error('google-auth-error')
        }
      },
    }),

    Credentials({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        try {
          const resp = await axiosInstance.post('/login', {
            email: credentials.email as string,
            password: credentials.password as string
          })

          if (resp.data.token) {
            return { ...resp.data, ...jwtDecode(resp.data.token), accessToken: resp.data.token }
          }
          return null;
        } catch (error) {
          return null
        }
      },
    })
  ],

  session: {
    strategy: "jwt"
  },
  callbacks: {
    async session({ session, token }) {
      // console.log('params-2',token.accessToken);
      // @ts-ignore
      session.user.userId = jwtDecode(token.accessToken).user_id
      // @ts-ignore
      session.accessToken = token.accessToken
      return session;
    },
    async jwt({ token, user, session, ...rest }) {
      // console.log('params-1', { token, user, session,...rest });
      // @ts-ignore
      if (user?.accessToken) {
        // @ts-ignore
        token.accessToken = user.accessToken
      }
      return Promise.resolve(token)
    },
    async redirect({ url, baseUrl, ...rest }) {
      console.log({ url, baseUrl, ...rest });
      
      // Allows relative callback URLs
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) {
        return baseUrl;
      }
      return baseUrl;
    },
    authorized({ request, auth }) {
      // console.log('callbacks authorized', { request, auth });

      const { pathname } = request.nextUrl
      if (pathname === "/admin") return !!auth
      return true
    },

  },
  useSecureCookies,
  cookies
})