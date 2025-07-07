import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavbarWrapper from '@/base/NavbarWrapper';
import CSRFProvider from '@/base/CSRFProvider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "SocialConnect",
  description: "A community-driven platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <CSRFProvider />
        <NavbarWrapper />
        {children}
      </body>
    </html>
  );
}
