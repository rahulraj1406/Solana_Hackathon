import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Ruglyzer — On-Chain Rug Pull Detection for Solana",
  description:
    "Scan any Solana token in seconds. Get a real-time risk score powered by on-chain data. Free, open-source, no login required.",
  keywords: ["solana", "rug pull", "token scanner", "crypto safety", "SPL token", "ruglyzer"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
