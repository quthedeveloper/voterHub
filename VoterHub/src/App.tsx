import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./styles/global.css";
import { AuthProvider } from "./auth/AuthContext";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
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
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/create-poll" element={<CreatePollPage />} />
          <Route path="/poll-created" element={<PollCreatedPage />} />
          <Route path="/join-poll" element={<JoinPollPage />} />
          <Route path="/vote" element={<VotingPage />} />
          <Route path="/vote-confirmation" element={<VoteConfirmationPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/poll-details" element={<PollDetailsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}