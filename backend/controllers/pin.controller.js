import Pin from "../models/pins.model.js";
import moongoose from "mongoose";

export const getPin = async (req, res) => {
  try {
    const pins = await Pin.find({});
    res.status(200).json({ success: true, data: pins });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
export const postPin = async (req, res) => {
  const pin = new Pin(req.body);
  console.log(pin);
  if (!pin) {
    return res.status(400).json({ success: false, message: "Please provide all required fields" });
  }
  const newPin = new Pin(pin);

  try {
    await newPin.save();
    res.status(201).json({ success: true, data: newPin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const deletePin = async (req, res) => {
  try {
    const { id } = req.params;
    if (!moongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid pin ID" });
    }

    const deletedPin = await Pin.findByIdAndDelete(id);
    if (!deletedPin) {
      return res.status(404).json({ success: false, message: "Pin not found" });
    }

    res.status(200).json({ success: true, data: deletedPin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};