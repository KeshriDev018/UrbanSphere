import SocietyRegistration from "../models/societyRegistration.model.js";
import uploadBufferToCloudinary from "../utils/cloudinary.js";
import Society from "../models/society.model.js";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import { deleteCache, setCache, getCache } from "../utils/cache.js";

export const requestSocietyRegistration = async (req, res) => {
  try {
    const {
      societyName,
      address,
      city,
      state,
      pincode,
      chairpersonName,
      chairpersonEmail,
      chairpersonPhone,
      numberOfFlats,
    } = req.body; // Upload documents if provided

    let uploadedDocs = [];
    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        const uploaded = await uploadBufferToCloudinary(file.buffer);
        uploadedDocs.push(uploaded.secure_url);
      }
    }

    const request = await SocietyRegistration.create({
      societyName,
      address,
      city,
      state,
      pincode,
      chairpersonName,
      chairpersonEmail,
      chairpersonPhone,
      numberOfFlats,
      documents: uploadedDocs,
    });

    return res.status(201).json({
      message: "Society registration request submitted",
      request,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const approveSociety = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await SocietyRegistration.findById(requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (request.status !== "PENDING")
      return res.status(400).json({ message: "Already processed" });

    // 1. Create Society ✅
    const society = await Society.create({
      name: request.societyName,
      address: request.address,
      city: request.city,
      state: request.state,
      pincode: request.pincode,
      numberOfFlats: request.numberOfFlats,
      createdBy: req.user._id,
    });

    const hashedpassword = await bcrypt.hash("Temp@1234", 10);

    const superadmin = await User.create({
      name: request.chairpersonName,
      email: request.chairpersonEmail,
      phone: request.chairpersonPhone,
      password: hashedpassword, // ← PLAINTEXT like registerUser
      role: "superadmin",
      societyId: society._id,
      isVerified: true,
      mustChangePassword: true,
    });

    // 3. Update request
    request.status = "APPROVED";
    request.approvedBy = req.user._id;
    request.approvedAt = new Date();
    await request.save();

    // Invalidate cache
    await deleteCache(`societies:all`);
    console.log(`🗑️ Cache invalidated for society approval`);

    return res.status(200).json({
      message: "Society approved. Superadmin created.",
      society,
      superadmin,
    });
  } catch (err) {
    console.log("FULL ERROR:", err); // ADD THIS TEMPORARILY
    return res.status(500).json({ message: err.message });
  }
};

export const getAllSocieties = async (req, res) => {
  try {
    const cacheKey = `societies:all`;

    // Check cache
    const cached = await getCache(cacheKey);
    if (cached) {
      console.log(`✅ Cache hit for getAllSocieties`);
      return res.status(200).json({
        message: "All societies fetched successfully",
        societies: cached,
      });
    }

    const societies = await Society.find().sort({ createdAt: -1 });

    // Store in cache (2 hours TTL - societies don't change often)
    await setCache(cacheKey, societies, 7200);
    console.log(`💾 All societies cached`);

    return res.status(200).json({
      message: "All societies fetched successfully",
      societies,
    });
  } catch (error) {
    console.error("Error fetching societies:", error);
    return res.status(500).json({
      message: "Server error while fetching societies",
      error: error.message,
    });
  }
};
