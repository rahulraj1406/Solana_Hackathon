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
