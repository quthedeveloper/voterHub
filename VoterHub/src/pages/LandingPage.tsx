import { Link } from "react-router-dom";
import { CheckCircle2, FileText, Building2, Briefcase, GraduationCap, ShieldCheck, ArrowUpRight } from "lucide-react";
import { useState, useEffect } from "react";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./LandingPage.css";
import { FaqSection } from "../components/Faq.tsx";
import GetStartedSection from "../components/GetStarted.tsx";
import SponsorsSection from "../components/Sponsors.tsx";
import UserMenu from "../components/UserMenu";
import { useAuth } from "../auth/AuthContext";
import { BallotBoxSvg, ChartBarsSvg, UsersSvg } from "../components/illustrations";

function useCountUp(end: number, duration = 2000) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    let frame: number;
    const step = (timestamp: number) => {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setValue(progress * end);
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [end, duration]);
  return value;
}

function CountUpValue({ end, duration = 2000, decimals = 0, suffix = "", separator = false }: {
  end: number; duration?: number; decimals?: number; suffix?: string; separator?: boolean;
}) {
  const value = useCountUp(end, duration);
  const rounded = value.toFixed(decimals);
  const display = separator ? Number(rounded).toLocaleString() : rounded;
  return <>{display}{suffix}</>;
}

const HERO_BG = "https://images.unsplash.com/photo-1619059617660-d42ec4abe29a?q=80&w=1600&auto=format&fit=crop";
const VOICE_IMG = "https://images.unsplash.com/photo-1764173039610-aecaafe54ef4?q=80&w=1170&auto=format&fit=crop";

const STEPS = [
  { n: "01", title: "Create", text: "Set up your poll in minutes — questions, options, and voting rules." },
  { n: "02", title: "Share", text: "Send a link or poll code. No account needed for open votes." },
  { n: "03", title: "Count", text: "Watch results land in real time, then export them when polls close." },
];

export default function LandingPage() {
  const { user, initialized } = useAuth();

  return (
    <div className="landing">
      {/* NAV */}
      <nav className="vh-nav">
        <div className="vh-nav-inner">
          <div className="logo vh-logo">
            <CheckCircle2 size={24} />
            VoteHub
          </div>
          <div className="vh-nav-links">
            <a href="#how-it-works">How it works</a>
            <a href="#sponsors">Sponsors</a>
            <a href="#faq">FAQ</a>
          </div>
          <div className="vh-nav-cta">
            {!initialized ? (
              <span className="vh-nav-placeholder" aria-hidden="true" />
            ) : user ? (
              <UserMenu />
            ) : (
              <>
                <Link to="/login" className="vh-btn vh-btn-ghost vh-btn-sm">Log in</Link>
                <Link to="/signup" className="vh-btn vh-btn-red vh-btn-sm">Get started</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className="vh-hero" style={{ backgroundImage: `url('${HERO_BG}')` }}>
        <div className="vh-hero-shade" />
        <div className="vh-inner vh-hero-inner">
          <p className="vh-eyebrow">Modern voting platform</p>
          <div className="vh-hero-grid">
            <h1>
              Next-gen voting
              <br />
              for growing
              <br />
              communities.
            </h1>
            <div className="vh-hero-side">
              <p>
                Simple, secure, reliable. Create polls, run elections, and get
                real-time results — all in one place.
              </p>
              <div className="vh-hero-ctas">
                <Link to="/create-poll" className="vh-btn vh-btn-red">
                  Create a poll <ArrowUpRight size={16} />
                </Link>
                <Link to="/join-poll" className="vh-btn vh-btn-ghost">
                  Join a poll
                </Link>
              </div>
            </div>
          </div>
          <div className="vh-hero-meta">
            <span>Secure</span>
            <span>Anonymous</span>
            <span>Real-time results</span>
          </div>
        </div>
      </header>

      {/* STATS */}
      <section className="vh-band vh-band-light">
        <div className="vh-inner">
          <p className="vh-eyebrow">By the numbers</p>
          <div className="vh-stats">
            <div className="vh-stat">
              <BallotBoxSvg width={30} height={30} title="Polls created" />
              <strong><CountUpValue end={12481} duration={2000} separator /></strong>
              <span>Polls created</span>
            </div>
            <div className="vh-stat">
              <ChartBarsSvg width={30} height={30} title="Active polls" />
              <strong><CountUpValue end={348} duration={2000} /></strong>
              <span>Active polls</span>
            </div>
            <div className="vh-stat">
              <UsersSvg width={30} height={30} title="Voter satisfaction" />
              <strong><CountUpValue end={98.7} duration={2000} decimals={1} suffix="%" /></strong>
              <span>Voter satisfaction</span>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="vh-band vh-band-light vh-band-tight" id="how-it-works">
        <div className="vh-inner">
          <p className="vh-eyebrow">How it works</p>
          <h2 className="vh-h2">
            Your voice,
            <br />
            counted.
          </h2>
          <div className="vh-voice-grid">
            <div className="vh-voice-media" style={{ backgroundImage: `url('${VOICE_IMG}')` }}>
              <div className="vh-voice-badge">
                <ShieldCheck size={24} />
                <div>
                  <strong>Secure &amp; anonymous</strong>
                  <span>Every ballot stays private</span>
                </div>
              </div>
            </div>
            <div className="vh-voice-text">
              <p className="vh-lead">
                From team decisions to campus elections, VoteHub makes it easy
                to collect opinions and make better decisions together.
              </p>
              <div className="vh-steps">
                {STEPS.map((s) => (
                  <div key={s.n} className="vh-step">
                    <span className="vh-step-n">{s.n}</span>
                    <div>
                      <strong>{s.title}</strong>
                      <p>{s.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SPONSORS */}
      <SponsorsSection />

      {/* FAQ — full-bleed band */}
      <div className="vh-band vh-band-faq">
        <div className="vh-inner">
          <FaqSection />
        </div>
      </div>

      {/* CTA */}
      <GetStartedSection />

      {/* FOOTER */}
      <footer className="vh-footer">
        <div className="vh-inner">
          <div className="logo vh-logo">
            <CheckCircle2 size={24} />
            VoteHub
          </div>
          <p className="vh-footer-lead">Trusted by teams, schools, and organizations</p>
          <div className="vh-footer-icons">
            <span><Building2 size={16} /> Organizations</span>
            <span><Briefcase size={16} /> Businesses</span>
            <span><FileText size={16} /> Communities</span>
            <span><GraduationCap size={16} /> Educational Institutions</span>
          </div>
          <p className="vh-footer-fine">© 2026 VoteHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
