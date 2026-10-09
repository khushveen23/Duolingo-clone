import type { Metadata } from "next";
import "./globals.css";
import { UserProvider } from "@/context/UserContext";
import { ToastProvider } from "@/context/ToastContext";

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
    <html lang="en">
      <body className="min-h-screen bg-white text-[#4b4b4b] antialiased">
        <UserProvider>
          <ToastProvider>{children}</ToastProvider>
        </UserProvider>
      </body>
    </html>
  );
}
