'use client';

import Navbar from '@/base/navbar';
import { usePathname } from 'next/navigation';

export default function ClientLayout({ children }) {
  const pathname = usePathname();

  // Hide navbar on these routes (use startsWith to cover dynamic segments too)
  const HIDDEN_ROUTES = ["/login", "/register"];
  const hideNavbar = HIDDEN_ROUTES.some(route => pathname.startsWith(route));

  return (
    <>
      {!hideNavbar && <Navbar />}
      <main>{children}</main>
    </>
  );
}
