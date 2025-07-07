'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from './navbar';

export default function NavbarWrapper() {
  const pathname = usePathname();
  const [showNavbar, setShowNavbar] = useState(true);

  useEffect(() => {
    const noNavbarPaths = ["/login", "/signup", "/forgot-password"];
    setShowNavbar(!noNavbarPaths.includes(pathname));
  }, [pathname]);

  return showNavbar ? <Navbar /> : null;
}
