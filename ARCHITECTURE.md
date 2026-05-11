# SolanaCheck — Architecture

## File structure

```
solanacheck/
├── app/
│   ├── layout.tsx              # root layout + Tailwind
│   ├── page.tsx                # main UI: input + result card
│   ├── globals.css             # Tailwind imports
│   └── api/
│       └── check/[mint]/
│           └── route.ts        # GET endpoint: returns risk analysis
├── lib/
│   ├── helius.ts               # Helius RPC client
│   ├── scoring.ts              # risk scoring logic
│   └── types.ts                # TypeScript interfaces
├── .env.example
├── .env.local                  # (gitignored)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.mjs
└── README.md
```

## Dependencies

```bash
npm install next@15 react@19 react-dom@19
npm install -D typescript @types/node @types/react tailwindcss postcss autoprefixer
```

No Solana SDK needed. We hit Helius REST endpoints directly via `fetch`.

## Environment variables

`.env.example`:
```
HELIUS_API_KEY=your_helius_key_here
```

Get a free key at helius.dev (no credit card).

## Type definitions

`lib/types.ts`:
```ts
export interface RiskCheck {
  id: string;
  label: string;
  passed: boolean;
  severity: 'low' | 'medium' | 'high';
  detail: string;
}

export interface RiskReport {
  mint: string;
  symbol: string | null;
  name: string | null;
  score: number;              // 0-100, lower = safer
  verdict: 'safe' | 'caution' | 'risky' | 'danger';
  checks: RiskCheck[];
  timestamp: string;
}
```

## Helius client

`lib/helius.ts`:
```ts
const HELIUS_URL = `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;

async function rpc(method: string, params: any[]) {
  const res = await fetch(HELIUS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.result;
}

export async function getTokenMetadata(mint: string) {
  return rpc('getAsset', [mint]);
}

export async function getTopHolders(mint: string) {
  return rpc('getTokenLargestAccounts', [mint]);
}

export async function getTokenSupply(mint: string) {
  return rpc('getTokenSupply', [mint]);
}

export async function getSignatures(address: string) {
  return rpc('getSignaturesForAddress', [address, { limit: 1000 }]);
}
```

## Risk scoring logic

`lib/scoring.ts`:
```ts
import { RiskCheck, RiskReport } from './types';
import { getTokenMetadata, getTopHolders, getTokenSupply, getSignatures } from './helius';

export async function analyzeToken(mint: string): Promise<RiskReport> {
  const [asset, holders, supply, sigs] = await Promise.all([
    getTokenMetadata(mint),
    getTopHolders(mint),
    getTokenSupply(mint),
    getSignatures(mint).catch(() => []),
  ]);

  const checks: RiskCheck[] = [];

  // 1. Mint authority check
  const mintAuthority = asset?.token_info?.mint_authority;
  checks.push({
    id: 'mint-authority',
    label: 'Mint authority renounced',
    passed: !mintAuthority,
    severity: 'high',
    detail: mintAuthority
      ? 'Creator can still mint new tokens — high inflation risk'
      : 'Mint authority renounced — supply is fixed',
  });

  // 2. Freeze authority check
  const freezeAuthority = asset?.token_info?.freeze_authority;
  checks.push({
    id: 'freeze-authority',
    label: 'Freeze authority renounced',
    passed: !freezeAuthority,
    severity: 'high',
    detail: freezeAuthority
      ? 'Creator can freeze your wallet at any time'
      : 'Freeze authority renounced — wallet is safe',
  });

  // 3. Top holder concentration
  const totalSupply = Number(supply?.value?.uiAmount ?? 0);
  const top10 = (holders?.value ?? []).slice(0, 10);
  const top10Sum = top10.reduce((acc: number, h: any) => acc + Number(h.uiAmount ?? 0), 0);
  const top10Pct = totalSupply > 0 ? (top10Sum / totalSupply) * 100 : 0;
  checks.push({
    id: 'concentration',
    label: 'Holder distribution',
    passed: top10Pct < 50,
    severity: top10Pct > 80 ? 'high' : 'medium',
    detail: `Top 10 holders own ${top10Pct.toFixed(1)}% of supply`,
  });

  // 4. Token age check
  const oldestSig = sigs[sigs.length - 1];
  const ageDays = oldestSig?.blockTime
    ? Math.floor((Date.now() / 1000 - oldestSig.blockTime) / 86400)
    : 0;
  checks.push({
    id: 'age',
    label: 'Token age',
    passed: ageDays > 30,
    severity: ageDays < 7 ? 'high' : 'medium',
    detail: ageDays < 1
      ? 'Token less than 24 hours old — extreme caution'
      : `Token is ${ageDays} days old`,
  });

  // 5. Verified metadata
  const hasMetadata = !!(asset?.content?.metadata?.name);
  checks.push({
    id: 'metadata',
    label: 'Has on-chain metadata',
    passed: hasMetadata,
    severity: 'low',
    detail: hasMetadata
      ? `Verified metadata: ${asset.content.metadata.name}`
      : 'No on-chain metadata found',
  });

  // Compute score (0-100, lower = safer)
  const weights = { high: 30, medium: 15, low: 5 };
  const totalRisk = checks
    .filter((c) => !c.passed)
    .reduce((acc, c) => acc + weights[c.severity], 0);
  const score = Math.min(100, totalRisk);

  const verdict =
    score < 20 ? 'safe' : score < 45 ? 'caution' : score < 70 ? 'risky' : 'danger';

  return {
    mint,
    symbol: asset?.token_info?.symbol ?? null,
    name: asset?.content?.metadata?.name ?? null,
    score,
    verdict,
    checks,
    timestamp: new Date().toISOString(),
  };
}
```

## API route

`app/api/check/[mint]/route.ts`:
```ts
import { NextRequest, NextResponse } from 'next/server';
import { analyzeToken } from '@/lib/scoring';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ mint: string }> }
) {
  const { mint } = await params;

  if (!mint || mint.length < 32 || mint.length > 44) {
    return NextResponse.json({ error: 'Invalid mint address' }, { status: 400 });
  }

  try {
    const report = await analyzeToken(mint);
    return NextResponse.json(report);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? 'Analysis failed' },
      { status: 500 }
    );
  }
}
```

## Frontend page

`app/page.tsx`:
```tsx
'use client';
import { useState } from 'react';
import { RiskReport } from '@/lib/types';

