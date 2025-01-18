import User from "../models/users.model.js";
import moongoose from "mongoose";
import bcrypt from "bcrypt";

export const getUser = async (req, res) => {
  try {
    const user = await User.find({});
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
export const postUser = async (req, res) => {
  try {
    const existingUsername = await User.findOne({ username: req.body.username });
    if (existingUsername) {
      return res.status(409).json({ 
        success: false, 
        message: "Username already exists" 
      });
    }

    const existingEmail = await User.findOne({ email: req.body.email });
    if (existingEmail) {
      return res.status(409).json({ 
        success: false, 
        message: "Email already exists" 
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

export const logUser = async (req, res) => {
  try {
    const user = await User.findOne({username: req.body.username})
    !user && res.status(400).json("Incorrect user or password!")

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    !validPassword && res.status(400).json("Incorrect user or password!")

    res.status(200).json({_id: user._id, username: user.username, email: user.email})

  } catch(error) {
    console.error(error)
    res.status(500).json(error)
  }
}