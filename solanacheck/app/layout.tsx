import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SolShield — On-Chain Token Intelligence for Solana",
  description:
    "Detect rug pulls before they happen. Paste any Solana token address and get instant on-chain risk analysis. Free, open-source, no login required.",
  keywords: ["solana", "rug pull", "token analysis", "crypto safety", "SPL token", "solshield"],
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
