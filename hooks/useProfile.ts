"use client";
import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "./useAuthAxios";

function useProfile() {
  const axiosInstance = useAxiosAuth()
  return useQuery<any>({
    queryKey: ["user-data"],
    queryFn: async () => {
      const resp = await axiosInstance.get("/user/me");
      return resp.data;
    },

    select: (resData) => {

      const userData: any = {
        id: resData?.user._id,
        name: resData?.user.name,
        email: resData?.user.email,
        pixels: resData?.pixels
      }
      return userData
    },
  });
}

export default useProfile;
