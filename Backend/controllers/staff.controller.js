import User from "../models/user.model.js";

import jwt from "jsonwebtoken";

import uploadBufferToCloudinary from "../utils/cloudinary.js";
import Society from "../models/society.model.js";
import bcrypt from "bcrypt";
import Flat from "../models/flat.model.js";
import Staff from "../models/staff.model.js";
import {
  getCache,
  setCache,
  deleteCache,
  deleteCachePattern,
} from "../utils/cache.js";

export const getAllStaff = async (req, res) => {
  try {
    // Try to get from cache first
    const cacheKey = `staff:${req.user.societyId}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      console.log("✅ Cache HIT for getAllStaff");
      return res.status(200).json({
        message: "Staff fetched successfully",
        staff: cached,
      });
    }

    const staff = await Staff.find({ societyId: req.user.societyId })
      .populate("userId", "name email phone role")
      .sort({ createdAt: -1 });

    // Store in cache for 120 minutes (staff data doesn't change often)
    await setCache(cacheKey, staff, 7200);
    console.log("💾 Cached getAllStaff data");

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

    // Try to get from cache first
    const cacheKey = `staff:${staffId}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      console.log("✅ Cache HIT for getStaffById");
      return res.status(200).json({
        message: "Staff details fetched",
        staff: cached,
      });
    }

    const staff = await Staff.findById(staffId).populate(
      "userId",
      "name email phone",
    );

    if (!staff) return res.status(404).json({ message: "Staff not found" });

    // Store in cache for 120 minutes
    await setCache(cacheKey, staff, 7200);
    console.log("💾 Cached getStaffById data");

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
      { new: true },
    );

    if (!updated) return res.status(404).json({ message: "Staff not found" });

    // Invalidate cache for this staff and all staff in the society
    await deleteCache(`staff:${staffId}`);
    await deleteCachePattern(`staff:*`);
    console.log("🗑️ Cache invalidated for staff update");

    return res.status(200).json({
      message: "Staff updated successfully",
      staff: updated,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
