"use client";
import Link from "next/link";
import React, { FormEvent, useEffect, useState } from "react";
import Modal from "./Modal";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { signIn, useSession } from "next-auth/react";
import TextField from "./UI/TextField";
import Button from "./UI/Button";
import axiosInstance from "#/lib/axiosInstance";
import { toast } from "react-toastify";



const LoginModal = () => {
  const session = useSession();
  const router = useRouter();
  const [error, setError] = useState("");
  
  // useEffect(() => {
  //   if (session.status === "authenticated") {
  //     router.push("/");
  //   }
  // }, [session.status]);

  const onClose = React.useCallback(() => {
    router.push("/");
  }, [router]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const resp = await axiosInstance.post("/reset-password", {
        // @ts-ignore
        email: e.target["email"].value,
      });
      if (resp.data.success) {
      toast.success("Email sent!");
      router.push("/");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Something went wrong");
    }

  };

  return (
    <Modal title="Forgot password" isOpen={true} onClose={onClose}>
      <form className="space-y-4 p-4 pb-6" onSubmit={onSubmit}>
        <TextField
          name="email"
          type="email"
          label="Your email"
          placeholder="name@company.com"
        />

        {error && (
          <div className="my-4">
            <div className=" text-red-900 bg-red-300 rounded-lg p-2 text-sm font-bold">
              {error}
            </div>
          </div>
        )}

        <Button type="submit">Submit</Button>

        <div className="text-sm font-medium text-gray-500 dark:text-gray-300">
          <span>Not registered? </span>
          <Link
            href="/register"
            className="text-blue-700 hover:underline dark:text-blue-500"
          >
            Create account
          </Link>
        </div>
      </form>
    </Modal>
  );
};

export default LoginModal;
