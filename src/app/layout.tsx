import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const description =
  "One searchable hub for the snippets, commands, prompts, notes and links you keep losing. Save it once, find it in seconds.";

export const metadata: Metadata = {
  title: {
    default: "DevStash — Everything you saved, one search away",
    template: "%s · DevStash",
  },
  description,
  applicationName: "DevStash",
  openGraph: {
    type: "website",
    siteName: "DevStash",
    title: "DevStash — Everything you saved, one search away",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "DevStash — Everything you saved, one search away",
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
