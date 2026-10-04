import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { homeForRole, type SessionUser } from "../lib/api";

type Role = SessionUser["role"];

function RouteLoading() {
  return (
    <div className="route-loading" aria-label="Loading">
      <div className="spinner" />
    </div>
  );
}

/**
 * Blocks unauthenticated visitors (redirects to /login, remembering where
 * they were headed). Pass `roles` to restrict to specific roles — anyone
 * signed in with the wrong role is sent to their own home page.
 */
export function ProtectedRoute({ roles }: { roles?: Role[] }) {
  const { user, initialized } = useAuth();
  const location = useLocation();

  if (!initialized) return <RouteLoading />;
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={homeForRole(user.role)} replace />;
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
