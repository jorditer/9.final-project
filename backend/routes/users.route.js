import express from "express";
// import { getPin, postPin, updatePin, deletePin } from "../controllers/pin.controller.js";
import { getUserByUsername, postUser, logUser } from "../controllers/user.controller.js"

const router = express.Router();

router.get('/:username', getUserByUsername);
router.post('/register', postUser);
router.post('/login', logUser);
// router.put('/:id', updatePin);
// router.delete('/:id', deletePin);

export default router;