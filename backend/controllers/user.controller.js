import User from "../models/users.model.js";
import moongoose from "mongoose";
import bcrypt from "bcrypt";

export const getAllUsers = async (req, res) => {
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
        message: "Username already exists",
      });
    }

    const existingEmail = await User.findOne({ email: req.body.email });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
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
      message: "Server error",
    });
  }
};

export const logUser = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Incorrect username",
      });
    }

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password",
      });
    }

    return res.status(200).json({
      success: true,
      username: user.username,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getUserByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    return res.status(200).json({ 
      success: true, 
      data: user 
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

export const addFriend = async (req, res) => {
  try {
    const { username } = req.params;
    const { friendUsername } = req.body;

    // Check if trying to add self as friend
    if (username === friendUsername) {
      return res.status(400).json({
        success: false,
        message: "Cannot add yourself as a friend"
      });
    }

    // Find both users
    const user = await User.findOne({ username });
    const friend = await User.findOne({ username: friendUsername });

    if (!user || !friend) {
      return res.status(404).json({
        success: false,
        message: "User or friend not found"
      });
    }

    // Check if already friends
    if (user.friends.includes(friendUsername)) {
      return res.status(400).json({
        success: false,
        message: "Already friends with this user"
      });
    }

    // Add friend to user's friends list
    user.friends.push(friendUsername);
    await user.save();

    // Add user to friend's friends list (mutual friendship)
    if (!friend.friends.includes(username)) {
      friend.friends.push(username);
      await friend.save();
    }

    res.status(200).json({
      success: true,
      message: "Friend added successfully",
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const removeFriend = async (req, res) => {
  try {
    const { username, friendUsername } = req.params;

    // Find both users
    const user = await User.findOne({ username });
    const friend = await User.findOne({ username: friendUsername });

    if (!user || !friend) {
      return res.status(404).json({
        success: false,
        message: "User or friend not found"
      });
    }

    // Remove friend from user's friends list
    user.friends = user.friends.filter(friend => friend !== friendUsername);
    await user.save();

    // Remove user from friend's friends list (mutual unfriending)
    friend.friends = friend.friends.filter(friend => friend !== username);
    await friend.save();

    res.status(200).json({
      success: true,
      message: "Friend removed successfully",
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const getFriendsList = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username })
      .select('friends')
      .populate('friends', 'username email -_id');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      data: user.friends
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};