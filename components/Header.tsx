"use client";
import {
  Bars3Icon,
  FaceSmileIcon,
  XMarkIcon,
  UserIcon,
} from "@heroicons/react/24/solid";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useDetectClickOutside } from "react-detect-click-outside";
import Button from "./UI/Button";

const wrapperVariants = {
  open: {
    display: "block",
    scaleY: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
  closed: {
    display: "none",
    scaleY: 0,
    transition: {
      when: "afterChildren",
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  open: {
    opacity: 1,
    y: 0,
    transition: {
      when: "beforeChildren",
    },
  },
  closed: {
    opacity: 0,
    y: -15,
    transition: {
      when: "afterChildren",
    },
  },
};

const Header = () => {
  const session = useSession();
  const [isOpen, setIsOpen] = useState(false);
  let [count, setCount] = useState("0");
  const myRef = useRef<any>(null);
  const ref = useDetectClickOutside({ onTriggered: () => setIsOpen(false) });
  const isLoggedIn = session.status === "authenticated";

  function generateRandomNumber(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min).toLocaleString();
  }

  myRef.current = () => {
    setCount(generateRandomNumber(400000, 3000000));
  };
  useEffect(() => {
    console.log(ref, myRef);
    setCount(generateRandomNumber(400000, 3000000));
    let id = setInterval(() => {
      myRef.current();
    }, 60000);

    return () => {
      clearInterval(id);
    };
  }, []);

  const onLinkClick = () => setIsOpen(false);

  return (
    <nav className="border-gray-200 ">
      <div className=" bg-gray-100 h-[80px] flex flex-wrap items-center justify-between mx-auto p-4 shadow relative">
        <a href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          {/* <div className="h-[50px] w-[50px] "> */}
          <Image
            src={`/logo.png`}
            alt="logo"
            width={40}
            height={50}
            className="absolute left-[50%] translate-x-[-50%]"
          />
          {/* </div> */}
        </a>
        <div className="flex order-1 space-x-3 ">
          {/* {isLoggedIn ? (
            <div className="flex items-center text-black  gap-3">
              <span>{session.data.user?.name || session.data.user?.email}</span>
            </div>
          ) : (
            <Link href={"/login"} slot="auth">
              <Button>Login</Button>
            </Link>
          )} 
          
          
          <motion.li variants={itemVariants}>
              <Link
                onClick={onLinkClick}
                href={"/about"}
                className="block py-2 px-3  text-black hover:text-white  hover:bg-[#454545] rounded  "
              >
                About
              </Link>
            </motion.li>
          */}
          <button
            onClick={() => setIsOpen((p) => !p)}
            data-collapse-toggle="navbar-cta"
            type="button"
            className="inline-flex  items-center p-2 w-10 h-10 justify-center text-sm text-black rounded-lg  focus:outline-none focus:ring-2 focus:ring-gray-200 "
            aria-controls="navbar-cta"
          >
            <span className="sr-only">Open main menu</span>
            {isOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>

        <motion.div
          animate={isOpen ? "open" : "closed"}
          className="order-1 absolute right-2 bottom-0 translate-y-[calc(100%+10px)] select-none"
          id="navbar-cta"
          ref={ref}
        >
          <motion.ul
            initial={wrapperVariants.closed}
            variants={wrapperVariants}
            style={{ originY: "top", right: "0" }}
            className="flex ml-auto flex-col font-medium p-4 border border-gray-200 rounded-lg   rtl:space-x-reverse   bg-white"
          >
            {session.data && (
              <motion.li
                variants={itemVariants}
                className="flex items-center text-black  gap-2 border-b pb-2"
              >
                <Link href="/profile">
                  <span className="flex gap-x-2">
                    <UserIcon className="w-6 h-6" />
                    {session.data.user?.name || session.data.user?.email}
                  </span>
                </Link>
              </motion.li>
            )}
            <motion.li variants={itemVariants}>
              <Link
                onClick={onLinkClick}
                href="/"
                className="block py-2 px-3  text-black hover:text-white  hover:bg-[#454545] rounded  "
                aria-current="page"
              >
                Board
              </Link>
            </motion.li>

            <motion.li variants={itemVariants}>
              <Link
                onClick={onLinkClick}
                href="/terms-conditions"
                className="block py-2 px-3  text-black hover:text-white  hover:bg-[#454545] rounded  "
              >
                Terms & Conditions
              </Link>
            </motion.li>
            {!isLoggedIn && (
              <>
                <motion.li variants={itemVariants}>
                  <Link
                    onClick={onLinkClick}
                    href={{
                      pathname: "/login",
                    }}
                    className="block py-2 px-3  text-black hover:text-white  hover:bg-[#454545] rounded  "
                  >
                    Login
                  </Link>
                </motion.li>
                <motion.li variants={itemVariants}>
                  <Link
                    onClick={onLinkClick}
                    href="/register"
                    className="block py-2 px-3  text-black hover:text-white  hover:bg-[#454545] rounded  "
                  >
                    Registration
                  </Link>
                </motion.li>
              </>
            )}
            {isLoggedIn && (
              <motion.li variants={itemVariants}>
                <button
                  type="button"
                  className="block py-2 px-3 w-full text-left text-black hover:text-white  hover:bg-[#454545] rounded  "
                  onClick={async () => {
                    await signOut({ redirect: false });
                    onLinkClick();
                  }}
                >
                  Log Out
                </button>
              </motion.li>
            )}
            <motion.li variants={itemVariants}>
              <p className="border-solid border-t border-gray-200 rounded-lg block py-2 px-3 w-full text-left text-black">
                Current visitors:{" "}
                <span className=" font-semibold">{count}</span>
              </p>
            </motion.li>
          </motion.ul>
        </motion.div>
      </div>
    </nav>
  );
};

export default Header;
