import { CheckCircle2 } from "lucide-react";
import { ChartBarsSvg } from "../components/illustrations";
import "./ResultsPage.css";

const results = [
  { name: "Sarah Boateng", votes: 87, pct: 47.5 },
  { name: "John Mensah", votes: 61, pct: 33.3 },
  { name: "Michael Owusu", votes: 35, pct: 19.1 },
];

export default function ResultsPage() {
  return (
    <div className="results-page">
      <div className="results-card">
        <div className="results-header">
          <div className="logo"><span className="logo-mark"><CheckCircle2 size={16} /></span>VoteHub</div>
          <span className="badge badge-active"><span className="results-live-dot" />Live Results</span>
        </div>

        <div className="results-title-row">
          <h1>Student Council Election</h1>
          <span className="badge badge-active">Active</span>
        </div>
        <p className="muted" style={{ fontSize: 13, marginBottom: 20 }}>REF: UNI-2026-7K42</p>

        <div className="results-stats">
          <div className="card results-stat"><strong>247</strong><span>Eligible voters</span></div>
          <div className="card results-stat"><strong>183</strong><span>Votes cast</span></div>
          <div className="card results-stat"><strong>74.1%</strong><span>Turnout</span></div>
        </div>

        <h2 className="results-subtitle">
          <ChartBarsSvg width={26} height={26} title="Results chart" />
          Results
        </h2>
        <div className="results-list">
          {results.map((r, i) => (
            <div key={r.name} className={`results-row${i === 0 ? " results-winner" : ""}`}>
              <div className="results-row-top">
                <span><strong>{r.name}</strong>{i === 0 && <span className="results-winner-badge">Leading</span>}</span>
                <span className="results-pct">{r.votes} · {r.pct}%</span>
              </div>
              <div className="results-bar-track">
                <div className="results-bar-fill" style={{ width: `${r.pct}%`, animationDelay: `${i * 140}ms` }} />
              </div>
            </div>
          ))}
        </div>

        <p className="muted" style={{ fontSize: 12, marginTop: 20 }}>
          Results are shown in real-time. The poll will close in 2 days.
        </p>
      </div>
    </div>
  );
}
