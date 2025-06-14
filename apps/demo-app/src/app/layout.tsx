import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/Header";
import "./globals.css";
import "./neumorphism.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CFP Tracker",
  description:
    "An app to track conferences and the CFP dates as well as the talks you have or are planning to propose to them.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col gap-4`}
      >
        <div className="p-4 flex flex-col gap-4">
          <Header />
          {children}
          <Toaster />
        </div>
      </body>
    </html>
  );
}
