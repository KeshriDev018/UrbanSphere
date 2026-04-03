import Package from "../models/package.model.js";
import Flat from "../models/flat.model.js";
import uploadBufferToCloudinary from "../utils/cloudinary.js";
import {
  getCache,
  setCache,
  deleteCache,
  deleteCachePattern,
} from "../utils/cache.js";

export const createPackage = async (req, res) => {
  try {
    const { courierName, trackingNumber, flatId } = req.body;

    if (!courierName || !flatId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const flat = await Flat.findById(flatId);
    if (!flat) {
      return res.status(404).json({ message: "Flat not found" });
    }

    let packagePhotoUrl = null;

    if (req.file) {
      const uploaded = await uploadBufferToCloudinary(
        req.file.buffer,
        "packages",
      );
      packagePhotoUrl = uploaded.secure_url;
    }

    const pkg = await Package.create({
      courierName,
      trackingNumber,
      flatId,
      createdByGuard: req.user._id,
      packagePhoto: packagePhotoUrl,
      societyId: req.user.societyId,
    });

    // Invalidate cache
    await deleteCache(`pending:packages:${req.user.societyId}`);
    await deleteCachePattern(`packages:${req.user.societyId}`);
    await deleteCachePattern(`flat:${flatId}:packages`);
    console.log(`🗑️ Cache invalidated for package creation`);

    return res.status(201).json({
      message: "Package added successfully",
      package: pkg,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getPendingPackages = async (req, res) => {
  try {
    const cacheKey = `pending:packages:${req.user.societyId}`;

    // Check cache
    const cached = await getCache(cacheKey);
    if (cached) {
      console.log(`✅ Cache hit for getPendingPackages`);
      return res.status(200).json({
        message: "Pending packages fetched",
        packages: cached,
      });
    }

    const packages = await Package.find({
      societyId: req.user.societyId,
      status: "Pending",
    }).populate("flatId", "flatNumber block");

    // Store in cache (15 min TTL)
    await setCache(cacheKey, packages, 900);
    console.log(`💾 Pending packages cached`);

    return res.status(200).json({
      message: "Pending packages fetched",
      packages,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const markAsPickedUp = async (req, res) => {
  try {
    const { packageId } = req.params;

    const pkg = await Package.findById(packageId);
    if (!pkg) {
      return res.status(404).json({ message: "Package not found" });
    }

    if (pkg.status === "Picked Up") {
      return res.status(400).json({ message: "Package already picked up" });
    }

    pkg.pickedUpBy = req.body.pickedUpBy || null; // resident ID optional
    pkg.pickedUpTime = new Date();
    pkg.status = "Picked Up";
    pkg.pickupVerificationMethod = req.body.method || "Manual";

    await pkg.save();

    // Invalidate cache
    await deleteCache(`pending:packages:${pkg.societyId}`);
    await deleteCachePattern(`packages:${pkg.societyId}`);
    await deleteCachePattern(`flat:${pkg.flatId}:packages`);
    console.log(`🗑️ Cache invalidated for package pickup`);

    return res.status(200).json({
      message: "Package marked as picked up",
      package: pkg,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMyPackages = async (req, res) => {
  try {
    const cacheKey = `flat:${req.user.flatId}:packages`;

    // Check cache
    const cached = await getCache(cacheKey);
    if (cached) {
      console.log(`✅ Cache hit for getMyPackages`);
      return res.status(200).json({
        message: "Your packages",
        packages: cached,
      });
    }

    const packages = await Package.find({
      flatId: req.user.flatId,
    }).sort({ arrivalTime: -1 });

    // Store in cache (15 min TTL)
    await setCache(cacheKey, packages, 900);
    console.log(`💾 My packages cached`);

    return res.status(200).json({
      message: "Your packages",
      packages,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAllPackages = async (req, res) => {
  try {
    const cacheKey = `packages:${req.user.societyId}`;

    // Check cache
    const cached = await getCache(cacheKey);
    if (cached) {
      console.log(`✅ Cache hit for getAllPackages`);
      return res.status(200).json({
        message: "All packages fetched",
        packages: cached,
      });
    }

    const packages = await Package.find({
      societyId: req.user.societyId,
    })
      .populate("flatId", "flatNumber block")
      .populate("createdByGuard", "name email")
      .sort({ arrivalTime: -1 });

    // Store in cache (30 min TTL)
    await setCache(cacheKey, packages, 1800);
    console.log(`💾 All packages cached`);

    return res.status(200).json({
      message: "All packages fetched",
      packages,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deletePackage = async (req, res) => {
  try {
    const { packageId } = req.params;

    const pkg = await Package.findByIdAndDelete(packageId);

    if (!pkg) {
      return res.status(404).json({ message: "Package not found" });
    }

    // Invalidate cache
    await deleteCache(`pending:packages:${pkg.societyId}`);
    await deleteCachePattern(`packages:${pkg.societyId}`);
    await deleteCachePattern(`flat:${pkg.flatId}:packages`);
    console.log(`🗑️ Cache invalidated for package deletion`);

    return res.status(200).json({ message: "Package deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
