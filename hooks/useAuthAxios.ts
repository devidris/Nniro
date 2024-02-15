'use client'
import axiosInstance from "#/lib/axiosInstance"
import { useSession } from "next-auth/react"
import { useEffect } from "react"

const useAxiosAuth = () => {
    const { data } = useSession()
    
    useEffect(() => {
        const requestIntercept = axiosInstance.interceptors.request.use((config) => {
            if (!config.headers['Authorization']) {
                config.headers['Authorization'] = `Bearer ${data?.accessToken}`
            }
            return config
        })

        return () => {
            axiosInstance.interceptors.request.eject(requestIntercept)
        }
    }, [data?.accessToken])

    return axiosInstance
}

export default useAxiosAuth