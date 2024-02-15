"use client";
import Link from "next/link";
import React, { FormEvent, useEffect, useState } from "react";
import Modal from "./Modal";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { signIn, useSession } from "next-auth/react";
import TextField from "./UI/TextField";
import Button from "./UI/Button";
import { toast } from "react-toastify";

const ERRORS = {
  CredentialsSignin: "Invalid Credentials",
  default: "Something went wrong",
};

const LoginModal = () => {
  const session = useSession();
  const router = useRouter();
  const [error, setError] = useState("");
  useEffect(() => {
    if (session.status === "authenticated") {
      router.push("/");
    }
  }, [session.status]);

  const onClose = React.useCallback(() => {
    router.back();
  }, [router]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setError("");
    e.preventDefault();
    signIn("credentials", {
      // @ts-ignore
      password: e.target?.password?.value || "",
      // @ts-ignore
      email: e.target?.email?.value || "",
      redirect: false,
      // callbackUrl: "/"
    }).then((resp: any) => {
      if (resp.error) {
        // @ts-expect-error
        toast.error(ERRORS?.[resp?.error ?? "default"] || resp.error);
        return;
      }
      toast.success("Successfully logged in");
    });
  };

  const onGoogle = async () => {
    signIn("google", { callbackUrl: "/" }).then((e: any) => {
      if (e.error) {
        toast.error(`[${e.error}]: Something went wrong`);
      }
    });
  };

  return (
    <Modal title="Login" isOpen={true} onClose={onClose}>
      <form className="space-y-4 p-4 pb-6" onSubmit={onSubmit}>
        <TextField
          name="email"
          type="email"
          label="Your email"
          placeholder="name@company.com"
        />

        <TextField
          name="password"
          type="password"
          label="Password"
          placeholder="*********"
        />

        <div className="flex justify-between">
          {/* <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="remember"
                type="checkbox"
                value=""
                className="w-4 h-4 border border-gray-300 rounded  focus:ring-3  ring-offset-gray-800 focus:ring-offset-gray-800"
              />
            </div>
            <label
              htmlFor="remember"
              className="ms-2 text-sm font-medium text-gray-900 "
            >
              Remember me
            </label>
          </div> */}
          <Link
            href="/forgot-password"
            className="text-sm text-blue-700 hover:underline ml-auto"
          >
            Lost Password?
          </Link>
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

        {error && (
          <div className="my-4">
            <div className=" text-red-900 bg-red-300 rounded-lg p-2 text-sm font-bold">
              {error}
            </div>
          </div>
        )}

        <Button type="submit">Login to your account</Button>

        <div className="text-sm font-medium text-gray-900 ">
          <span>Not registered? </span>
          <Link href="/register" className="text-blue-700 hover:underline">
            Create account
          </Link>
        </div>
      </form>
    </Modal>
  );
};

export default LoginModal;
