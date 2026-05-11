# SolanaCheck — Working Guide

> How to run it, how it works, and how to pitch it.

---

## Part 1 — How to run it (5 minutes)

### Prerequisites
- Node.js 20+
- A free Helius API key from https://helius.dev (signup takes 30 sec)

### Setup

```bash
# 1. Create the project
npx create-next-app@latest solanacheck --typescript --tailwind --app --no-src-dir --no-eslint
cd solanacheck

# 2. Create the file structure
mkdir -p lib app/api/check/[mint]

# 3. Copy the code from ARCHITECTURE.md into the matching files:
#    - lib/types.ts
#    - lib/helius.ts
#    - lib/scoring.ts
#    - app/api/check/[mint]/route.ts
#    - app/page.tsx

# 4. Create .env.local
echo "HELIUS_API_KEY=your_key_here" > .env.local

# 5. Run
npm run dev
```

Open `http://localhost:3000`.

### Test addresses

| Token | Address | Expected |
|---|---|---|
| USDC | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` | Safe (green) |
| BONK | `DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263` | Caution/Safe |
| Random pump.fun token | (paste any new memecoin) | Risky/Danger |

### Deploy to Vercel

```bash
# Push to GitHub first
git init && git add -A && git commit -m "init"
gh repo create solanacheck --public --push --source .

# Then go to vercel.com, import repo, add HELIUS_API_KEY env var, deploy
```

Live in ~2 minutes.

---

## Part 2 — How it actually works (understand it deeply)

### The user journey

```
User pastes mint address
        ↓
Browser sends GET /api/check/<mint>
        ↓
Server makes 4 parallel calls to Helius (Solana mainnet RPC)
        ↓
Server computes 5 risk checks
        ↓
Server returns JSON: { score, verdict, checks[] }
        ↓
Browser renders the result card
```

Total time: ~2-3 seconds.

### The 5 risk checks explained

**1. Mint authority renounced (HIGH severity)**
- *What it checks:* Is `mint_authority` set on the token?
- *Why it matters:* If the creator still controls minting, they can print infinite tokens and dump them on holders.
- *Pass condition:* `mint_authority === null`

**2. Freeze authority renounced (HIGH severity)**
- *What it checks:* Is `freeze_authority` set?
- *Why it matters:* If set, the creator can freeze your wallet, preventing you from selling.
- *Pass condition:* `freeze_authority === null`

**3. Holder concentration (MEDIUM severity)**
- *What it checks:* What percent of supply do the top 10 wallets own?
- *Why it matters:* If 10 wallets own 80%, they can crash the price by selling.
- *Pass condition:* Top 10 hold less than 50% of supply

**4. Token age (MEDIUM severity)**
- *What it checks:* How old is the token's first transaction?
- *Why it matters:* Most rugs happen within days of launch. Older tokens have survived longer.
- *Pass condition:* Older than 30 days

**5. On-chain metadata (LOW severity)**
- *What it checks:* Does the token have a name + symbol via Metaplex?
- *Why it matters:* Legit projects bother to set metadata. Shadow rugs often don't.
- *Pass condition:* Metadata name exists

### Scoring math

```
score = sum of weights of FAILED checks
- HIGH severity fail: +30
- MEDIUM severity fail: +15
- LOW severity fail: +5

Max score: 100 (all checks fail)
Min score: 0 (all checks pass)
```

Verdict bands:
- 0-19 → safe
- 20-44 → caution
- 45-69 → risky
- 70-100 → danger

---

## Part 3 — How it uses Solana (the integration story)

This is what you'll be asked. Be precise.

### What it does with Solana

SolanaCheck reads token data directly from the Solana blockchain via JSON-RPC calls. Specifically:

| RPC Method | What we read | Why |
|---|---|---|
| `getAsset` | Token metadata, mint authority, freeze authority | The two highest-severity rug indicators |
| `getTokenLargestAccounts` | Top 20 holders by balance | Compute supply concentration |
| `getTokenSupply` | Total token supply | Denominator for concentration math |
| `getSignaturesForAddress` | Transaction history | Compute token age |

### What it does NOT need

- No private keys
- No wallet connection
- No on-chain transactions
- No custom Solana program
- No SPL token interactions beyond reading

### Why this is the right level of Solana integration

For a one-hour build, deep on-chain interaction would be a mistake. Reading on-chain data is the strongest minimum-viable Solana use: it proves you understand Solana primitives (mints, authorities, SPL token program) without requiring you to deploy code on-chain.

### The Solana primitives we touch

- **SPL Token program** — every token on Solana is an account owned by the SPL Token program
- **Mint accounts** — store authority info, supply, decimals
- **Token accounts** — store balances for holders
- **Metaplex metadata** — off-chain JSON pointer + on-chain name/symbol

We never write to chain. We only read.

---

## Part 4 — The 3-minute pitch (10 slides)

### Slide 1 — Title

```
SolanaCheck
Instant rug-pull risk analysis for any Solana token

[Your name] · Colosseum Frontier · 2026
```

### Slide 2 — The problem

```
THE PROBLEM

Rug pulls drain millions from Solana users every month.

Users have no easy way to check a token before they buy.

Existing tools are:
- Paid (Solsniffer)
- Behind logins (GoPlus)
- Closed-source (Birdeye Premium)

The result: people lose money on tokens that any analyst
would have flagged in 5 seconds.
```

### Slide 3 — The solution

```
SOLANACHECK

Paste any Solana token mint address.
Get an instant risk score with clear reasons.

