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

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && mint && !loading) check();
  }

  const verdictConfig = {
    safe: {
      bg: 'bg-emerald-500/20',
      border: 'border-emerald-500/40',
      text: 'text-emerald-400',
      glow: 'shadow-emerald-500/20',
      badge: 'bg-emerald-500',
    },
    caution: {
      bg: 'bg-amber-500/20',
      border: 'border-amber-500/40',
      text: 'text-amber-400',
      glow: 'shadow-amber-500/20',
      badge: 'bg-amber-500',
    },
    risky: {
      bg: 'bg-orange-500/20',
      border: 'border-orange-500/40',
      text: 'text-orange-400',
      glow: 'shadow-orange-500/20',
      badge: 'bg-orange-500',
    },
    danger: {
      bg: 'bg-red-500/20',
      border: 'border-red-500/40',
      text: 'text-red-400',
      glow: 'shadow-red-500/20',
      badge: 'bg-red-500',
    },
  };

  const severityColors = {
    high: 'text-red-400',
    medium: 'text-amber-400',
    low: 'text-blue-400',
  };

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden">
      {/* Animated background gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/8 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/8 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] bg-blue-600/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* Grid pattern overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-400 mb-6 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Powered by Solana Mainnet via Helius RPC
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
            SolanaCheck
          </h1>
          <p className="text-lg text-zinc-400 max-w-lg mx-auto leading-relaxed">
            Paste any Solana token address. Get instant rug-pull risk analysis
            powered by real on-chain data.
          </p>
        </div>

        {/* Search input */}
        <div className="relative mb-10">
          <div className="flex gap-3">
            <div className="relative flex-1 group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/30 to-cyan-600/30 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
              <input
                id="mint-input"
                value={mint}
                onChange={(e) => setMint(e.target.value.trim())}
                onKeyDown={handleKeyDown}
                placeholder="Enter token mint address..."
                className="relative w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 transition-all duration-300 font-mono text-sm backdrop-blur-sm"
              />
            </div>
            <button
              id="check-button"
              onClick={check}
              disabled={loading || !mint}
              className="relative px-8 py-4 rounded-xl font-semibold text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-600 transition-all duration-300 group-hover:from-purple-500 group-hover:to-cyan-500" />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-600 blur-xl opacity-50 group-hover:opacity-80 transition-opacity duration-300" />
              <span className="relative z-10">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Analyzing
                  </span>
                ) : (
                  'Check Token'
                )}
              </span>
            </button>
          </div>

          {/* Quick test addresses */}
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="text-xs text-zinc-600">Try:</span>
            <button
              onClick={() => setMint('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')}
              className="text-xs text-zinc-500 hover:text-purple-400 transition-colors cursor-pointer font-mono"
            >
              USDC
            </button>
            <span className="text-zinc-700">·</span>
            <button
              onClick={() => setMint('DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263')}
              className="text-xs text-zinc-500 hover:text-purple-400 transition-colors cursor-pointer font-mono"
            >
              BONK
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div id="error-display" className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-red-400">✕</span>
              </div>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4 animate-pulse">
            <div className="h-40 bg-white/5 border border-white/10 rounded-2xl" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-20 bg-white/5 border border-white/10 rounded-xl" />
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {report && !loading && (
          <div className="space-y-5 animate-in">
            {/* Score card */}
            <div className={`relative p-8 rounded-2xl border backdrop-blur-sm ${verdictConfig[report.verdict].bg} ${verdictConfig[report.verdict].border} shadow-2xl ${verdictConfig[report.verdict].glow}`}>
              <div className="flex items-start justify-between">
                <div>
                  <h2 id="token-name" className="text-2xl font-bold mb-1">
                    {report.name ?? report.symbol ?? 'Unknown Token'}
                  </h2>
                  <p className="text-sm text-zinc-400 font-mono">
                    {report.mint.slice(0, 12)}…{report.mint.slice(-8)}
                  </p>
                  {report.symbol && (
                    <span className="inline-block mt-2 px-3 py-1 text-xs font-medium bg-white/10 rounded-full text-zinc-300">
                      ${report.symbol}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <div className={`inline-block px-5 py-2 rounded-xl text-sm font-bold text-white ${verdictConfig[report.verdict].badge} shadow-lg`}>
                    {report.verdict.toUpperCase()}
                  </div>
                  <div className="mt-3">
                    <span className="text-5xl font-black tabular-nums">{report.score}</span>
                    <span className="text-xl text-zinc-500 font-medium">/100</span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">Risk Score (lower = safer)</p>
                </div>
              </div>

              {/* Score bar */}
              <div className="mt-6">
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${verdictConfig[report.verdict].badge}`}
                    style={{ width: `${report.score}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1.5 text-[10px] text-zinc-600">
                  <span>SAFE</span>
                  <span>CAUTION</span>
                  <span>RISKY</span>
                  <span>DANGER</span>
                </div>
              </div>
            </div>

            {/* Risk checks */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider px-1">
                Risk Analysis · {report.checks.length} Checks
              </h3>
              {report.checks.map((c, i) => (
                <div
                  key={c.id}
                  className={`p-5 rounded-xl border backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] ${
                    c.passed
                      ? 'border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10'
                      : 'border-red-500/20 bg-red-500/5 hover:bg-red-500/10'
                  }`}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                        c.passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {c.passed ? '✓' : '✕'}
                      </div>
                      <div>
                        <span className="font-semibold text-sm">{c.label}</span>
                        <p className="text-xs text-zinc-500 mt-0.5">{c.detail}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 ${severityColors[c.severity]}`}>
                      {c.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Timestamp */}
            <p className="text-center text-xs text-zinc-600 pt-2">
              Analyzed at {new Date(report.timestamp).toLocaleString()} · Data from Solana mainnet
            </p>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-white/5 text-center">
          <p className="text-xs text-zinc-600">
            SolanaCheck · Built for Colosseum Frontier Hackathon 2026 · Open Source
          </p>
          <p className="text-[10px] text-zinc-700 mt-2">
            All data read directly from Solana blockchain. No wallet required. No login. Free forever.
          </p>
        </footer>
      </div>

      <style jsx>{`
        .animate-in > * {
          animation: fadeSlideIn 0.4s ease-out forwards;
          opacity: 0;
          transform: translateY(10px);
        }
        .animate-in > *:nth-child(1) { animation-delay: 0ms; }
        .animate-in > *:nth-child(2) { animation-delay: 150ms; }
        .animate-in > *:nth-child(3) { animation-delay: 300ms; }
        @keyframes fadeSlideIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
}
