import type { Metadata, Viewport } from "next";
import "./globals.css";
import { UserProvider } from "@/context/UserContext";
import { ToastProvider } from "@/context/ToastContext";
import { ThemeProvider } from "@/context/ThemeContext";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Duolingo - The world's best way to learn a language",
  description: "Learn Spanish with bite-sized, gamified lessons.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-white text-[#4b4b4b] antialiased transition-colors duration-200">
        <ThemeProvider>
          <UserProvider>
            <ToastProvider>{children}</ToastProvider>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
