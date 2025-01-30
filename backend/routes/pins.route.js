import express from "express";
import { 
  addAssistant, 
  removeAssistant, 
  getPinId, 
  deletePin, 
  postPin, 
  getPin,
  updatePinTitle,
  updatePinLocation,
  updatePinDate,
  updatePinDescription
} from "../controllers/pin.controller.js"

const router = express.Router();

router.get('/', getPin);
router.post('/', postPin);
router.get('/:id', getPinId);
router.delete('/:id', deletePin);
router.post('/:id/assistants/:username', addAssistant);
router.delete('/:id/assistants/:username', removeAssistant);
router.patch('/:id/title', updatePinTitle);
router.patch('/:id/location', updatePinLocation);
router.patch('/:id/date', updatePinDate);
router.patch('/:id/description', updatePinDescription);

export default router;