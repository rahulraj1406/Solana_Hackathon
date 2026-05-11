'use client';
import { useState, useEffect } from 'react';
import { RiskReport } from '@/lib/types';

const checkMeta: Record<string, { question: string; icon: string }> = {
  'mint-authority': { question: 'Can creator inflate supply?', icon: '🪙' },
  'freeze-authority': { question: 'Can creator freeze wallets?', icon: '🧊' },
  'concentration': { question: 'Is supply well distributed?', icon: '📊' },
  'age': { question: 'How established is this token?', icon: '⏳' },
  'metadata': { question: 'Is token properly identified?', icon: '🏷️' },
};

function ScoreRing({ score, verdict }: { score: number; verdict: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    setVal(0);
    let cur = 0;
    const inc = score / 30;
    const t = setInterval(() => {
      cur += inc;
      if (cur >= score) { setVal(score); clearInterval(t); }
      else setVal(Math.round(cur));
    }, 30);
    return () => clearInterval(t);
  }, [score]);

  const r = 72, circ = 2 * Math.PI * r;
  const col = verdict === 'safe' ? '#22c55e' : verdict === 'caution' ? '#eab308' : verdict === 'risky' ? '#f97316' : '#ef4444';

  return (
    <div className="score-ring">
      <svg width="180" height="180" viewBox="0 0 180 180">
        <circle cx="90" cy="90" r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="10" />
        <circle cx="90" cy="90" r={r} fill="none" stroke={col} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ - (val / 100) * circ}
          transform="rotate(-90 90 90)"
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(0 0 8px ${col}40)` }}
        />
      </svg>
      <div className="score-ring-inner">
        <div className="score-num" style={{ color: col }}>{val}</div>
        <div className="score-label">/ 100 risk</div>
      </div>
    </div>
  );
}

export default function Home() {
  const [mint, setMint] = useState('');
  const [report, setReport] = useState<RiskReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [show, setShow] = useState(false);

  async function scan() {
    setLoading(true); setError(''); setReport(null); setShow(false);
    try {
      const r = await fetch(`/api/check/${mint}`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setReport(d);
      setTimeout(() => setShow(true), 60);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  const vd: Record<string, { col: string; label: string }> = {
    safe: { col: '#22c55e', label: 'SAFE' },
    caution: { col: '#eab308', label: 'CAUTION' },
    risky: { col: '#f97316', label: 'RISKY' },
    danger: { col: '#ef4444', label: 'DANGER' },
  };
  const v = report ? vd[report.verdict] : null;

  return (
    <main className="page">
      {/* BG */}
      <div className="bg-grid" />
      <div className="bg-glow bg-glow-1" />
      <div className="bg-glow bg-glow-2" />

      <div className="container">
        {/* HEADER */}
        <header className="header fade-in">
          <div className="badge">
            <span className="badge-dot" />
            Live on Solana Mainnet
          </div>
          <h1 className="logo">
            <span className="logo-rug">Rug</span>
            <span className="logo-lyzer">lyzer</span>
          </h1>
          <p className="tagline">
            On-chain rug pull detection. Scan any Solana token in seconds.
          </p>
        </header>

        {/* HOW IT WORKS — inspired by RugRadar's 3-step flow */}
        {!report && !loading && (
          <div className="steps fade-in d2">
            <div className="step">
              <div className="step-num">1</div>
              <h3>Paste address</h3>
              <p>Copy any SPL token mint from Birdeye, Jupiter, or pump.fun</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-num">2</div>
              <h3>We scan on-chain</h3>
              <p>4 parallel RPC calls hit Solana mainnet via Helius in real-time</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-num">3</div>
              <h3>Get risk score</h3>
              <p>A 0-100 score with 5 detailed security checks in under 2 seconds</p>
            </div>
          </div>
        )}

        {/* SEARCH */}
        <div className="search-wrap fade-in d1">
          <div className="search-box">
            <input
              id="mint-input"
              value={mint}
              onChange={e => setMint(e.target.value.trim())}
              onKeyDown={e => e.key === 'Enter' && mint && !loading && scan()}
              placeholder="Paste token mint address..."
              className="search-input"
            />
            <button id="scan-btn" onClick={scan} disabled={loading || !mint} className="scan-btn">
              {loading ? (
                <><span className="spinner" /> Scanning...</>
              ) : (
                <>🔍 Scan Token</>
              )}
            </button>
          </div>
          <div className="quick-tokens">
            <span>Try:</span>
            {[
              { l: 'USDC', a: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' },
              { l: 'BONK', a: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263' },
            ].map(t => (
              <button key={t.l} onClick={() => setMint(t.a)} className="quick-btn">{t.l}</button>
            ))}
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="error-card fade-in">
            <span>⚠️</span>
            <div><strong>Scan failed</strong><p>{error}</p></div>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="loading-card fade-in">
            <div className="loading-spinner" />
            <p>Querying Solana blockchain...</p>
            <p className="loading-sub">Scanning mint authority, freeze authority, holders, age & metadata</p>
          </div>
        )}

        {/* RESULTS */}
        {report && !loading && (
          <div className={`results ${show ? 'results-show' : ''}`}>

            {/* Score card */}
            <div className="score-card" style={{ borderColor: `${v?.col}25` }}>
              <div className="score-card-glow" style={{ background: v?.col }} />

              <div className="score-card-body">
                <ScoreRing score={report.score} verdict={report.verdict} />
                <div className="score-info">
                  <span className="verdict-badge" style={{ background: `${v?.col}18`, color: v?.col, borderColor: `${v?.col}30` }}>
                    {v?.label}
                  </span>
                  <h2 className="token-name">
                    {report.name ?? report.symbol ?? 'Unknown Token'}
                  </h2>
                  <div className="token-meta">
                    {report.symbol && <span className="token-symbol">${report.symbol}</span>}
                    <span className="token-addr">{report.mint.slice(0, 6)}…{report.mint.slice(-6)}</span>
                  </div>
                  <p className="score-hint">Lower score = safer token</p>
                </div>
              </div>

              {/* Score bar */}
              <div className="score-bar-wrap">
                <div className="score-bar-bg">
                  <div className="score-bar-fill" style={{ width: `${Math.max(3, report.score)}%`, background: v?.col }} />
                </div>
                <div className="score-bar-labels">
                  <span style={{ color: '#22c55e' }}>Safe</span>
                  <span style={{ color: '#eab308' }}>Caution</span>
                  <span style={{ color: '#f97316' }}>Risky</span>
                  <span style={{ color: '#ef4444' }}>Danger</span>
                </div>
              </div>
            </div>

            {/* Checks */}
            <h3 className="checks-title">Security Analysis — 5 On-Chain Checks</h3>
            <div className="checks-grid">
              {report.checks.map((c, i) => (
                <div key={c.id} className="check-card" style={{ animationDelay: `${i * 80}ms`, borderColor: c.passed ? '#22c55e15' : '#ef444415' }}>
                  <div className={`check-icon ${c.passed ? 'check-pass' : 'check-fail'}`}>
                    {c.passed ? '✓' : '✗'}
                  </div>
                  <div className="check-body">
                    <div className="check-header">
                      <span className="check-emoji">{checkMeta[c.id]?.icon}</span>
                      <h4>{c.label}</h4>
                      <span className={`sev sev-${c.severity}`}>{c.severity}</span>
                    </div>
                    <p className="check-question">{checkMeta[c.id]?.question}</p>
                    <p className="check-detail">{c.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="timestamp">
              Scanned {new Date(report.timestamp).toLocaleString()} · Real-time from Solana mainnet via Helius RPC
            </p>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className="footer">
        <p><strong>Ruglyzer</strong> · Colosseum Frontier Hackathon 2026</p>
        <p className="footer-sub">Free · Open Source · No wallet needed · Not financial advice</p>
      </footer>

      <style jsx global>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', system-ui, -apple-system, sans-serif; background: #07070e; color: #fff; -webkit-font-smoothing: antialiased; }

        .page { min-height: 100vh; display: flex; flex-direction: column; align-items: center; position: relative; overflow-x: hidden; }

        /* Background */
        .bg-grid { position: fixed; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px); background-size: 48px 48px; pointer-events: none; }
        .bg-glow { position: fixed; border-radius: 50%; filter: blur(120px); pointer-events: none; animation: drift 25s ease-in-out infinite alternate; }
        .bg-glow-1 { width: 600px; height: 600px; top: -15%; left: 5%; background: rgba(239,68,68,0.07); }
        .bg-glow-2 { width: 500px; height: 500px; bottom: -10%; right: 5%; background: rgba(249,115,22,0.06); animation-delay: -12s; }
        @keyframes drift { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(30px,-40px) scale(1.05)} }

        /* Container */
        .container { position: relative; z-index: 1; width: 100%; max-width: 800px; padding: 48px 20px 32px; display: flex; flex-direction: column; align-items: center; }

        /* Header */
        .header { text-align: center; margin-bottom: 40px; }
        .badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 16px; border-radius: 100px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); font-size: 13px; color: #71717a; margin-bottom: 24px; }
        .badge-dot { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.2)} }
        .logo { font-size: clamp(52px, 12vw, 96px); font-weight: 900; letter-spacing: -3px; line-height: 1; margin-bottom: 16px; }
        .logo-rug { background: linear-gradient(180deg, #fff 30%, #a1a1aa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .logo-lyzer { background: linear-gradient(180deg, #fb923c, #ef4444); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .tagline { font-size: 17px; color: #52525b; max-width: 440px; line-height: 1.6; font-weight: 300; }

        /* Steps */
        .steps { display: flex; align-items: stretch; gap: 12px; width: 100%; margin-bottom: 36px; }
        .step { flex: 1; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 20px; text-align: center; transition: all .3s; }
        .step:hover { border-color: rgba(255,255,255,0.1); transform: translateY(-2px); }
        .step-num { width: 32px; height: 32px; border-radius: 10px; background: linear-gradient(135deg, #fb923c, #ef4444); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px; margin: 0 auto 12px; }
        .step h3 { font-size: 14px; font-weight: 700; margin-bottom: 6px; }
        .step p { font-size: 12px; color: #52525b; line-height: 1.5; }
        .step-arrow { display: flex; align-items: center; color: #3f3f46; font-size: 20px; font-weight: 300; }

        /* Search */
        .search-wrap { width: 100%; margin-bottom: 12px; }
        .search-box { display: flex; gap: 8px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 6px; transition: border-color .3s; }
        .search-box:focus-within { border-color: rgba(249,115,22,0.3); }
        .search-input { flex: 1; background: transparent; border: none; outline: none; color: #fff; font-family: 'SF Mono', 'Fira Code', monospace; font-size: 15px; padding: 14px 16px; }
        .search-input::placeholder { color: #3f3f46; }
        .scan-btn { padding: 14px 28px; border-radius: 12px; border: none; background: linear-gradient(135deg, #fb923c, #ef4444); color: #fff; font-weight: 700; font-size: 15px; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all .2s; white-space: nowrap; }
        .scan-btn:hover { transform: scale(1.02); filter: brightness(1.1); }
        .scan-btn:active { transform: scale(0.98); }
        .scan-btn:disabled { opacity: 0.3; cursor: not-allowed; transform: none; }
        .spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin .6s linear infinite; display: inline-block; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .quick-tokens { display: flex; align-items: center; gap: 8px; padding: 8px 4px; font-size: 12px; color: #3f3f46; }
        .quick-btn { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 4px 12px; color: #71717a; font-family: monospace; font-size: 12px; cursor: pointer; transition: all .2s; }
        .quick-btn:hover { color: #fff; border-color: rgba(255,255,255,0.15); background: rgba(255,255,255,0.05); }

        /* Error */
        .error-card { width: 100%; display: flex; gap: 12px; align-items: flex-start; padding: 16px 20px; background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.15); border-radius: 14px; margin-bottom: 16px; }
        .error-card strong { color: #ef4444; font-size: 14px; }
        .error-card p { color: #fca5a5; font-size: 13px; margin-top: 2px; }

        /* Loading */
        .loading-card { width: 100%; text-align: center; padding: 48px 20px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; }
        .loading-spinner { width: 40px; height: 40px; border: 3px solid rgba(249,115,22,0.2); border-top-color: #f97316; border-radius: 50%; animation: spin .8s linear infinite; margin: 0 auto 16px; }
        .loading-card p { color: #71717a; font-size: 14px; }
        .loading-sub { font-size: 12px !important; color: #3f3f46 !important; margin-top: 6px; }

        /* Results */
        .results { width: 100%; opacity: 0; transform: translateY(16px); transition: all .6s cubic-bezier(.16,1,.3,1); }
        .results-show { opacity: 1; transform: translateY(0); }

        /* Score card */
        .score-card { position: relative; overflow: hidden; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 24px; padding: 36px; margin-bottom: 24px; }
        .score-card-glow { position: absolute; top: -60px; right: -60px; width: 200px; height: 200px; border-radius: 50%; filter: blur(80px); opacity: 0.12; }
        .score-card-body { position: relative; z-index: 1; display: flex; align-items: center; gap: 36px; flex-wrap: wrap; justify-content: center; }
        .score-ring { position: relative; width: 180px; height: 180px; flex-shrink: 0; }
        .score-ring-inner { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .score-num { font-size: 52px; font-weight: 900; line-height: 1; font-variant-numeric: tabular-nums; }
        .score-label { font-size: 12px; color: #52525b; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; margin-top: 4px; }
        .score-info { flex: 1; min-width: 200px; text-align: left; }
        .verdict-badge { display: inline-block; padding: 5px 14px; border-radius: 8px; font-size: 11px; font-weight: 900; letter-spacing: 2px; border: 1px solid; margin-bottom: 12px; }
        .token-name { font-size: 32px; font-weight: 800; letter-spacing: -1px; margin-bottom: 8px; }
        .token-meta { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px; }
        .token-symbol { padding: 3px 10px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 6px; font-size: 13px; font-weight: 700; color: #d4d4d8; }
        .token-addr { padding: 3px 10px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); border-radius: 6px; font-size: 12px; font-family: monospace; color: #52525b; }
        .score-hint { font-size: 12px; color: #3f3f46; }
        .score-bar-wrap { position: relative; z-index: 1; margin-top: 28px; }
        .score-bar-bg { width: 100%; height: 6px; background: rgba(255,255,255,0.04); border-radius: 100px; overflow: hidden; }
        .score-bar-fill { height: 100%; border-radius: 100px; animation: grow 1.2s cubic-bezier(.16,1,.3,1) forwards; }
        @keyframes grow { from { width: 0%; } }
        .score-bar-labels { display: flex; justify-content: space-between; margin-top: 6px; font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }

        /* Checks */
        .checks-title { font-size: 12px; font-weight: 700; color: #3f3f46; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 14px; align-self: flex-start; width: 100%; }
        .checks-grid { width: 100%; display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
        .check-card { display: flex; gap: 14px; align-items: flex-start; padding: 18px 20px; background: rgba(255,255,255,0.015); border: 1px solid rgba(255,255,255,0.04); border-radius: 16px; animation: slideUp .5s cubic-bezier(.16,1,.3,1) both; transition: all .25s; }
        .check-card:hover { transform: translateY(-1px); border-color: rgba(255,255,255,0.08); background: rgba(255,255,255,0.025); }
        @keyframes slideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .check-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 16px; flex-shrink: 0; }
        .check-pass { background: rgba(34,197,94,0.1); color: #22c55e; border: 1px solid rgba(34,197,94,0.15); }
        .check-fail { background: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.15); }
        .check-body { flex: 1; min-width: 0; }
        .check-header { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; flex-wrap: wrap; }
        .check-emoji { font-size: 15px; }
        .check-header h4 { font-size: 15px; font-weight: 700; }
        .sev { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; padding: 2px 8px; border-radius: 6px; }
        .sev-high { color: #ef4444; background: rgba(239,68,68,0.1); }
        .sev-medium { color: #eab308; background: rgba(234,179,8,0.1); }
        .sev-low { color: #60a5fa; background: rgba(96,165,250,0.1); }
        .check-question { font-size: 12px; color: #52525b; font-style: italic; margin-bottom: 4px; }
        .check-detail { font-size: 13px; color: #a1a1aa; line-height: 1.5; }

        .timestamp { text-align: center; font-size: 11px; color: #27272a; margin-top: 8px; }

        /* Footer */
        .footer { position: relative; z-index: 1; width: 100%; text-align: center; padding: 28px 20px; border-top: 1px solid rgba(255,255,255,0.03); margin-top: auto; }
        .footer p { font-size: 12px; color: #3f3f46; }
        .footer strong { color: #52525b; }
        .footer-sub { font-size: 11px; color: #27272a; margin-top: 4px; }

        /* Animations */
        .fade-in { animation: fadeIn .7s cubic-bezier(.16,1,.3,1) both; }
        .d1 { animation-delay: .1s; }
        .d2 { animation-delay: .2s; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }

        /* Selection */
        ::selection { background: rgba(249,115,22,0.25); color: #fff; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 10px; }

        /* Responsive */
        @media (max-width: 640px) {
          .steps { flex-direction: column; }
          .step-arrow { justify-content: center; transform: rotate(90deg); }
          .score-card-body { flex-direction: column; text-align: center; }
          .score-info { text-align: center; }
          .token-meta { justify-content: center; }
          .container { padding-top: 32px; }
        }
      `}</style>
    </main>
  );
}
