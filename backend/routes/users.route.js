import express from "express";
// import { getPin, postPin, updatePin, deletePin } from "../controllers/pin.controller.js";
import { sendFriendRequest, acceptFriendRequest, rejectFriendRequest, addFriend, removeFriend, getFriendsList, getAllUsers, getUserByUsername, postUser, logUser } from "../controllers/user.controller.js"

const router = express.Router();

router.get('/', getAllUsers);
router.get('/:username', getUserByUsername);
router.post('/register', postUser);
router.post('/login', logUser);
// router.post('/:username/friends/:friendUsername', addFriend);
router.delete('/:username/friends/:friendUsername', removeFriend);
router.get('/:username/friends', getFriendsList);
router.post('/:username/friends/request/:friendUsername', sendFriendRequest);
router.post('/:username/friends/accept/:friendUsername', acceptFriendRequest);
router.post('/:username/friends/reject/:friendUsername', rejectFriendRequest);
// router.delete('/:id', deletePin);

export default router;