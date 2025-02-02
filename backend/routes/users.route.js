import express from "express";
import { loginLimiter } from '../controllers/user.controller.js';
import authMiddleware from '../middleware/auth.js';
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getFriendsList,
  getAllUsers,
  getUserByUsername,
  postUser,
  logUser,
  refreshToken,
  logoutUser
} from "../controllers/user.controller.js";

const router = express.Router();

// Public routes
router.post("/register", postUser);
router.post("/login", loginLimiter, logUser);

// Protected routes
router.use(authMiddleware);  // Apply auth middleware to all routes below
router.get("/", getAllUsers);
router.get("/:username", getUserByUsername);
router.delete("/:username/friends/:friendUsername", removeFriend);
router.get("/:username/friends", getFriendsList);
router.post("/:username/friends/request/:friendUsername", sendFriendRequest);
router.post("/:username/friends/accept/:friendUsername", acceptFriendRequest);
router.post("/:username/friends/reject/:friendUsername", rejectFriendRequest);
router.post("/refresh-token", refreshToken);
router.post("/logout", logoutUser);

export default router;