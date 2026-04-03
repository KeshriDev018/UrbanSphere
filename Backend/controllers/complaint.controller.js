import uploadBufferToCloudinary from "../utils/cloudinary.js";

import Complaint from "../models/complaint.model.js";
import {
  getCache,
  setCache,
  deleteCache,
  deleteCachePattern,
} from "../utils/cache.js";

export const createComplaint = async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    if (req.files && req.files.length > 5) {
      return res.status(400).json({ message: "Maximum 5 images allowed" });
    }

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploaded = await uploadBufferToCloudinary(file.buffer);
        if (uploaded) {
          imageUrls.push(uploaded.secure_url);
        }
      }
    }

    const complaint = await Complaint.create({
      title,
      description,
      category,
      flatId: req.user.flatId,
      societyId: req.user.societyId,
      createdBy: req.user._id,
      images: imageUrls,
    });

    // Invalidate cache for complaints
    await deleteCachePattern(`complaints:*`);
    console.log("🗑️ Cache invalidated for complaint creation");

    return res.status(201).json({
      message: "Complaint submitted successfully",
      complaint,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMyComplaints = async (req, res) => {
  try {
    // Try to get from cache first
    const cacheKey = `complaints:user:${req.user._id}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      console.log("✅ Cache HIT for getMyComplaints");
      return res.status(200).json({
        message: "Your complaints fetched successfully",
        complaints: cached,
      });
    }

    const complaints = await Complaint.find({ createdBy: req.user._id }).sort({
      createdAt: -1,
    });

    // Store in cache for 20 minutes
    await setCache(cacheKey, complaints, 1200);
    console.log("💾 Cached getMyComplaints data");

    return res.status(200).json({
      message: "Your complaints fetched successfully",
      complaints,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const closeComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;

    const complaint = await Complaint.findOneAndUpdate(
      { _id: complaintId, createdBy: req.user._id },
      { status: "Closed" },
      { new: true },
    );

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Invalidate cache for complaints
    await deleteCachePattern(`complaints:*`);
    console.log("🗑️ Cache invalidated for complaint closure");

    return res.status(200).json({
      message: "Complaint closed successfully",
      complaint,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//Admin controllers

export const getAllComplaints = async (req, res) => {
  try {
    // Try to get from cache first
    const cacheKey = `complaints:${req.user.societyId}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      console.log("✅ Cache HIT for getAllComplaints");
      return res.status(200).json({
        message: "All complaints fetched",
        complaints: cached,
      });
    }

    const { societyId } = req.user; // admin's society

    const complaints = await Complaint.find({ societyId })
      .populate("createdBy", "name email phone")
      .populate("assignedTo", "name email phone")
      .populate("flatId", "flatNumber block")
      .sort({ createdAt: -1 });

    // Store in cache for 20 minutes
    await setCache(cacheKey, complaints, 1200);
    console.log("💾 Cached getAllComplaints data");

    return res.status(200).json({
      message: "All complaints fetched",
      complaints,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const assignComplaintToStaff = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { staffId } = req.body;

    const complaint = await Complaint.findByIdAndUpdate(
      complaintId,
      {
        assignedTo: staffId,
        status: "Assigned",
      },
      { new: true },
    );

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Invalidate cache for complaints
    await deleteCachePattern(`complaints:*`);
    console.log("🗑️ Cache invalidated for complaint assignment");

    return res.status(200).json({
      message: "Complaint assigned successfully",
      complaint,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateComplaintPriority = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { priority } = req.body;

    const allowed = ["Low", "Medium", "High", "Urgent"];

    if (!allowed.includes(priority)) {
      return res.status(400).json({ message: "Invalid priority" });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      complaintId,
      { priority },
      { new: true },
    );

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Invalidate cache for complaints
    await deleteCachePattern(`complaints:*`);
    console.log("🗑️ Cache invalidated for complaint priority update");

    return res.status(200).json({
      message: "Priority updated successfully",
      complaint,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const setSLADeadline = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { slaDeadline } = req.body;

    const complaint = await Complaint.findByIdAndUpdate(
      complaintId,
      { slaDeadline },
      { new: true },
    );

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Invalidate cache for complaints
    await deleteCachePattern(`complaints:*`);
    console.log("🗑️ Cache invalidated for SLA deadline update");

    return res.status(200).json({
      message: "SLA deadline updated",
      complaint,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//staff controllers

export const getAssignedComplaints = async (req, res) => {
  try {
    // Try to get from cache first
    const cacheKey = `complaints:assigned:${req.user._id}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      console.log("✅ Cache HIT for getAssignedComplaints");
      return res.status(200).json({
        message: "Assigned complaints fetched",
        complaints: cached,
      });
    }

    const complaints = await Complaint.find({ assignedTo: req.user._id })
      .populate("createdBy", "name phone")
      .populate("flatId", "flatNumber block")
      .sort({ createdAt: -1 });

    // Store in cache for 20 minutes
    await setCache(cacheKey, complaints, 1200);
    console.log("💾 Cached getAssignedComplaints data");

    return res.status(200).json({
      message: "Assigned complaints fetched",
      complaints,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateComplaintStatus = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { status } = req.body;

    const allowed = ["In Progress", "Resolved", "Closed"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const complaint = await Complaint.findById(complaintId);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (req.user.role === "staff") {
      if (String(complaint.assignedTo) !== String(req.user._id)) {
        return res.status(403).json({
          message: "You are not assigned to this complaint",
        });
      }
    }

    const updated = await Complaint.findByIdAndUpdate(
      complaintId,
      { status },
      { new: true },
    );

    return res.status(200).json({
      message: "Status updated successfully",
      complaint: updated,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
