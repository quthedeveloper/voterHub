import { Link } from "react-router-dom";
import { CheckCircle2, FileText, Building2, Briefcase, GraduationCap } from "lucide-react";
import { Typewriter } from  "react-simple-typewriter";
// import CountUp from "react-countup";
import { useState, useEffect } from "react";
import "./LandingPage.css";
import {FaqSection} from "../components/Faq.tsx";
import GetStartedSection from "../components/GetStarted.tsx";

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



export default function LandingPage() {
  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="logo">
          <CheckCircle2 size={25}  color="rgba(7, 9, 11, 0.45)"/>
          VoteHub
        </div>
        <div className="landing-nav-cta">
          <Link to="/login" className="btn btn-outline btn-sm">Log In</Link>
          <Link to="/signup" className="btn btn-primary btn-sm">Get Started</Link>
        </div>
      </nav>

      <div className="landing-container">
        {/* HERO — one box: background image + gradient overlay + text on top */}
        <header
          className="landing-hero"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1619059617660-d42ec4abe29a?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}
        >
          <div className="landing-hero-overlay" />
          <div className="landing-hero-content">
            <p className="landing-eyebrow">MODERN VOTING PLATFORM</p>
            <h1>
                <Typewriter
                  words={['Create Polls.', 'Share.', 'Vote.']}
                  loop={0}
                  cursor
                  cursorStyle="_"
                  typeSpeed={100}
                deleteSpeed={50}
                delaySpeed={1000}
              />
            </h1>
            <p className="landing-sub">
              Simple, secure and reliable. Create polls, manage elections, and get real-time
              results all in one place.
            </p>
            <div className="landing-hero-ctas">
              <Link to="/create-poll" className="btn btn-primary btn-primary-2">Create a Poll</Link>
              <Link to="/join-poll" className="btn btn-outline landing-outline-on-dark">Join a Poll</Link>
            </div>
          </div>
        </header>

        {/* STATS — its own rounded card */}
        <div className="landing-stats-bar">
            <div>
    <strong><CountUpValue end={12481} duration={2000} separator /></strong>
    <span>Polls created</span>
  </div>
  <div>
    <strong><CountUpValue end={348} duration={2000} /></strong>
    <span>Active polls</span>
  </div>
  <div>
    <strong><CountUpValue end={98.7} duration={2000} decimals={1} suffix="%" /></strong>
    <span>Voter satisfaction</span>
  </div>
        </div>

        {/* VOICE — side-by-side image + text, inside one rounded card */}
        <section className="landing-voice"style={{ marginBottom: 0 }}>
          <div
            className="landing-voice-image"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1764173039610-aecaafe54ef4?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}
          />
          <div className="landing-voice-text">
            <p className="landing-eyebrow">SIMPLE. SECURE. RELIABLE.</p>
            <h2 className="landing-voice-headings" style={{ fontSize: '48px' }}>
              <Typewriter
                words={['Your Voice Matters']}
                loop={1}
                cursor
                cursorStyle="_"
                typeSpeed={100}
                deleteSpeed={50}
                delaySpeed={1000}
              />


            </h2>
            <p className="landing-sub-2">
              From team decisions to campus elections, VoteHub makes it easy to collect opinions
              and make better decisions.
            </p>
          </div>
        </section>
        <FaqSection />
        <GetStartedSection />
      </div>

      {/* FOOTER — wavy top edge */}
      <footer className="landing-footer">
        <svg className="landing-footer-wave" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0,64 C240,110 480,10 720,40 C960,70 1200,110 1440,48 L1440,120 L0,120 Z" />
        </svg>
        <p className="landing-footer-lead">Trusted by teams, schools, and organizations</p>
        <div className="landing-footer-icons">
          <span><Building2 size={16} /> Organizations</span>
          <span><Briefcase size={16} /> Businesses</span>
          <span><FileText size={16} /> Communities</span>
          <span><GraduationCap size={16} /> Educational Institutions</span>
        </div>
      </footer>
    </div>
  );
}