import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Genuix — Every karat, verified.",
  description: "Gold intelligence & jewelry verification platform for India",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-midnight text-ivory">{children}</body>
    </html>
  );
}
