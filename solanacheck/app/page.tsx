'use client';
import { useState, useEffect } from 'react';
import { RiskReport } from '@/lib/types';

const checkDescriptions: Record<string, string> = {
  'mint-authority': 'Can creator print more tokens?',
  'freeze-authority': 'Can creator freeze your wallet?',
  'concentration': 'Is token supply well distributed?',
  'age': 'How long has token existed?',
  'metadata': 'Is token properly identified?',
};

function AnimatedScore({ score, verdict }: { score: number; verdict: string }) {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    setDisplayed(0);
    const duration = 1200;
    const steps = 40;
    const increment = score / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setDisplayed(score);
        clearInterval(timer);
      } else {
        setDisplayed(Math.round(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [score]);

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progress = (displayed / 100) * circumference;
  const verdictColor =
    verdict === 'safe' ? '#10b981' :
    verdict === 'caution' ? '#f59e0b' :
    verdict === 'risky' ? '#f97316' : '#ef4444';

  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      <svg className="w-48 h-48 -rotate-90" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={radius} stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="none" />
        <circle
          cx="80" cy="80" r={radius}
          stroke={verdictColor}
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-black tabular-nums" style={{ color: verdictColor }}>{displayed}</span>
        <span className="text-xs text-zinc-500 font-semibold tracking-widest uppercase mt-1">/ 100</span>
      </div>
    </div>
  );
}

