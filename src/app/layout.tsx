import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import CookieBanner from "@/components/CookieBanner";
import Footer from "@/components/Footer";
import ThemeSync from "@/components/ThemeSync";
import SecurityGuard from "@/components/SecurityGuard";
import { LanguageProvider } from "@/components/LanguageContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});



export const metadata: Metadata = {
  title: "MEDICINETY - Premium Medical Education Platform",
  description: "Welcome to your digital medical library. MEDICINETY is a premier medical education platform dedicated to empowering medical students worldwide with clinical mastery.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png", sizes: "32x32" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
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
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <title>MEDICINETY - Premium Medical Education Platform</title>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#FFFFFF" />
      </head>

      <body className="min-h-screen m-0 p-0 flex flex-col bg-brand-bg text-brand-text transition-colors duration-300 overflow-x-hidden">
        <LanguageProvider>
          <ThemeSync />
          <SecurityGuard />
          <Sidebar />
          <CookieBanner />
          <main className="flex-1 flex flex-col min-w-0 min-h-screen overflow-y-auto">
            {children}
          </main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
