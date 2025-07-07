'use client';

import Navbar from '@/base/navbar';
import { usePathname } from 'next/navigation';

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const hideNavbar = ["/login", "/signup"].includes(pathname);

  return (
    <>
      {!hideNavbar && <Navbar />}
      {children}
    </>
  );
}