export default function Home() {
  const [mint, setMint] = useState('');
  const [report, setReport] = useState<RiskReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResults, setShowResults] = useState(false);

  async function check() {
    setLoading(true);
    setError('');
    setReport(null);
    setShowResults(false);
    try {
      const res = await fetch(`/api/check/${mint}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setReport(data);
      setTimeout(() => setShowResults(true), 50);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && mint && !loading) check();
  }

  const verdictStyle: Record<string, { color: string; bg: string; border: string; label: string }> = {
    safe:    { color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)', label: 'SAFE' },
    caution: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)', label: 'CAUTION' },
    risky:   { color: '#f97316', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.25)', label: 'RISKY' },
    danger:  { color: '#ef4444', bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.25)',  label: 'DANGER' },
  };

  const v = report ? verdictStyle[report.verdict] : null;

  return (
    <main className="min-h-screen bg-[#030306] text-white relative flex flex-col items-center overflow-hidden">
      {/* === ANIMATED BACKGROUND === */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="fixed inset-0" style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.08) 0%, transparent 60%)',
        }} />
      </div>

      <div className="relative z-10 w-full max-w-3xl mx-auto px-5 py-16 sm:py-24 flex flex-col items-center">

        {/* === HEADER === */}
        <div className="fade-up text-center mb-14">
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/[0.03] border border-white/[0.06] text-[13px] text-zinc-500 mb-8 backdrop-blur-xl">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Connected to Solana Mainnet
          </div>
          <h1 className="text-6xl sm:text-8xl font-black tracking-tighter mb-5 leading-[0.9]">
            <span className="bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">Sol</span>
            <span className="bg-gradient-to-b from-indigo-400 to-purple-500 bg-clip-text text-transparent">Shield</span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-500 max-w-xl mx-auto leading-relaxed font-light">
            On-chain token intelligence for Solana. Detect rug pulls before they happen.
          </p>
        </div>

        {/* === SEARCH === */}
        <div className="fade-up delay-1 w-full mb-6">
          <div className="glass-panel p-2 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                id="mint-input"
                value={mint}
                onChange={(e) => setMint(e.target.value.trim())}
                onKeyDown={handleKeyDown}
                placeholder="Paste token mint address..."
                className="w-full px-5 py-4 bg-transparent border-0 text-white placeholder-zinc-600 focus:outline-none font-mono text-[15px] tracking-wide"
              />
            </div>
            <button
              id="analyze-button"
              onClick={check}
              disabled={loading || !mint}
              className="px-8 py-4 rounded-2xl font-bold text-[15px] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)' }}
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10 flex items-center justify-center gap-2.5">
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Scanning...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Analyze
                  </>
                )}
              </span>
            </button>
          </div>
        </div>

        {/* Quick test tokens */}
        <div className="fade-up delay-2 flex items-center gap-3 mb-14 text-xs">
          <span className="text-zinc-600">Quick test:</span>
          {[
            { label: 'USDC', addr: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', color: '#10b981' },
            { label: 'BONK', addr: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', color: '#f59e0b' },
          ].map((t) => (
            <button
              key={t.label}
              onClick={() => setMint(t.addr)}
              className="px-3.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300 font-mono text-zinc-400 hover:text-white"
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: t.color }} />
              {t.label}
            </button>
          ))}
        </div>

        {/* === ERROR === */}
        {error && (
          <div className="fade-up w-full glass-panel p-5 mb-8 flex items-start gap-4" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-red-400 font-semibold text-sm mb-0.5">Analysis Failed</h3>
              <p className="text-red-300/70 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* === LOADING === */}
        {loading && (
          <div className="w-full space-y-4">
            <div className="glass-panel p-10 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-sm text-zinc-500">Querying Solana blockchain...</p>
              </div>
            </div>
          </div>
        )}

        {/* === RESULTS === */}
        {report && !loading && (
          <div className={`w-full space-y-5 transition-all duration-700 ${showResults ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

            {/* Score Card */}
            <div
              className="glass-panel p-8 sm:p-10 relative overflow-hidden"
              style={{ borderColor: v?.border }}
            >
              {/* Glow effect */}
              <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-[80px] opacity-20" style={{ backgroundColor: v?.color }} />

              <div className="relative z-10 flex flex-col sm:flex-row items-center gap-8 sm:gap-12">
                {/* Circular Score */}
                <AnimatedScore score={report.score} verdict={report.verdict} />

                {/* Token Info */}
                <div className="flex-1 text-center sm:text-left">
                  <div
                    className="inline-block px-4 py-1.5 rounded-lg text-xs font-black tracking-[0.2em] uppercase mb-4"
                    style={{ backgroundColor: v?.bg, color: v?.color, border: `1px solid ${v?.border}` }}
                  >
                    {v?.label}
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
                    {report.name ?? report.symbol ?? 'Unknown Token'}
                  </h2>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-3">
                    {report.symbol && (
                      <span className="px-2.5 py-0.5 bg-white/[0.04] border border-white/[0.08] rounded-md text-sm font-bold text-zinc-300">
                        ${report.symbol}
                      </span>
                    )}
                    <span className="text-xs text-zinc-600 font-mono bg-white/[0.02] px-2.5 py-0.5 rounded-md border border-white/[0.05]">
                      {report.mint.slice(0, 6)}...{report.mint.slice(-6)}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600">
                    Lower score = safer token · Data from Solana mainnet
                  </p>
                </div>
              </div>

              {/* Score bar */}
              <div className="relative mt-8 z-10">
                <div className="w-full h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full score-bar"
                    style={{ width: `${Math.max(3, report.score)}%`, backgroundColor: v?.color }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-[10px] text-zinc-700 uppercase tracking-widest font-bold">
                  <span>Safe</span>
                  <span>Caution</span>
                  <span>Risky</span>
                  <span>Danger</span>
                </div>
              </div>
            </div>

            {/* Risk Checks */}
            <div>
              <h3 className="text-xs font-bold text-zinc-600 uppercase tracking-[0.15em] px-1 mb-4">
                On-Chain Security Analysis
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {report.checks.map((c, i) => (
                  <div
                    key={c.id}
                    className="check-card glass-panel p-5 flex items-start gap-4 group"
                    style={{
                      animationDelay: `${i * 80}ms`,
                      borderColor: c.passed ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                    }}
                  >
                    {/* Status icon */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                      style={{
                        backgroundColor: c.passed ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                        border: `1px solid ${c.passed ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}`,
                      }}
                    >
                      {c.passed ? (
                        <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-[15px] text-white">{c.label}</h4>
                        <span
                          className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md"
                          style={{
                            color: c.severity === 'high' ? '#ef4444' : c.severity === 'medium' ? '#f59e0b' : '#60a5fa',
                            backgroundColor: c.severity === 'high' ? 'rgba(239,68,68,0.1)' : c.severity === 'medium' ? 'rgba(245,158,11,0.1)' : 'rgba(96,165,250,0.1)',
                          }}
                        >
                          {c.severity}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600 italic mb-1.5">
                        {checkDescriptions[c.id] ?? 'Token security metric'}
                      </p>
                      <p className="text-sm text-zinc-400 leading-relaxed">{c.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timestamp */}
            <p className="text-center text-[11px] text-zinc-700 pt-2">
              Analyzed {new Date(report.timestamp).toLocaleString()} · Real-time data from Solana mainnet via Helius RPC
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="relative z-10 w-full mt-auto py-10 text-center border-t border-white/[0.03]">
        <p className="text-xs text-zinc-600 font-medium">SolShield · Colosseum Frontier Hackathon 2026</p>
        <p className="text-[11px] text-zinc-700 mt-1.5 flex items-center justify-center gap-1.5">
          <span>Free</span><span className="text-zinc-800">·</span>
          <span>Open Source</span><span className="text-zinc-800">·</span>
          <span>No wallet needed</span>
        </p>
      </footer>

      {/* === GLOBAL STYLES === */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(40px, -30px) scale(1.05); }
          50% { transform: translate(-20px, 40px) scale(0.95); }
          75% { transform: translate(30px, 20px) scale(1.02); }
        }
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          animation: float 20s ease-in-out infinite;
        }
        .orb-1 {
          width: 500px; height: 500px;
          top: -10%; left: 10%;
          background: rgba(99,102,241,0.12);
          animation-delay: 0s;
        }
        .orb-2 {
          width: 400px; height: 400px;
          top: 40%; right: 5%;
          background: rgba(168,85,247,0.08);
          animation-delay: -7s;
        }
        .orb-3 {
          width: 600px; height: 600px;
          bottom: -15%; left: 30%;
          background: rgba(16,185,129,0.06);
          animation-delay: -14s;
        }
        .glass-panel {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .glass-panel:hover {
          border-color: rgba(255,255,255,0.1);
        }
        .fade-up {
          animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .delay-1 { animation-delay: 0.1s; opacity: 0; }
        .delay-2 { animation-delay: 0.2s; opacity: 0; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .check-card {
          animation: fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .check-card:hover {
          transform: translateY(-2px);
        }
        .score-bar {
          animation: growBar 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes growBar {
          from { width: 0%; }
        }
        ::selection {
          background: rgba(99,102,241,0.3);
          color: white;
        }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 10px; }
      `}</style>
    </main>
  );
}
