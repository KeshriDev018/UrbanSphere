import User from "../models/user.model.js";
import Flat from "../models/flat.model.js";
import mongoose from "mongoose";
import Society from "../models/society.model.js"
import {
  getCache,
  setCache,
  deleteCache,
  deleteCachePattern,
} from "../utils/cache.js";

export const createFlat = async (req, res) => {
  try {
    const { block, flatNumber, floor, type } = req.body;

    
    if (!block || !flatNumber || floor === undefined || !type) {
      return res.status(400).json({
        message: "Block, flatNumber, floor and type are required",
      });
    }

   
    if (floor < 0) {
      return res.status(400).json({
        message: "Floor must be a positive number",
      });
    }

    
    const society = await Society.findById(req.user.societyId);
    if (!society) {
      return res.status(404).json({ message: "Society not found" });
    }

    // ✅ 4. Block validation
    if (!society.blocks.includes(block)) {
      return res.status(400).json({
        message: `Invalid block. Available blocks: ${society.blocks.join(", ")}`,
      });
    }

    // ✅ 5. Duplicate flat check
    const existing = await Flat.findOne({
      block,
      flatNumber,
      societyId: req.user.societyId,
    });

    if (existing) {
      return res.status(400).json({
        message: "Flat already exists in this block",
      });
    }

    // ✅ 6. Create flat
    const flat = await Flat.create({
      block,
      flatNumber,
      floor,
      type, // 🔥 important (2BHK, 3BHK)
      societyId: req.user.societyId,
    });

    // ✅ 7. Cache invalidation
    await deleteCachePattern(`flats:${req.user.societyId}*`);
    console.log("🗑️ Cache invalidated for flat creation");

    return res.status(201).json({
      message: "Flat created successfully",
      flat,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getAllFlats = async (req, res) => {
  try {
    // Try to get from cache first
    const cacheKey = `flats:${req.user.societyId}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      console.log("✅ Cache HIT for getAllFlats");
      return res.status(200).json({
        message: "Flats fetched successfully",
        flats: cached,
      });
    }

    const societyObjectId = new mongoose.Types.ObjectId(req.user.societyId);

    const flats = await Flat.find({ societyId: societyObjectId })
      .populate("residentIds", "name email phone")
      .sort({ block: 1, flatNumber: 1 });

    // Store in cache for 60 minutes
    await setCache(cacheKey, flats, 3600);
    console.log("💾 Cached getAllFlats data");

    return res.status(200).json({
      message: "Flats fetched successfully",
      flats,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getFlatById = async (req, res) => {
  try {
    const { flatId } = req.params;

    // Try to get from cache first
    const cacheKey = `flat:${flatId}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      console.log("✅ Cache HIT for getFlatById");
      return res.status(200).json({
        message: "Flat details fetched",
        flat: cached,
      });
    }

    const flat = await Flat.findById(flatId).populate(
      "residentIds",
      "name email phone role",
    );

    if (!flat) return res.status(404).json({ message: "Flat not found" });

    // Store in cache for 60 minutes
    await setCache(cacheKey, flat, 3600);
    console.log("💾 Cached getFlatById data");

    return res.status(200).json({
      message: "Flat details fetched",
      flat,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const assignResidentToFlat = async (req, res) => {
  try {
    const { userId, flatId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.flatId) {
      return res.status(400).json({
        message: "User already has a flat assigned",
      });
    }

    const flat = await Flat.findById(flatId);
    if (!flat) return res.status(404).json({ message: "Flat not found" });

    // Add user to flat
    flat.residentIds.push(userId);
    await flat.save();

    // Update user flatId
    user.flatId = flatId;
    await user.save();

    // Invalidate cache for this flat and all flats in the society
    await deleteCache(`flat:${flatId}`);
    await deleteCachePattern(`flats:${req.user.societyId}*`);
    console.log("🗑️ Cache invalidated for flat assignment");

    return res.status(200).json({
      message: "Flat assigned successfully",
      flat,
      user,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const removeResidentFromFlat = async (req, res) => {
  try {
    const { userId, flatId } = req.body;

    const flat = await Flat.findById(flatId);
    if (!flat) return res.status(404).json({ message: "Flat not found" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Remove user from flat list
    flat.residentIds = flat.residentIds.filter(
      (id) => id.toString() !== userId,
    );
    await flat.save();

    // Remove flat from user profile
    user.flatId = null;
    await user.save();

    // Invalidate cache for this flat and all flats in the society
    await deleteCache(`flat:${flatId}`);
    await deleteCachePattern(`flats:${req.user.societyId}*`);
    console.log("🗑️ Cache invalidated for flat removal");

    return res.status(200).json({
      message: "Resident removed from flat",
      flat,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const updateFlat = async (req, res) => {
  try {
    const { flatId } = req.params;
    const { block, flatNumber, floor } = req.body;

    const updatedFlat = await Flat.findByIdAndUpdate(
      flatId,
      { block, flatNumber, floor },
      { new: true },
    );

    if (!updatedFlat)
      return res.status(404).json({ message: "Flat not found" });

    // Invalidate cache for this flat and all flats in the society
    await deleteCache(`flat:${flatId}`);
    await deleteCachePattern(`flats:*`);
    console.log("🗑️ Cache invalidated for flat update");

    return res.status(200).json({
      message: "Flat updated successfully",
      flat: updatedFlat,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
