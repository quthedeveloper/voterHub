import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./styles/global.css";
import { AuthProvider } from "./auth/AuthContext";
import { ProtectedRoute, GuestRoute } from "./auth/ProtectedRoute";
import { ToastProvider } from "./components/Toast";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import MyPollsPage from "./pages/MyPollsPage";
import CreatePollPage from "./pages/CreatePollPage";
import PollCreatedPage from "./pages/PollCreatedPage";
import JoinPollPage from "./pages/JoinPollPage";
import VotingPage from "./pages/VotingPage";
import VoteConfirmationPage from "./pages/VoteConfirmationPage";
import ResultsPage from "./pages/ResultsPage";
import PollDetailsPage from "./pages/PollDetailsPage";
import ProfilePage from "./pages/ProfilePage";

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/join-poll" element={<JoinPollPage />} />
          <Route path="/vote" element={<VotingPage />} />
          <Route path="/vote-confirmation" element={<VoteConfirmationPage />} />
          <Route path="/results" element={<ResultsPage />} />

          {/* Auth pages — signed-in users are bounced to their home */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>

          {/* Any signed-in user */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Organizers only */}
          <Route element={<ProtectedRoute roles={["organizer"]} />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/create-poll" element={<CreatePollPage />} />
            <Route path="/poll-created" element={<PollCreatedPage />} />
            <Route path="/poll-details" element={<PollDetailsPage />} />
            <Route path="/my-polls" element={<MyPollsPage />} />
            {/* Sidebar aliases: dedicated pages don't exist yet, so route to
                the nearest real destination instead of falling through to "*". */}
            <Route path="/settings" element={<Navigate to="/profile" replace />} />
          </Route>

          <Route path="*" element={<LandingPage />} />
        </Routes>
      </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
