import Pin from "../models/pins.model.js";
import User from "../models/users.model.js";
import moongoose from "mongoose";

export const getPin = async (req, res) => {
  try {
    const { username } = req.query;
    
    // If no username is provided, return all pins (needed for backward compatibility)
    if (!username) {
      const pins = await Pin.find({});
      return res.status(200).json({ success: true, data: pins });
    }

    // Find the user and their friends
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Find pins that belong to the user or their friends
    const pins = await Pin.find({
      username: { $in: [username, ...user.friends] }
    });

    res.status(200).json({ success: true, data: pins });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


export const postPin = async (req, res) => {
  const pin = new Pin(req.body);
  if (!pin) {
    return res.status(400).json({ success: false, message: "Please provide all required fields" });
  }

  try {
    await pin.save();
    res.status(201).json({ success: true, data: pin });
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

export const getPinId = async (req, res) => {
  try {
    const { id } = req.params;
    if (!moongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid pin ID" });
    }

    const pin = await Pin.findById(id);
    if (!pin) {
      return res.status(404).json({ success: false, message: "Pin not found" });
    }

    res.status(200).json({ success: true, data: pin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export const addAssistant = async (req, res) => {
  try {
    const { id, username } = req.params;
    
    if (!moongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid pin ID" 
      });
    }

    const pin = await Pin.findById(id);
    if (!pin) {
      return res.status(404).json({ 
        success: false, 
        message: "Event not found" 
      });
    }

    if (pin.assistants.includes(username)) {
      return res.status(400).json({
        success: false,
        message: "User is already an assistant"
      });
    }

    pin.assistants.push(username);
    await pin.save();

    res.status(200).json({
      success: true,
      data: pin
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

export const removeAssistant = async (req, res) => {
  try {
    const { id, username } = req.params;

    if (!moongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid pin ID" 
      });
    }

    const pin = await Pin.findById(id);
    if (!pin) {
      return res.status(404).json({ 
        success: false, 
        message: "Event not found" 
      });
    }

    if (!pin.assistants.includes(username)) {
      return res.status(400).json({
        success: false,
        message: "User is not an assistant"
      });
    }

    pin.assistants = pin.assistants.filter(assistant => assistant !== username);
    await pin.save();

    res.status(200).json({
      success: true,
      data: pin
    });
  } catch (error) {
    res.status(500).json({
      success: false, 
      message: error.message || "Internal server error"
    });
  }
};

const updatePinField = async (id, field, value, res) => {
  if (!moongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ 
      success: false, 
      message: "Invalid pin ID" 
    });
  }

  try {
    const updatedPin = await Pin.findByIdAndUpdate(
      id,
      { [field]: value },
      { 
        new: true,
        runValidators: true 
      }
    );

    if (!updatedPin) {
      return res.status(404).json({ 
        success: false, 
        message: "Pin not found" 
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedPin
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

export const updatePinTitle = async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  
  if (!title) {
    return res.status(400).json({
      success: false,
      message: "Title is required"
    });
  }
  
  await updatePinField(id, "title", title, res);
};

export const updatePinLocation = async (req, res) => {
  const { id } = req.params;
  const { location } = req.body;
  
  if (!location) {
    return res.status(400).json({
      success: false,
      message: "Location is required"
    });
  }
  
  await updatePinField(id, "location", location, res);
};

export const updatePinDate = async (req, res) => {
  const { id } = req.params;
  const { date } = req.body;
  
  if (!date) {
    return res.status(400).json({
      success: false,
      message: "Date is required"
    });
  }
  
  await updatePinField(id, "date", new Date(date), res);
};

export const updatePinDescription = async (req, res) => {
  const { id } = req.params;
  const { description } = req.body;
  
  if (!description) {
    return res.status(400).json({
      success: false,
      message: "Description is required"
    });
  }
  
  await updatePinField(id, "description", description, res);
};