Free. Open-source. No login. No wallet needed.

Built in one hour. Works in production today.
```

### Slide 4 — Live demo

```
LIVE DEMO

[Screen-share the app]

1. Paste USDC address → green, score 5/100
2. Paste a random pump.fun token → red, score 85/100
3. Walk through the 5 checks visible on screen
```

This is where you spend the most time. **At least 60 seconds of pure demo.**

### Slide 5 — How it works

```
HOW IT WORKS

User pastes mint address
    ↓
Backend queries Helius RPC (Solana mainnet)
    ↓
4 parallel JSON-RPC calls:
  - getAsset
  - getTokenLargestAccounts
  - getTokenSupply
  - getSignaturesForAddress
    ↓
5 risk checks computed
    ↓
Score 0-100 + verdict returned

Total time: ~2 seconds
```

### Slide 6 — The 5 risk checks

```
WHAT WE CHECK

1. Mint authority renounced     [HIGH]
   Can the creator print more tokens?

2. Freeze authority renounced    [HIGH]
   Can the creator freeze your wallet?

3. Holder concentration          [MEDIUM]
   Do 10 wallets own 50%+ of supply?

4. Token age                     [MEDIUM]
   Less than 30 days old?

5. On-chain metadata             [LOW]
   Does the token bother to identify itself?
```

### Slide 7 — Why it uses Solana

```
SOLANA INTEGRATION

Reads on-chain data via Helius RPC:
- SPL Token program accounts
- Mint authority + freeze authority fields
- Token holder accounts (top 20 by balance)
- Metaplex metadata
- Transaction signatures for age

No wallet required. No on-chain writes.
No custom programs. Pure read-side analysis.

This is the right starting point — every additional
check can be added without changing the architecture.
```

### Slide 8 — Impact

```
IMPACT

Who this helps:
- New Solana users buying their first memecoins
- Crypto Twitter traders evaluating shilled tokens
- Wallet vendors who could integrate the API

What it prevents:
- Buying tokens with active mint authority (silent inflation)
- Buying tokens with freeze authority (instant lockup)
- Buying tokens where 10 wallets can dump the price

If 1% of pump.fun buyers used this, that's millions saved monthly.
```

### Slide 9 — Roadmap

```
WHAT'S NEXT

v1 (today):  5 risk checks, web UI, free
v2:          ML model trained on labeled rugs (better than rules)
v3:          Chrome extension that flags tokens in Phantom
v4:          API for wallet vendors and trading bots
v5:          On-chain attestations via Solana Attestation Service
             (other apps can subscribe to our flags)
```

### Slide 10 — Close

```
SOLANACHECK

Free. Open-source. Solana-native.

Try it:  solanacheck.vercel.app
Code:    github.com/[you]/solanacheck

Thank you.
```

---

## Part 5 — Demo script (60 seconds, word for word)

> "Hi, I'm [name]. I built SolanaCheck."
>
> "Anyone can paste a Solana token address into this app and instantly see whether it's safe to buy."
>
> [Paste USDC]
>
> "USDC — verified, safe, score 5 out of 100. All five checks pass. Mint authority renounced. Freeze authority renounced. Healthy holder distribution. Established token."
>
> [Paste a random pump.fun token]
>
> "Now a random new memecoin. Score 75 out of 100 — danger. Mint authority is still active, meaning the creator can print more tokens any time. Freeze authority active, meaning they can lock your wallet. Top 10 wallets own 91% of supply. Three days old."
>
> "Under the hood, SolanaCheck makes four parallel calls to the Solana blockchain via Helius RPC — pulling token metadata, holder distribution, supply, and transaction history. We run five risk checks and return a score in under two seconds."
>
> "It's free, open-source, no wallet needed, no login. Built in an hour for Frontier."
>
> "Try it at solanacheck.vercel.app. Thank you."

---

## Part 6 — Submission checklist

- [ ] Code pushed to public GitHub repo
- [ ] README.md filled out
- [ ] Live deployment URL works
- [ ] Test with 3 different tokens before submitting
- [ ] Record 90-second Loom demo
- [ ] Submit to Colosseum platform with:
  - Project name: SolanaCheck
  - One-line pitch: "Instant rug-pull risk analysis for any Solana token"
  - GitHub URL
  - Live demo URL
  - Loom video URL
- [ ] Tweet a screenshot to build-in-public

---

## Part 7 — If something breaks (debug guide)

**"Invalid mint address"**
- Token addresses are 32-44 characters. Check yours.

**"Analysis failed" / 500 error**
- Check Helius API key is set in `.env.local`
- Check Helius dashboard — free tier has rate limits
- Some pump.fun tokens have no holders yet → `getTokenLargestAccounts` returns empty

**Vercel deployment fails**
- Make sure `HELIUS_API_KEY` env var is set in Vercel dashboard
- Re-deploy after adding env var

**Score seems wrong**
- The scoring is intentionally strict. New tokens default to "risky" because that's true.
- Tune weights in `lib/scoring.ts` if needed.

---

## Part 8 — Honest assessment

You built this in one hour. That's the story.

**What's strong:**
- Working product, real on-chain data, useful output
- Clear Solana integration
- Submitted (90% of hackathon entries don't finish)

**What's weak:**
- No ML (rules only)
- No wallet integration
- 5 checks is the floor, not the ceiling
- Doesn't catch sophisticated rugs (sandwich attacks, honeypots)

**Don't oversell it.** Judges see through that. Pitch it as "the minimum viable safety check that should exist for every Solana token."

That framing wins more than fake ambition.
