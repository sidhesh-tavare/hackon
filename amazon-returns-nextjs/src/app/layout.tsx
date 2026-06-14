import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Image from "next/image";
import Link from "next/link";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Amazon.in - Your Orders",
  description: "Amazon Returns and Orders Simulation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Toaster position="top-center" reverseOrder={false} />
        {/* Main Nav */}
        <header className="amz-nav-main">
          <div className="flex items-center gap-6 w-full">
            <div className="flex items-center">
              <Image src="/images/logo.png" alt="Amazon.in" width={100} height={30} className="object-contain" />
            </div>
            
            {/* Search Bar */}
            <div className="flex-grow hidden md:flex">
              <div className="flex w-full rounded bg-white overflow-hidden">
                <button className="bg-gray-100 px-3 border-r text-[#555] text-sm hover:bg-gray-200">All</button>
                <input type="text" placeholder="Search Amazon.in" className="flex-grow px-3 py-2 text-black outline-none" />
                <button className="bg-[#febd69] hover:bg-[#f3a847] px-4 text-black font-bold">Q</button>
              </div>
            </div>

            <div className="flex items-center gap-4 whitespace-nowrap">
              <div className="hidden md:block">
                <span className="text-xs text-gray-300 block">Hello, Sidhesh</span>
                <span className="text-sm font-bold">Account & Lists</span>
              </div>
              <Link href="/" className="hidden md:block hover:border hover:border-white p-1 -m-1 rounded cursor-pointer">
                <span className="text-xs text-gray-300 block leading-none">Returns</span>
                <span className="text-sm font-bold leading-none">& Orders</span>
              </Link>
              <div className="flex items-center">
                <span className="font-bold">🛒 Cart</span>
              </div>
            </div>
          </div>
        </header>

        {/* Sub Nav */}
        <nav className="amz-nav-sub">
          <div className="flex items-center gap-1 font-bold cursor-pointer">
             ☰ All
          </div>
          <div className="flex items-center gap-1 cursor-pointer font-bold text-[#febd69]">
            <Image src="/images/rufus.jpg" alt="Rufus" width={20} height={20} className="rounded-full" />
            Rufus
          </div>
          <span className="cursor-pointer hover:border-white border border-transparent p-1 rounded">Fresh</span>
          <span className="cursor-pointer hover:border-white border border-transparent p-1 rounded">Today's Deals</span>
          <span className="cursor-pointer hover:border-white border border-transparent p-1 rounded">MX Player</span>
          <span className="cursor-pointer hover:border-white border border-transparent p-1 rounded">Sell</span>
          <span className="cursor-pointer hover:border-white border border-transparent p-1 rounded">Gift Cards</span>
          <span className="cursor-pointer hover:border-white border border-transparent p-1 rounded">Amazon Pay</span>
        </nav>

        {children}
      </body>
    </html>
  );
}
