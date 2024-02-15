"use client";

import RegisterModal from "#/components/RegisterModal";
import { usePathname } from "next/navigation";


export default function RegisterModalPage() {
  const pathname = usePathname()

  if (pathname !== '/register') {
      return null
  }
  return <RegisterModal/>;
}
