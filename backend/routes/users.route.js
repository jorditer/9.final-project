import express from "express";
// import { getPin, postPin, updatePin, deletePin } from "../controllers/pin.controller.js";
import { addFriend, removeFriend, getFriendsList, getAllUsers, getUserByUsername, postUser, logUser } from "../controllers/user.controller.js"

const router = express.Router();

router.get('/', getAllUsers);
router.get('/:username', getUserByUsername);
router.post('/register', postUser);
router.post('/login', logUser);
router.post('/:username/friends', addFriend);
router.delete('/:username/friends/:friendUsername', removeFriend);
router.get('/:username/friends', getFriendsList);
// router.delete('/:id', deletePin);

export default router;