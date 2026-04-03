import User from "../models/user.model.js";

import jwt from "jsonwebtoken";

import uploadBufferToCloudinary from "../utils/cloudinary.js";
import Society from "../models/society.model.js";
import bcrypt from "bcrypt";
import Flat from "../models/flat.model.js";
import Staff from "../models/staff.model.js";
import Notice from "../models/notice.model.js";
import {
  getCache,
  setCache,
  deleteCache,
  deleteCachePattern,
} from "../utils/cache.js";

export const createNotice = async (req, res) => {
  try {
    const { title, message, audience, isImportant, validTill } = req.body;

    if (!title || !message) {
      return res
        .status(400)
        .json({ message: "Title and message are required" });
    }

    // Handle attachments
    let attachmentUrls = [];

    if (req.files && req.files.length > 5) {
      return res.status(400).json({ message: "Maximum 5 attachments allowed" });
    }

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploaded = await uploadBufferToCloudinary(file.buffer);
        if (uploaded) attachmentUrls.push(uploaded.secure_url);
      }
    }

    const notice = await Notice.create({
      title,
      message,
      audience: audience || "All",
      isImportant: isImportant || false,
      validTill: validTill || null,
      attachmentUrls,
      createdBy: req.user._id,
      societyId: req.user.societyId,
    });

    // Invalidate cache for this society's notices
    await deleteCachePattern(`notices:${req.user.societyId}*`);
    console.log("🗑️ Cache invalidated for notice creation");

    return res.status(201).json({
      message: "Notice created successfully",
      notice,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getMyNotices = async (req, res) => {
  try {
    const role = req.user.role;

    // Try to get from cache first
    const cacheKey = `notices:${req.user.societyId}:${role}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      console.log("✅ Cache HIT for getMyNotices");
      return res.status(200).json({
        message: "Notices fetched successfully",
        notices: cached,
      });
    }

    let audienceFilter = ["All"];

    if (role === "resident") audienceFilter.push("Residents");
    if (role === "staff") audienceFilter.push("Staff");

    const notices = await Notice.find({
      societyId: req.user.societyId,
      audience: { $in: audienceFilter },
      $or: [
        { validTill: null },
        { validTill: { $gte: new Date() } }, // only future or infinite
      ],
    }).sort({ isImportant: -1, createdAt: -1 });

    // Store in cache for 15 minutes (notices change frequently)
    await setCache(cacheKey, notices, 900);
    console.log("💾 Cached getMyNotices data");

    return res.status(200).json({
      message: "Notices fetched successfully",
      notices,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const updateNotice = async (req, res) => {
  try {
    const { noticeId } = req.params;

    const updatedNotice = await Notice.findByIdAndUpdate(noticeId, req.body, {
      new: true,
    });

    if (!updatedNotice) {
      return res.status(404).json({ message: "Notice not found" });
    }

    // Invalidate cache for all notices
    await deleteCache(`notice:${noticeId}`);
    await deleteCachePattern(`notices:*`);
    console.log("🗑️ Cache invalidated for notice update");

    return res.status(200).json({
      message: "Notice updated successfully",
      notice: updatedNotice,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const deleteNotice = async (req, res) => {
  try {
    const { noticeId } = req.params;

    const deleted = await Notice.findByIdAndDelete(noticeId);

    if (!deleted) return res.status(404).json({ message: "Notice not found" });

    // Invalidate cache for all notices
    await deleteCache(`notice:${noticeId}`);
    await deleteCachePattern(`notices:*`);
    console.log("🗑️ Cache invalidated for notice deletion");

    return res.status(200).json({
      message: "Notice deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getNoticeById = async (req, res) => {
  try {
    const { noticeId } = req.params;

    // Try to get from cache first
    const cacheKey = `notice:${noticeId}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      console.log("✅ Cache HIT for getNoticeById");
      return res.status(200).json({
        message: "Notice details fetched",
        notice: cached,
      });
    }

    const notice = await Notice.findById(noticeId).populate(
      "createdBy",
      "name email role",
    );

    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }

    // Store in cache for 15 minutes
    await setCache(cacheKey, notice, 900);
    console.log("💾 Cached getNoticeById data");

    return res.status(200).json({
      message: "Notice details fetched",
      notice,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

//staff and residences
export const getAllNotices = async (req, res) => {
  try {
    // Try to get from cache first
    const cacheKey = `notices:${req.user.societyId}:all`;
    const cached = await getCache(cacheKey);
    if (cached) {
      console.log("✅ Cache HIT for getAllNotices");
      return res.status(200).json({
        message: "All notices fetched",
        notices: cached,
      });
    }

    const notices = await Notice.find({ societyId: req.user.societyId })
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    // Store in cache for 15 minutes
    await setCache(cacheKey, notices, 900);
    console.log("💾 Cached getAllNotices data");

    return res.status(200).json({
      message: "All notices fetched",
      notices,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
