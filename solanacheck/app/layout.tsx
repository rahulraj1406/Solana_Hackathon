import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SolanaCheck — Instant Rug-Pull Risk Analysis",
  description:
    "Paste any Solana token address and get an instant risk score (0-100) with clear reasons. Free, open-source, no login required. Powered by Solana mainnet via Helius RPC.",
  keywords: ["solana", "rug pull", "token analysis", "crypto safety", "SPL token"],
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
