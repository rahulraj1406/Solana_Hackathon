# SolanaCheck

> Paste any Solana token address. Get an instant rug-pull risk score.

## What it does

SolanaCheck is a free web tool that analyzes any Solana SPL token and returns a risk score (0-100) with clear reasons. It helps users avoid rug pulls before they buy.

**Checks performed:**
- Mint authority (can the creator print more tokens?)
- Freeze authority (can the creator freeze your wallet?)
- Top 10 holder concentration (is supply too centralized?)
- Token age (brand new = higher risk)
- Liquidity presence (is there a tradable market?)

## Why it's useful

Rug pulls drain millions from Solana users every month. Most victims don't know what to check before buying a new token. Existing tools (Solsniffer, GoPlus) are either paid, closed-source, or hidden behind logins. SolanaCheck is free, open-source, and works in 3 seconds.

## How it uses Solana

SolanaCheck queries the Solana blockchain directly via Helius RPC to read on-chain token metadata:
- `getAsset` — fetches token mint info, authorities, supply
- `getTokenLargestAccounts` — fetches top holders
- `getSignaturesForAddress` — fetches token age from first transaction

All data is read from Solana mainnet in real time. No database, no caching, no third-party scraping. Pure on-chain analysis.

## Run locally

```bash
git clone <repo-url>
cd solanacheck
npm install
cp .env.example .env.local
# Add your free Helius API key from https://helius.dev
npm run dev
```

Open http://localhost:3000

## Try it

Paste any Solana token mint address:
- `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` (USDC — should be green/safe)
- A random new token from pump.fun (likely red/risky)

## Tech stack

- Next.js 15 + TypeScript
- Tailwind CSS
- Helius RPC for Solana data
- Deployed on Vercel

## Built for

Colosseum Frontier Hackathon 2026

## License

MIT
