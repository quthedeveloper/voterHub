import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { homeForRole, type SessionUser } from "../lib/api";
import { LoginRequired, WrongRole } from "../components/AccessDenied";

type Role = SessionUser["role"];

function RouteLoading() {
  return (
    <div className="route-loading" aria-label="Loading">
      <div className="spinner" />
    </div>
  );
}

/**
 * Blocks unauthenticated visitors with a "you're not logged in" prompt
 * (log in, sign up, or go back — their choice). Signed-in users with the
 * wrong role get a clear warning and a redirect to their own home.
 */
export function ProtectedRoute({ roles }: { roles?: Role[] }) {
  const { user, initialized } = useAuth();
  const location = useLocation();

  if (!initialized) return <RouteLoading />;
  if (!user) {
    return <LoginRequired from={location.pathname} />;
  }
  if (roles && !roles.includes(user.role)) {
    return <WrongRole actualRole={user.role} />;
  }
  return <Outlet />;
}

/** Keeps signed-in users out of login/signup (sends them home instead). */
export function GuestRoute() {
  const { user, initialized } = useAuth();

  if (!initialized) return <RouteLoading />;
  if (user) return <Navigate to={homeForRole(user.role)} replace />;
  return <Outlet />;
}
