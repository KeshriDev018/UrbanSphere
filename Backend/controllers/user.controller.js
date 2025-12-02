import User from "../models/user.model.js";

import jwt from "jsonwebtoken";

import uploadBufferToCloudinary from "../utils/cloudinary.js";
import Society from "../models/society.model.js";
import bcrypt from "bcrypt";
import Flat from "../models/flat.model.js";
import Staff from "../models/staff.model.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, societyId } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (!societyId) {
      return res.status(400).json({
        message: "Please select a society before registering.",
      });
    }

    const societyExists = await Society.findById(societyId);
    if (!societyExists) {
      return res
        .status(404)
        .json({ message: "Selected society does not exist." });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already registered." });
    }

    let profileImageUrl = null;

    if (req.file) {
      const uploaded = await uploadBufferToCloudinary(req.file.buffer);
      profileImageUrl = uploaded.secure_url;
    }

    const hashedpassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedpassword,
      role: "resident",
      societyId,
      flatId: null,
      isVerified: false,
      profileImage: profileImageUrl,
      mustChangePassword: false,
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        societyId: user.societyId,
        profileImage: user.profileImage,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.mustChangePassword) {
      const tempAccessToken = user.generateTempAccessToken();

      return res.status(200).json({
        mustChangePassword: true,
        message: "Password change required",
        tempAccessToken,
        userId: user._id,
      });
    }

    const isMatch = await user.isPasswordCorrect(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid password" });

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true, // HTTPS only
      sameSite: "strict", // CSRF protection
      path: "/auth/refresh", // Only send to refresh route
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      message: "Login successful",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        flatId: user.flatId,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decoded._id);
    if (!user) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = user.generateAccessToken();

    return res.status(200).json({
      accessToken: newAccessToken,
      message: "Token refreshed",
    });
  } catch (err) {
    return res
      .status(401)
      .json({ message: "Invalid or expired refresh token" });
  }
};

export const logoutUser = async (req, res) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/auth/refresh",
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    return res.status(200).json({ user });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    const isMatch = await user.isPasswordCorrect(oldPassword);
    if (!isMatch)
      return res.status(400).json({ message: "Old password incorrect" });

    const hashedpassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedpassword;
    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone },
      { new: true }
    ).select("-password");

    return res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const updateProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image provided" });
    }

    const uploaded = await uploadBufferToCloudinary(req.file.buffer);

    if (!uploaded) {
      return res.status(500).json({ message: "Image upload failed" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { profileImage: uploaded.secure_url },
      { new: true }
    ).select("-password");

    return res.status(200).json({
      message: "Profile image updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};


export const forceChangePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: "New password is required" });
    }

    // find user
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.mustChangePassword = false;
    await user.save();

    return res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};


// Only Admins controllers

export const getAllResidents = async (req, res) => {
  try {
    const residents = await User.find({
      role: "resident",
      societyId: req.params.societyId,
      isVerified: "true",
    }).select("-password");

    return res.status(200).json({
      message: "All residents fetched",
      residents,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getPendingResidents = async (req, res) => {
  try {
    const residents = await User.find({
      role: "resident",
      isVerified: false,
      societyId: req.params.societyId,
    }).select("-password");

    return res.status(200).json({
      message: "Pending residents fetched",
      residents,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const approveResident = async (req, res) => {
  try {
    const { userId } = req.params;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isVerified: true },
      { new: true }
    ).select("-password");

    if (!updatedUser)
      return res.status(404).json({ message: "Resident not found" });

    return res.status(200).json({
      message: "Resident approved successfully",
      user: updatedUser,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const assignFlat = async (req, res) => {
  try {
    const { userId } = req.params;
    const { flatId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const flat = await Flat.findById(flatId);
    if (!flat) return res.status(404).json({ message: "Flat not found" });

    if (String(user.societyId) !== String(flat.societyId)) {
      return res.status(400).json({
        message: "User and Flat do not belong to the same society",
      });
    }

    if (flat.residentIds.length > 0) {
      return res.status(400).json({
        message: "Flat is already assigned to another resident",
      });
    }

    user.flatId = flatId;
    user.isVerified = true;
    await user.save();

    flat.residentIds.push(user._id);
    await flat.save();

    return res.status(200).json({
      message: "Flat assigned successfully",
      user,
      flat,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


export const createUserWithRole = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      role,
      password,
      societyId,
      staffRole,
      shift,
      skills,
    } = req.body;

    // SUPERADMIN CANNOT create another superadmin
    if (req.user.role === "superadmin" && role === "superadmin") {
      return res.status(403).json({
        message: "Superadmin cannot create another superadmin",
      });
    }

    // ADMIN cannot create admin or superadmin
    if (
      req.user.role === "admin" &&
      (role === "admin" || role === "superadmin")
    ) {
      return res.status(403).json({
        message: "Admin cannot create this role",
      });
    }

    // Allowed roles
    const allowedRoles = ["admin", "treasurer", "staff"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Create User
    const newUser = await User.create({
      name,
      email,
      phone,
      role,
      password,
      societyId,
      isVerified: true,
      mustChangePassword: true,
    });

    // If creating STAFF → create Staff profile
    if (role === "staff") {
      await Staff.create({
        userId: newUser._id,
        staffRole: staffRole || "guard", // REQUIRED: guard / maintenance
        shift: shift || "Morning", // Default shift
        skills: skills || [], // Optional array
        societyId: societyId,
      });
    }

    return res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};



export const changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, staffRole, shift, skills } = req.body;

    // Prevent superadmin from creating another superadmin
    if (req.user.role === "superadmin" && role === "superadmin") {
      return res.status(403).json({
        message: "Superadmin cannot create another superadmin",
      });
    }

    // Admin restrictions
    if (
      req.user.role === "admin" &&
      (role === "admin" || role === "superadmin")
    ) {
      return res.status(403).json({
        message: "Admin cannot assign this role",
      });
    }

    // Allowed User roles (guard REMOVED)
    const allowedRoles = ["admin", "staff", "treasurer", "resident"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Fetch user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const oldRole = user.role;

    // CASE 1: User is becoming staff → create Staff document
    if (role === "staff" && oldRole !== "staff") {
      await Staff.create({
        userId,
        staffRole: staffRole || "guard", // default staff type
        shift: shift || "Morning",
        skills: skills || [],
        societyId: user.societyId,
      });
    }

    // CASE 2: User is leaving staff role → delete Staff document
    if (oldRole === "staff" && role !== "staff") {
      await Staff.findOneAndDelete({ userId });
    }

    // Update user role
    user.role = role;
    await user.save();

    return res.status(200).json({
      message: "Role updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};



export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find user to delete
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const requesterRole = req.user.role;


    //No one can delete developer
    if (user.role === "developer") {
      return res
        .status(403)
        .json({ message: "You cannot delete developer account" });
    }

    //Admin cannot delete admin, superadmin, developer
    if (requesterRole === "admin") {
      if (["admin", "superadmin", "developer"].includes(user.role)) {
        return res.status(403).json({
          message: "Admin is not allowed to delete this user",
        });
      }
    }

    //Superadmin cannot delete superadmin or developer
    if (requesterRole === "superadmin") {
      if (["superadmin", "developer"].includes(user.role)) {
        return res.status(403).json({
          message: "Superadmin cannot delete this user",
        });
      }
    }

    // User cannot delete himself
    if (req.user._id.toString() === userId) {
      return res.status(403).json({
        message: "You cannot delete your own account",
      });
    }

    
    if (user.role === "staff") {
      await Staff.findOneAndDelete({ userId });
    }

    await User.findByIdAndDelete(userId);

    return res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");


    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ user });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
