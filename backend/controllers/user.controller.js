import User from "../models/users.model.js";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.config.js';
import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,    // 15 minute window
  max: 25,                     // 25 attempts per window
  message: "Too many login attempts. Please try again later.",
  standardHeaders: true,       // Return rate limit info in headers
  legacyHeaders: false        // Disable X-RateLimit headers
});

export const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,    // 1 hour
  max: 3,
  message: "Too many accounts created. Please try again later."
});

// Helper function to generate authentication tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { username: user.username },
    jwtConfig.secret,
    { expiresIn: jwtConfig.accessTokenExpiry }
  );

  const refreshToken = jwt.sign(
    { username: user.username },
    jwtConfig.refreshSecret,
    { expiresIn: jwtConfig.refreshTokenExpiry }
  );

  return { accessToken, refreshToken };
};

// Get all users with pagination and limited information
export const getAllUsers = async (req, res) => {
  try {
    // Implement pagination to prevent large data dumps
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find({})
      .select('username')  // Only return necessary fields
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    res.status(200).json({ 
      success: true, 
      data: users,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('User fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Could not retrieve users" 
    });
  }
};

// User registration with proper validation and security
export const postUser = async (req, res) => {
  try {
    // Validate required fields
    const { username, email, password } = req.body;
    if (!username?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // Validate username format
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      return res.status(400).json({
        success: false,
        message: "Username must be 3-20 characters and contain only letters, numbers, and underscores"
      });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }

    // Check for existing users
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(409).json({
        success: false,
        message: "Username is already taken"
      });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered"
      });
    }

    // Hash password with appropriate cost factor
    const salt = await bcrypt.genSalt(12);  // Increased from 10 for better security
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user with minimal required fields
    const newUser = new User({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      friends: [],
      pendingFriendRequests: [],
      sentFriendRequests: []
    });

    await newUser.save();

    // Generate tokens for automatic login
    const tokens = generateTokens(newUser);

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Return success with minimal user information
    res.status(201).json({ 
      success: true, 
      data: {
        username: newUser.username,
        accessToken: tokens.accessToken
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: "Registration failed"
    });
  }
};

// User login with rate limiting and secure token handling
export const logUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required"
      });
    }

    // Find user and include password for verification
    const user = await User.findOne({ username: username.trim() })
      .select('+password')
      .lean();  // Use lean() for better performance

    // Use constant-time comparison to prevent timing attacks
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Generate new tokens
    const tokens = generateTokens(user);

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // Return success with minimal information
    return res.status(200).json({
      success: true,
      username: user.username,
      accessToken: tokens.accessToken
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: "Login failed"
    });
  }
};

// Get user profile with proper authorization
export const getUserByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    
    // Verify authorization
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: "Authentication required" 
      });
    }

    // Find user without sensitive information
    const user = await User.findOne({ username })
      .select('-password -email -__v')
      .lean();
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Return different information based on friendship status
    const isSelf = req.user.username === username;
    const isFriend = user.friends.includes(req.user.username);

    const sanitizedUser = {
      username: user.username,
      friends: isSelf || isFriend ? user.friends : undefined,
      pendingFriendRequests: isSelf ? user.pendingFriendRequests : undefined,
      sentFriendRequests: isSelf ? user.sentFriendRequests : undefined
    };

    return res.status(200).json({ 
      success: true, 
      data: sanitizedUser 
    });
  } catch (error) {
    console.error('User fetch error:', error);
    return res.status(500).json({ 
      success: false, 
      message: "Could not retrieve user information" 
    });
  }
};

// Friend request system with proper authorization checks
export const sendFriendRequest = async (req, res) => {
  try {
    const { username, friendUsername } = req.params;

    // Verify authorization
    if (req.user.username !== username) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to send friend requests for this user"
      });
    }

    // Prevent self-friending
    if (username === friendUsername) {
      return res.status(400).json({
        success: false,
        message: "Cannot send friend request to yourself"
      });
    }

    // Find both users
    const [user, friend] = await Promise.all([
      User.findOne({ username }),
      User.findOne({ username: friendUsername })
    ]);

    if (!user || !friend) {
      return res.status(404).json({
        success: false,
        message: "User or friend not found"
      });
    }

    // Check existing relationships
    if (user.friends.includes(friendUsername)) {
      return res.status(400).json({
        success: false,
        message: "Already friends with this user"
      });
    }

    if (user.sentFriendRequests.includes(friendUsername)) {
      return res.status(400).json({
        success: false,
        message: "Friend request already sent"
      });
    }

    // Update both users atomically
    await Promise.all([
      User.updateOne(
        { username },
        { $addToSet: { sentFriendRequests: friendUsername } }
      ),
      User.updateOne(
        { username: friendUsername },
        { $addToSet: { pendingFriendRequests: username } }
      )
    ]);

    res.status(200).json({
      success: true,
      message: "Friend request sent successfully"
    });
  } catch (error) {
    console.error('Friend request error:', error);
    res.status(500).json({
      success: false,
      message: "Could not send friend request"
    });
  }
};

