"use client";

import ForgotPasswordModal from "#/components/ForgotPasswordModal";
import { usePathname } from "next/navigation";

export default function LoginModalPage() {
  const pathname = usePathname()

  if (pathname !== '/forgot-password') {
      return null
  }

  return <ForgotPasswordModal />;
}
