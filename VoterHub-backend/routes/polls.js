import { Router } from "express";
import { requireOrganizer } from "../middlewares/requireOrganizer.js";
import { authLimiter, voteLimiter } from "../middlewares/rateLimits.js";
import {
  createPoll,
  listMyPolls,
  updatePoll,
  getPollByReference,
  getPollPublic,
  checkEligibility,
  castVote,
  listEligibleVoters,
  addEligibleVoters,
  removeEligibleVoter,
  getResults,
} from "../controllers/polls.js";

const PollsRouter = Router();

// Organizer-only
PollsRouter.post("/polls", authLimiter, requireOrganizer, createPoll);
PollsRouter.get("/polls", requireOrganizer, listMyPolls);
PollsRouter.patch("/polls/:id", requireOrganizer, updatePoll);
PollsRouter.get("/polls/:id/eligible-voters", requireOrganizer, listEligibleVoters);
PollsRouter.post("/polls/:id/eligible-voters", authLimiter, requireOrganizer, addEligibleVoters);
PollsRouter.delete("/polls/:id/eligible-voters/:evId", requireOrganizer, removeEligibleVoter);

// Public vote flow (server enforces every rule)
PollsRouter.get("/polls/reference/:ref", getPollByReference);
PollsRouter.get("/polls/:id", getPollPublic);
PollsRouter.get("/polls/:id/eligibility", checkEligibility);
PollsRouter.post("/polls/:id/vote", voteLimiter, castVote);
PollsRouter.get("/polls/:id/results", getResults);

export default PollsRouter;