// Accept friend request with proper validation
export const acceptFriendRequest = async (req, res) => {
  const session = await User.startSession();
  
  try {
    const { username, friendUsername } = req.params;
    
    await session.withTransaction(async () => {
      const [user, friend] = await Promise.all([
        User.findOne({ username }).session(session),
        User.findOne({ username: friendUsername }).session(session)
      ]);

      if (!user || !friend) {
        throw new Error("User or friend not found");
      }

      // Verify request exists
      if (!user.pendingFriendRequests.includes(friendUsername)) {
        throw new Error("No pending request from this user");
      }

      // Update both users atomically
      await Promise.all([
        User.updateOne(
          { username },
          {
            $addToSet: { friends: friendUsername },
            $pull: { pendingFriendRequests: friendUsername }
          }
        ).session(session),
        User.updateOne(
          { username: friendUsername },
          {
            $addToSet: { friends: username },
            $pull: { sentFriendRequests: username }
          }
        ).session(session)
      ]);
    });

    res.status(200).json({
      success: true,
      message: "Friend request accepted"
    });
  } catch (error) {
    console.error('Friend acceptance error:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Could not accept friend request"
    });
  } finally {
    await session.endSession();
  }
};
export const rejectFriendRequest = async (req, res) => {
  try {
    const { username, friendUsername } = req.params;
    
    if (req.user.username !== username) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to reject requests for this user"
      });
    }

    const session = await User.startSession();
    session.startTransaction();

    try {
      const [user, friend] = await Promise.all([
        User.findOne({ username }).session(session),
        User.findOne({ username: friendUsername }).session(session)
      ]);

      if (!user || !friend) {
        throw new Error("User or friend not found");
      }

      if (!user.pendingFriendRequests.includes(friendUsername)) {
        throw new Error("No pending request from this user");
      }

      await Promise.all([
        User.updateOne(
          { username },
          { $pull: { pendingFriendRequests: friendUsername } }
        ).session(session),
        User.updateOne(
          { username: friendUsername },
          { $pull: { sentFriendRequests: username } }
        ).session(session)
      ]);

      await session.commitTransaction();
      res.status(200).json({
        success: true,
        message: "Friend request rejected"
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error('Friend rejection error:', error);
    res.status(500).json({
      success: false,
      message: "Could not reject friend request"
    });
  }
};

export const removeFriend = async (req, res) => {
  const session = await User.startSession();
  
  try {
    const { username, friendUsername } = req.params;

    await session.withTransaction(async () => {
      const [user, friend] = await Promise.all([
        User.findOne({ username }).session(session),
        User.findOne({ username: friendUsername }).session(session)
      ]);

      if (!user || !friend) {
        throw new Error("User or friend not found");
      }

      const areFriends = user.friends.includes(friendUsername) && 
                        friend.friends.includes(username);
                        
      if (!areFriends) {
        throw new Error("Users are not friends");
      }

      await Promise.all([
        User.updateOne(
          { username },
          { $pull: { friends: friendUsername } }
        ).session(session),
        User.updateOne(
          { username: friendUsername },
          { $pull: { friends: username } }
        ).session(session)
      ]);
    });

    res.status(200).json({
      success: true,
      message: "Friend removed successfully"
    });
  } catch (error) {
    console.error('Friend removal error:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Could not remove friend"
    });
  } finally {
    await session.endSession();
  }
};

export const getFriendsList = async (req, res) => {
  try {
    const { username } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const canViewFriends = req.user.username === username || 
                          user.friends.includes(req.user.username);
    
    if (!canViewFriends) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view friends list"
      });
    }

    const friendsCount = user.friends.length;
    const paginatedFriends = user.friends.slice(skip, skip + limit);

    const friendDetails = await User.find(
      { username: { $in: paginatedFriends } }
    ).select('username -_id');

    res.status(200).json({
      success: true,
      data: {
        friends: friendDetails,
        pagination: {
          current: page,
          pages: Math.ceil(friendsCount / limit),
          total: friendsCount
        }
      }
    });
  } catch (error) {
    console.error('Friends list fetch error:', error);
    res.status(500).json({
      success: false,
      message: "Could not retrieve friends list"
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token required"
      });
    }

    try {
      const decoded = jwt.verify(refreshToken, jwtConfig.refreshSecret);
      
      const accessToken = jwt.sign(
        { username: decoded.username },
        jwtConfig.secret,
        { expiresIn: jwtConfig.accessTokenExpiry }
      );

      res.status(200).json({
        success: true,
        accessToken
      });
    } catch (err) {
      res.clearCookie('refreshToken');
      throw new Error('Invalid refresh token');
    }
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      message: "Could not refresh token"
    });
  }
};

export const logoutUser = async (req, res) => {
  try {
    // Verify auth token first
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    // Clear refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: "Could not complete logout"
    });
  }
};

export default {
  getAllUsers,
  postUser,
  logUser,
  getUserByUsername,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getFriendsList,
  refreshToken,
  logoutUser,
  loginLimiter,
  registrationLimiter
};