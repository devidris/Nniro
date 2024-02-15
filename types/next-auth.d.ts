import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      userId: string
      email: string
      name: string
    }
    accessToken: string
  }

  interface User {
    id: string
    email: string
    name: string
  }

  interface Token {
    accessToken: string
  }
}