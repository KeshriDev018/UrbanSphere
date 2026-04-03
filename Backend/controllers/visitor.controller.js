import Visitor from "../models/visitor.model.js";
import Flat from "../models/flat.model.js";
import uploadBufferToCloudinary from "../utils/cloudinary.js";
import {
  getCache,
  setCache,
  deleteCache,
  deleteCachePattern,
} from "../utils/cache.js";

export const createVisitor = async (req, res) => {
  try {
    const { name, phone, purpose, flatId, vehicleNo } = req.body;

    if (!name || !phone || !purpose || !flatId) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const flat = await Flat.findById(flatId);
    if (!flat) {
      return res.status(404).json({ message: "Flat not found" });
    }

    let photoUrl = null;
    if (req.file) {
      const upload = await uploadBufferToCloudinary(
        req.file.buffer,
        "visitors",
      );
      photoUrl = upload.secure_url;
    }

    const visitor = await Visitor.create({
      name,
      phone,
      purpose,
      flatId,
      vehicleNo: vehicleNo || null,
      createdByGuard: req.user._id,
      photoUrl,
      societyId: req.user.societyId,
    });

    // Invalidate cache
    await deleteCache(`pending:visitors:${flatId}`);
    await deleteCachePattern(`visitors:${req.user.societyId}`);
    await deleteCachePattern(`flat:${flatId}:visitors`);
    console.log(`🗑️ Cache invalidated for visitor creation`);

    return res.status(201).json({
      message: "Visitor entry created",
      visitor,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

//resident approval
export const approveVisitor = async (req, res) => {
  try {
    const { visitorId } = req.params;

    const visitor = await Visitor.findById(visitorId);
    if (!visitor) {
      return res.status(404).json({ message: "Visitor not found" });
    }

    if (visitor.status !== "Pending") {
      return res.status(400).json({ message: "Visitor already processed" });
    }

    visitor.approvedByResident = true;
    visitor.rejectedByResident = false;
    visitor.status = "Approved";
    visitor.residentResponseTime = new Date();

    await visitor.save();

    // Invalidate cache
    await deleteCache(`pending:visitors:${visitor.flatId}`);
    await deleteCachePattern(`visitors:${visitor.societyId}`);
    await deleteCachePattern(`flat:${visitor.flatId}:visitors`);
    console.log(`🗑️ Cache invalidated for visitor approval`);

    return res.status(200).json({
      message: "Visitor approved successfully",
      visitor,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

//resident rejection
export const rejectVisitor = async (req, res) => {
  try {
    const { visitorId } = req.params;

    const visitor = await Visitor.findById(visitorId);
    if (!visitor) {
      return res.status(404).json({ message: "Visitor not found" });
    }

    if (visitor.status !== "Pending") {
      return res.status(400).json({ message: "Visitor already processed" });
    }

    visitor.approvedByResident = false;
    visitor.rejectedByResident = true;
    visitor.status = "Rejected";
    visitor.residentResponseTime = new Date();

    await visitor.save();

    // Invalidate cache
    await deleteCache(`pending:visitors:${visitor.flatId}`);
    await deleteCachePattern(`visitors:${visitor.societyId}`);
    await deleteCachePattern(`flat:${visitor.flatId}:visitors`);
    console.log(`🗑️ Cache invalidated for visitor rejection`);

    return res.status(200).json({
      message: "Visitor rejected",
      visitor,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const exitVisitor = async (req, res) => {
  try {
    const { visitorId } = req.params;

    const visitor = await Visitor.findById(visitorId);
    if (!visitor) {
      return res.status(404).json({ message: "Visitor not found" });
    }

    if (visitor.status !== "Approved") {
      return res
        .status(400)
        .json({ message: "Visitor has not entered / already exited" });
    }

    visitor.checkOutTime = new Date();
    visitor.status = "Exited";

    await visitor.save();

    // Invalidate cache
    await deleteCachePattern(`visitors:${visitor.societyId}`);
    await deleteCachePattern(`flat:${visitor.flatId}:visitors`);
    console.log(`🗑️ Cache invalidated for visitor exit`);

    return res.status(200).json({
      message: "Visitor exit recorded",
      visitor,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getPendingVisitors = async (req, res) => {
  try {
    const cacheKey = `pending:visitors:${req.user.flatId}`;

    // Check cache
    const cached = await getCache(cacheKey);
    if (cached) {
      console.log(`✅ Cache hit for getPendingVisitors`);
      return res.status(200).json({
        message: "Pending visitors fetched",
        visitors: cached,
      });
    }

    const visitors = await Visitor.find({
      flatId: req.user.flatId,
      status: "Pending",
    }).sort({ checkInTime: -1 });

    // Store in cache (10 min TTL)
    await setCache(cacheKey, visitors, 600);
    console.log(`💾 Pending visitors cached`);

    return res.status(200).json({
      message: "Pending visitors fetched",
      visitors,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getMyVisitors = async (req, res) => {
  try {
    const cacheKey = `flat:${req.user.flatId}:visitors`;

    // Check cache
    const cached = await getCache(cacheKey);
    if (cached) {
      console.log(`✅ Cache hit for getMyVisitors`);
      return res.status(200).json({
        message: "Your visitor history",
        visitors: cached,
      });
    }

    const visitors = await Visitor.find({
      flatId: req.user.flatId,
    }).sort({ checkInTime: -1 });

    // Store in cache (20 min TTL)
    await setCache(cacheKey, visitors, 1200);
    console.log(`💾 My visitors cached`);

    return res.status(200).json({
      message: "Your visitor history",
      visitors,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getAllVisitors = async (req, res) => {
  try {
    const cacheKey = `visitors:${req.user.societyId}`;

    // Check cache
    const cached = await getCache(cacheKey);
    if (cached) {
      console.log(`✅ Cache hit for getAllVisitors`);
      return res.status(200).json({
        message: "All visitors fetched",
        visitors: cached,
      });
    }

    const visitors = await Visitor.find({
      societyId: req.user.societyId,
    })
      .populate("flatId", "flatNumber block")
      .populate("createdByGuard", "name")
      .sort({ checkInTime: -1 });

    // Store in cache (20 min TTL)
    await setCache(cacheKey, visitors, 1200);
    console.log(`💾 All visitors cached`);

    return res.status(200).json({
      message: "All visitors fetched",
      visitors,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const deleteVisitor = async (req, res) => {
  try {
    const { visitorId } = req.params;

    const visitor = await Visitor.findByIdAndDelete(visitorId);

    if (!visitor) {
      return res.status(404).json({ message: "Visitor not found" });
    }

    // Invalidate cache
    await deleteCachePattern(`visitors:${visitor.societyId}`);
    await deleteCachePattern(`flat:${visitor.flatId}:visitors`);
    await deleteCache(`pending:visitors:${visitor.flatId}`);
    console.log(`🗑️ Cache invalidated for visitor deletion`);

    return res.status(200).json({ message: "Visitor deleted" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
