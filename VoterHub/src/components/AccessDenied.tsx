import { Link, useNavigate } from "react-router-dom";
import { LogIn, UserPlus, ArrowLeft, LayoutDashboard, Vote } from "lucide-react";
import { ShieldCheckSvg, UsersSvg } from "./illustrations";
import type { SessionUser } from "../lib/api";
import "./AccessDenied.css";

type Role = SessionUser["role"];

/**
 * Shown instead of a protected page when nobody is signed in.
 * Gives the visitor the choice: log in, create an account, or go back.
 */
export function LoginRequired({ from }: { from: string }) {
  const navigate = useNavigate();

  return (
    <div className="access-denied-page">
      <div className="access-denied-card anim-pop-in">
        <div className="access-denied-art">
          <ShieldCheckSvg width={84} height={84} title="Login required" />
        </div>
        <p className="page-eyebrow" style={{ textAlign: "center" }}>Restricted area</p>
        <h1>You're not logged in</h1>
        <p className="muted">
          This page needs an account. Log in to continue, or create a free
          account if you're new here.
        </p>
        <div className="access-denied-actions">
          <Link
            to="/login"
            state={{ from }}
            className="btn btn-primary btn-full"
          >
            <LogIn size={16} /> Log in
          </Link>
          <Link to="/signup" className="btn btn-outline btn-full">
            <UserPlus size={16} /> Create account
          </Link>
        </div>
        <button
          type="button"
          className="access-denied-back"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={14} /> Go back
        </button>
      </div>
    </div>
  );
}

/**
 * Shown when a signed-in user's role doesn't match the page.
 * Warns them clearly, then sends them to their own home.
 */
export function WrongRole({ actualRole }: { actualRole: Role }) {
  const navigate = useNavigate();
  const isVoter = actualRole === "voter";
  const destination = isVoter ? "/join-poll" : "/dashboard";
  const destinationLabel = isVoter ? "Go to polls" : "Go to dashboard";

  return (
    <div className="access-denied-page">
      <div className="access-denied-card anim-pop-in">
        <div className="access-denied-art">
          <UsersSvg width={84} height={84} title="Wrong role" />
        </div>
        <p className="page-eyebrow" style={{ textAlign: "center" }}>Heads up</p>
        <h1>
          {isVoter ? "Organizers only" : "Voters only"}
        </h1>
        <p className="muted">
          {isVoter
            ? "You're signed in as a voter, and this area is for organizers. Head to the polls page instead."
            : "You're signed in as an organizer, and this area is for voters. Head to your dashboard instead."}
        </p>
        <div className="access-denied-actions">
          <button
            type="button"
            className="btn btn-primary btn-full"
            onClick={() => navigate(destination, { replace: true })}
          >
            {isVoter ? <Vote size={16} /> : <LayoutDashboard size={16} />}
            {destinationLabel}
          </button>
        </div>
        <button
          type="button"
          className="access-denied-back"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={14} /> Go back
        </button>
      </div>
    </div>
  );
}
