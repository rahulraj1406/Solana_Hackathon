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
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      glow: 'shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)]',
      badge: 'bg-emerald-500 text-white',
      progress: 'bg-emerald-400',
    },
    caution: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      glow: 'shadow-[0_0_40px_-10px_rgba(245,158,11,0.3)]',
      badge: 'bg-amber-500 text-white',
      progress: 'bg-amber-400',
    },
    risky: {
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/30',
      text: 'text-orange-400',
      glow: 'shadow-[0_0_40px_-10px_rgba(249,115,22,0.3)]',
      badge: 'bg-orange-500 text-white',
      progress: 'bg-orange-400',
    },
    danger: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-400',
      glow: 'shadow-[0_0_40px_-10px_rgba(239,68,68,0.3)]',
      badge: 'bg-red-500 text-white',
      progress: 'bg-red-500',
    },
  };

  const severityColors = {
    high: 'text-red-400 bg-red-500/10 border-red-500/20',
    medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    low: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  };

  return (
    <main className="min-h-screen bg-[#05050A] text-white relative flex flex-col items-center justify-center p-4 sm:p-8 overflow-x-hidden font-sans">
      {/* Dynamic Animated Background Mesh */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="absolute top-[10%] left-[20%] w-[600px] h-[600px] bg-purple-700/10 rounded-full blur-[140px] animate-blob" />
        <div className="absolute top-[30%] right-[20%] w-[500px] h-[500px] bg-blue-700/10 rounded-full blur-[140px] animate-blob animation-delay-2000" />
        <div className="absolute bottom-[10%] left-[40%] w-[700px] h-[700px] bg-emerald-700/10 rounded-full blur-[140px] animate-blob animation-delay-4000" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay" />
      </div>

      <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center z-10 animate-fade-in-up">
        
        {/* Header Section */}
        <div className="text-center mb-10 w-full flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-400 mb-8 backdrop-blur-md shadow-xl transition-all hover:bg-white/10">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            Live on Solana Mainnet via Helius RPC
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-br from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent drop-shadow-2xl">
            SolanaCheck
          </h1>
          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl text-center leading-relaxed font-light">
            Instant rug-pull risk analysis. Paste any SPL token address below to uncover hidden on-chain risks.
          </p>
        </div>

        {/* Main Glass Panel */}
        <div className="w-full bg-zinc-900/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl">
          
          {/* Input Area */}
          <div className="relative flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1 group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur-md opacity-25 group-focus-within:opacity-50 transition duration-500" />
              <input
                id="mint-input"
                value={mint}
                onChange={(e) => setMint(e.target.value.trim())}
                onKeyDown={handleKeyDown}
                placeholder="Enter token mint address..."
                className="relative w-full px-6 py-5 bg-black/40 border border-white/10 rounded-2xl text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 transition-all duration-300 font-mono text-base sm:text-lg shadow-inner"
              />
            </div>
            <button
              onClick={check}
              disabled={loading || !mint}
              className="relative w-full sm:w-auto px-10 py-5 rounded-2xl font-bold text-white shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden group bg-white/5 border border-white/10 hover:border-white/20"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10 flex items-center justify-center gap-3 text-lg">
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Analyzing...
                  </>
                ) : 'Analyze Token'}
              </span>
            </button>
          </div>

          {/* Quick test buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-zinc-500">
            <span>Test a token:</span>
            <button onClick={() => setMint('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')} className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all font-mono text-xs text-zinc-300">USDC (Safe)</button>
            <button onClick={() => setMint('DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263')} className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all font-mono text-xs text-zinc-300">BONK (Test)</button>
          </div>

          {/* Error State */}
          {error && (
            <div className="mt-8 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl animate-fade-in flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 text-red-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </div>
              <div>
                <h3 className="text-red-400 font-semibold mb-1">Analysis Failed</h3>
                <p className="text-red-300/80 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Loading Skeleton */}
          {loading && (
            <div className="mt-10 space-y-6 animate-pulse">
              <div className="h-48 bg-white/5 rounded-3xl" />
              <div className="grid grid-cols-1 gap-4">
                {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-white/5 rounded-2xl" />)}
              </div>
            </div>
          )}

          {/* Report Results */}
          {report && !loading && (
            <div className="mt-10 space-y-8 animate-fade-in-up">
              
              {/* Main Score Card */}
              <div className={`relative overflow-hidden rounded-3xl border p-8 sm:p-10 transition-all duration-500 ${verdictConfig[report.verdict].bg} ${verdictConfig[report.verdict].border} ${verdictConfig[report.verdict].glow}`}>
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <svg className="w-48 h-48" viewBox="0 0 24 24" fill="currentColor">
                    {report.verdict === 'safe' && <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>}
                    {(report.verdict === 'caution' || report.verdict === 'risky') && <path d="M12 2L1 21h22M12 6l7.5 13h-15M11 10h2v5h-2m0 2h2v2h-2"/>}
                    {report.verdict === 'danger' && <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>}
                  </svg>
                </div>

                <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-8">
                  <div className="text-center sm:text-left flex-1">
                    <h2 className="text-4xl font-extrabold mb-2 tracking-tight">
                      {report.name ?? report.symbol ?? 'Unknown Token'}
                    </h2>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-4">
                      {report.symbol && (
                        <span className="px-3 py-1 bg-white/10 rounded-lg text-sm font-bold tracking-wider">
                          ${report.symbol}
                        </span>
                      )}
                      <span className="text-sm text-zinc-400 font-mono bg-black/20 px-3 py-1 rounded-lg">
                        {report.mint.slice(0, 8)}...{report.mint.slice(-8)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center sm:items-end">
                    <div className={`px-6 py-2 rounded-xl text-sm font-black tracking-widest uppercase shadow-lg mb-4 ${verdictConfig[report.verdict].badge}`}>
                      {report.verdict}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-7xl font-black tabular-nums tracking-tighter">{report.score}</span>
                      <span className="text-2xl text-zinc-500 font-bold">/100</span>
                    </div>
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mt-2">Risk Score</p>
                  </div>
                </div>

                {/* Score Progress Bar */}
                <div className="relative mt-10 z-10">
                  <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden backdrop-blur-md border border-white/5">
                    <div
                      className={`h-full rounded-full transition-all duration-1500 ease-out ${verdictConfig[report.verdict].progress}`}
                      style={{ width: `${Math.max(5, report.score)}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-3 text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-widest">
                    <span className="text-emerald-500/70">Safe (0-19)</span>
                    <span className="text-red-500/70">Danger (70+)</span>
                  </div>
                </div>
              </div>

              {/* Detailed Risk Checks */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest px-2 mb-6">
                  On-Chain Analysis Breakdown
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {report.checks.map((c, i) => (
                    <div
                      key={c.id}
                      className={`relative overflow-hidden p-6 rounded-2xl border backdrop-blur-md transition-all duration-300 hover:scale-[1.01] hover:-translate-y-1 ${
                        c.passed
                          ? 'border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10'
                          : 'border-red-500/20 bg-red-500/5 hover:bg-red-500/10'
                      }`}
                      style={{ animation: `fadeInUp 0.5s ease-out ${i * 0.1}s forwards`, opacity: 0 }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                            c.passed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/20 text-red-400 border border-red-500/20'
                          }`}>
                            {c.passed ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-lg text-white mb-1">{c.label}</h4>
                            <p className="text-sm text-zinc-400 leading-relaxed">{c.detail}</p>
                          </div>
                        </div>
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                          <span className={`text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border ${severityColors[c.severity]}`}>
                            {c.severity} RISK
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Timestamp */}
              <div className="text-center pt-6 border-t border-white/5">
                <p className="text-xs font-medium text-zinc-600">
                  Data analyzed on {new Date(report.timestamp).toLocaleString()} directly from Solana Mainnet
                </p>
              </div>

            </div>
          )}
        </div>

        {/* Global Footer */}
        <footer className="mt-12 text-center pb-12 z-10 animate-fade-in">
          <p className="text-sm text-zinc-500 font-medium">Built for Colosseum Frontier Hackathon 2026</p>
          <p className="text-xs text-zinc-600 mt-2 flex items-center justify-center gap-2">
            <span>Free forever</span>
            <span>&bull;</span>
            <span>Open Source</span>
            <span>&bull;</span>
            <span>No login required</span>
          </p>
        </footer>
      </div>

      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 10s infinite alternate;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fade-in {
          animation: fadeInUp 0.5s ease-out forwards;
        }
      `}</style>
    </main>
  );
}
