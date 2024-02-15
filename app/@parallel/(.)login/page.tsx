"use client";

import LoginModal from "#/components/LoginModal";
import { usePathname } from "next/navigation";

export default function LoginModalPage() {
  const pathname = usePathname()

  if (pathname !== '/login') {
      return null
  }

  return <LoginModal />;
}
