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

const SVG_FAVICON_DATA_URI = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 92 56'%3E%3Ccircle cx='33' cy='28' r='23' stroke='%230D9488' stroke-width='4.5' fill='none'/%3E%3Ccircle cx='33' cy='28' r='16.5' stroke='%230D9488' stroke-width='4.5' fill='none'/%3E%3Ccircle cx='59' cy='28' r='23' stroke='%230D9488' stroke-width='4.5' fill='none'/%3E%3Ccircle cx='59' cy='28' r='16.5' stroke='%230D9488' stroke-width='4.5' fill='none'/%3E%3Cpath d='M51 10.5 A23 23 0 0 1 57 28' stroke='%230D9488' stroke-width='4.5' stroke-linecap='round'/%3E%3Cpath d='M47.2 14.8 A18 18 0 0 1 52.2 28' stroke='%230D9488' stroke-width='4.5' stroke-linecap='round'/%3E%3C/svg%3E";

export const metadata: Metadata = {
  title: "MEDICINETY - Premium Medical Education Platform",
  description: "Welcome to your digital medical library. MEDICINETY is a premier medical education platform dedicated to empowering medical students worldwide with clinical mastery.",
  icons: {
    icon: SVG_FAVICON_DATA_URI,
    shortcut: SVG_FAVICON_DATA_URI,
    apple: SVG_FAVICON_DATA_URI,
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
        <link rel="icon" href={SVG_FAVICON_DATA_URI} type="image/svg+xml" />
        <link rel="shortcut icon" href={SVG_FAVICON_DATA_URI} type="image/svg+xml" />
        <link rel="apple-touch-icon" href={SVG_FAVICON_DATA_URI} />
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
