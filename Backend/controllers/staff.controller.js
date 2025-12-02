import User from "../models/user.model.js";

import jwt from "jsonwebtoken";

import uploadBufferToCloudinary from "../utils/cloudinary.js";
import Society from "../models/society.model.js";
import bcrypt from "bcrypt";
import Flat from "../models/flat.model.js";
import Staff from "../models/staff.model.js";


export const getAllStaff = async (req, res) => {
  try {
    const staff = await Staff.find({ societyId: req.user.societyId })
      .populate("userId", "name email phone role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Staff fetched successfully",
      staff,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


export const getStaffById = async (req, res) => {
  try {
    const { staffId } = req.params;

    const staff = await Staff.findById(staffId).populate(
      "userId",
      "name email phone"
    );

    if (!staff) return res.status(404).json({ message: "Staff not found" });

    return res.status(200).json({
      message: "Staff details fetched",
      staff,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


export const updateStaff = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { shift, skills, staffRole, isActive } = req.body;

    const updated = await Staff.findByIdAndUpdate(
      staffId,
      { shift, skills, staffRole, isActive },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Staff not found" });

    return res.status(200).json({
      message: "Staff updated successfully",
      staff: updated,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

