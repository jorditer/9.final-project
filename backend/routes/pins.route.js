import express from "express";
// import { getPin, postPin, updatePin, deletePin } from "../controllers/pin.controller.js";
import { addAssistant, removeAssistant, getPinId, deletePin, postPin, getPin } from "../controllers/pin.controller.js"

const router = express.Router();

router.get('/', getPin);
router.post('/', postPin);
router.get('/:id', getPinId);
router.delete('/:id', deletePin);
router.post('/:id/assistants/:username', addAssistant);
router.delete('/:id/assistants/:username', removeAssistant);

export default router;