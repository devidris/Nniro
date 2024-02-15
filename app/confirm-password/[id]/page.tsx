"use client";
import Link from "next/link";
import React, { FormEvent, useEffect, useState } from "react";
import Modal from "../../../components/Modal";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { signIn, useSession } from "next-auth/react";
import TextField from "../../../components/UI/TextField";
import Button from "../../../components/UI/Button";
import axiosInstance from "#/lib/axiosInstance";
import { toast } from "react-toastify";



const LoginModal = () => {
  const session = useSession();
  const router = useRouter();
  const pathname = usePathname()
  const [error, setError] = useState("");

  const onClose = React.useCallback(() => {
    router.push("/");
  }, [router]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const resp = await axiosInstance.post(`/confirm-password/${pathname.split("/")[2]}`, {
        // @ts-ignore
        password: e.target["newPassword"].value,
      });
      if (resp.data.success) {
      toast.success("Password updated!");
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
          name="newPassword"
          type="password"
          label="Your new password"
          placeholder=""
        />

        {error && (
          <div className="my-4">
            <div className=" text-red-900 bg-red-300 rounded-lg p-2 text-sm font-bold">
              {error}
            </div>
          </div>
        )}

        <Button type="submit">Submit</Button>
      </form>
    </Modal>
  );
};

export default LoginModal;
