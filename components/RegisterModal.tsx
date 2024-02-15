"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "./Modal";
import Image from "next/image";
import TextField from "./UI/TextField";
import Button from "./UI/Button";
import { signIn, useSession } from "next-auth/react";
import axiosInstance from "#/lib/axiosInstance";
import { toast } from "react-toastify";

type Props = {};

const RegisterModal = ({}: Props) => {
  const session = useSession();
  const router = useRouter();
  const [error, setLoading] = useState(null);
  // TODO: Form validation errors

  useEffect(() => {
    if (session.status === "authenticated") {
      router.push("/");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const onClose = React.useCallback(() => {
    router.push("/");
  }, [router]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const resp = await axiosInstance.post("/register", {
        // @ts-ignore
        password: e.target["password"].value,
        // @ts-ignore
        email: e.target["email"].value,
        // @ts-ignore
        name: e.target["name"].value,
      });
      if (resp.data.token) {
        return await signIn("credentials", {
          // @ts-ignore
          password: e.target["password"].value,
          // @ts-ignore
          email: e.target["email"].value,
        });
      }
      if (resp.data.message) {
        toast.error(resp?.data?.message ?? "Something went wrong");
        // setError(resp.data.message)
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Something went wrong");
    }
  };

  const onGoogle = async () => {
    
    signIn("google", { callbackUrl: "/" }).then((e: any) => {
      if (e.error) {
        toast.error(`[${e.error}]: Something went wrong`);
      }
    });
  };

  return (
    <Modal title="Registration" isOpen={true} onClose={onClose}>
      <form className="space-y-4 p-4 pb-6" action="#" onSubmit={onSubmit}>
        <TextField
          label="Your email"
          placeholder="name@company.com"
          name="email"
          type="text"
        />
        <TextField
          label="Password"
          placeholder="**************"
          name="password"
          type="password"
        />
        <TextField
          label="Your name"
          placeholder="John Smith"
          name="name"
          type="text"
        />

        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="remember"
              type="checkbox"
              value=""
              className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300  ring-offset-gray-800 focus:ring-offset-gray-800"
              required
            />
          </div>
          <label
            htmlFor="remember"
            className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            <Link
            href={'/terms-conditions'}
            className='text-blue-600'
            >
             Terms and conditions
            </Link>
          </label>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onGoogle}
            className="text-white flex justify-center w-full shadow hover:bg-gray-100 bg-white hover:opacity-80 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg p-2.5 text-center "
          >
            <Image width={20} height={20} src={"google.svg"} alt="" />
          </button>
        </div>
        {/* {error && (
          <div className="my-4">
            <div className=" text-red-900 bg-red-300 rounded-lg p-2 text-sm font-bold">
              {error}
            </div>
          </div>
        )} */}
        <Button type="submit">Register</Button>

        <div className="text-sm font-medium  text-gray-800">
          <span>Already have an account?</span>
          <Link href="/login" className=" hover:underline ml-2 text-blue-600">
            Sign In
          </Link>
        </div>
      </form>
    </Modal>
  );
};

export default RegisterModal;
