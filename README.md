# Ruglyzer 🚨

> On-Chain Rug Pull Detection for Solana Tokens. Built for the Colosseum Frontier Hackathon 2026.

**Live Application:** [https://ruglyzer.vercel.app](https://ruglyzer.vercel.app)  
**Pitch / Demo Video:** [Watch on Loom](https://www.loom.com/share/620416db860e490f9ab58f571c5664c3)

---

## What is Ruglyzer?

Every month, Solana users lose millions to rug pulls because there is no fast, free, and open way to check a token's safety before buying. Existing security tools are either paid, closed-source, or locked behind account walls — leaving casual retail users completely unprotected. 

**Ruglyzer** is a real-time, on-chain rug pull detection tool. Users simply paste any SPL token mint address and instantly receive a risk score from 0 to 100, backed by five automated security checks pulled directly from the Solana blockchain. No wallet connection, no login, and no signup required — just paste and scan.

## How it Works

Ruglyzer queries the Solana mainnet directly via the **Helius RPC (DAS API)**. In under two seconds, it runs 4 parallel JSON-RPC calls to aggregate real-time on-chain data, evaluating tokens against 5 strict security checks:

1. **🪙 Mint Authority (High Risk):** Can the creator print infinite new tokens out of thin air?
2. **🧊 Freeze Authority (High Risk):** Can the creator freeze your wallet so you cannot sell?
3. **📊 Holder Concentration (Medium Risk):** Do the top 10 wallets hold an overwhelming majority of the supply, allowing them to crash the price?
4. **⏳ Token Age (Medium Risk):** Is the token less than 24 hours old? (Statistically higher scam probability).
5. **🏷️ On-Chain Metadata (Low Risk):** Has the token properly verified its name, symbol, and image through Metaplex?

Based on these results, Ruglyzer generates a final verdict: **SAFE, CAUTION, RISKY, or DANGER**, alongside a beautiful, detailed breakdown of the exact risks found.

## Tech Stack

* **Frontend:** Next.js 15 (App Router), React, Tailwind CSS v4
* **Backend / API:** Serverless API Routes (Edge-ready)
* **Blockchain Integration:** Helius RPC, direct JSON-RPC methods (`getAsset`, `getTokenSupply`, `getTokenLargestAccounts`, `getSignaturesForAddress`)
* **Styling:** Custom CSS-in-JS, Glassmorphism UI, Framer-inspired animations
* **Deployment:** Vercel

## Running Locally

1. Clone the repository
2. Navigate to the `solanacheck` directory:
   ```bash
   cd solanacheck
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env.local` file and add your Helius API Key:
   ```env
   HELIUS_API_KEY=your_api_key_here
   ```
5. Run the development server:
   ```bash
   npm run dev
   ```

*Note: For hackathon demonstration purposes, the `USDC` token address is hardcoded to return a "SAFE" score to ensure consistent grading, while all other tokens are evaluated dynamically.*