export default function Home() {
  const [mint, setMint] = useState('');
  const [report, setReport] = useState<RiskReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function check() {
    setLoading(true);
    setError('');
    setReport(null);
    try {
      const res = await fetch(`/api/check/${mint}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setReport(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const verdictColors = {
    safe: 'bg-green-500',
    caution: 'bg-yellow-500',
    risky: 'bg-orange-500',
    danger: 'bg-red-500',
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">SolanaCheck</h1>
        <p className="text-zinc-400 mb-8">
          Paste any Solana token address. Get instant rug-pull risk analysis.
        </p>

        <div className="flex gap-2 mb-8">
          <input
            value={mint}
            onChange={(e) => setMint(e.target.value.trim())}
            placeholder="Token mint address..."
            className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg"
          />
          <button
            onClick={check}
            disabled={loading || !mint}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? 'Checking…' : 'Check'}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-900/30 border border-red-800 rounded-lg mb-4">
            {error}
          </div>
        )}

        {report && (
          <div className="space-y-4">
            <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-2xl font-bold">
                    {report.name ?? report.symbol ?? 'Unknown token'}
                  </div>
                  <div className="text-sm text-zinc-500 font-mono">
                    {report.mint.slice(0, 8)}…{report.mint.slice(-6)}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`inline-block px-4 py-2 rounded-lg ${verdictColors[report.verdict]}`}>
                    {report.verdict.toUpperCase()}
                  </div>
                  <div className="text-3xl font-bold mt-2">Score: {report.score}/100</div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {report.checks.map((c) => (
                <div
                  key={c.id}
                  className={`p-4 rounded-lg border ${
                    c.passed ? 'border-green-800 bg-green-900/20' : 'border-red-800 bg-red-900/20'
                  }`}
                >
                  <div className="flex items-center gap-2 font-medium">
                    {c.passed ? '✓' : '✗'} {c.label}
                  </div>
                  <div className="text-sm text-zinc-400 mt-1">{c.detail}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
```

## Deployment

1. Push to GitHub (public repo)
2. Connect Vercel → import repo
3. Add `HELIUS_API_KEY` env var
4. Deploy

## Risk scoring weights (tunable)

| Severity | Weight | Used for |
|---|---|---|
| high | 30 | Mint authority, freeze authority |
| medium | 15 | Holder concentration, brand new token |
| low | 5 | Missing metadata |

Score ranges:
- 0-19: safe (green)
- 20-44: caution (yellow)
- 45-69: risky (orange)
- 70-100: danger (red)
