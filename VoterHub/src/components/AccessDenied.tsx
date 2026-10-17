import { useNavigate } from "react-router-dom";
import { LogIn, UserPlus, ArrowLeft, LayoutDashboard, Vote } from "lucide-react";
import { ShieldCheckSvg, UsersSvg } from "./illustrations";
import type { SessionUser } from "../lib/api";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";

type Role = SessionUser["role"];

/**
 * Shown instead of a protected page when nobody is signed in.
 * Gives the visitor the choice: log in, create an account, or go back.
 */
export function LoginRequired({ from }: { from: string }) {
  const navigate = useNavigate();

  return (
    <AlertDialog open>
      <AlertDialogContent onEscapeKeyDown={(e) => e.preventDefault()}>
        <div className="ui-alert-art">
          <ShieldCheckSvg width={84} height={84} title="Login required" />
        </div>
        <AlertDialogHeader className="ui-alert-header-center">
          <p className="ui-alert-eyebrow">Restricted area</p>
          <AlertDialogTitle>You&apos;re not logged in</AlertDialogTitle>
          <AlertDialogDescription>
            This page needs an account. Log in to continue, or create a free
            account if you&apos;re new here.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="ui-alert-footer-col">
          <Button onClick={() => navigate("/login", { state: { from } })}>
            <LogIn size={16} /> Log in
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/signup")}
          >
            <UserPlus size={16} /> Create account
          </Button>
        </AlertDialogFooter>
        <button
          type="button"
          className="ui-alert-back"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={14} /> Go back
        </button>
      </AlertDialogContent>
    </AlertDialog>
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
    <AlertDialog open>
      <AlertDialogContent onEscapeKeyDown={(e) => e.preventDefault()}>
        <div className="ui-alert-art">
          <UsersSvg width={84} height={84} title="Wrong role" />
        </div>
        <AlertDialogHeader className="ui-alert-header-center">
          <p className="ui-alert-eyebrow">Heads up</p>
          <AlertDialogTitle>
            {isVoter ? "Organizers only" : "Voters only"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isVoter
              ? "You're signed in as a voter, and this area is for organizers. Head to the polls page instead."
              : "You're signed in as an organizer, and this area is for voters. Head to your dashboard instead."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="ui-alert-footer-col">
          <Button onClick={() => navigate(destination, { replace: true })}>
            {isVoter ? <Vote size={16} /> : <LayoutDashboard size={16} />}
            {destinationLabel}
          </Button>
        </AlertDialogFooter>
        <button
          type="button"
          className="ui-alert-back"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={14} /> Go back
        </button>
      </AlertDialogContent>
    </AlertDialog>
  );
}
