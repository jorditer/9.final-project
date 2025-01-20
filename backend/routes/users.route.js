import express from "express";
// import { getPin, postPin, updatePin, deletePin } from "../controllers/pin.controller.js";
import { getAllUsers, getUserByUsername, postUser, logUser } from "../controllers/user.controller.js"

const router = express.Router();

router.get('/', getAllUsers);
router.get('/:username', getUserByUsername);
router.post('/register', postUser);
router.post('/login', logUser);
// router.delete('/:id', deletePin);

export default router;