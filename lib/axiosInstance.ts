import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_API;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // If the response status is 401 or 403, remove the session token
    if (response.status === 401 || response.status === 403) {
      Cookies.remove('next-auth.session-token');
      
      // Use the useHistory hook to get access to the history object
  const router = useRouter();
      // Optionally, you might want to redirect the user to the login page
      router.push('/login');
    }
    return response;
  },
  (error) => {
    // Handle network errors or other errors
    console.error('Error with Axios request:', error);
    return Promise.reject(error);
  }
);

export default axiosInstance;