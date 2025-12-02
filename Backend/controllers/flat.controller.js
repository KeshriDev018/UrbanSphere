import User from "../models/user.model.js";
import Flat from "../models/flat.model.js";



export const createFlat = async (req, res) => {
  try {
    const { block, flatNumber, floor } = req.body;

    if (!block || !flatNumber || !floor) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const flat = await Flat.create({
      block,
      flatNumber,
      floor,
      societyId: req.user.societyId, // admin’s society
    });

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
    const flats = await Flat.find({ societyId: req.user.societyId })
      .populate("residentIds", "name email phone")
      .sort({ block: 1, flatNumber: 1 });

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

    const flat = await Flat.findById(flatId).populate(
      "residentIds",
      "name email phone role"
    );

    if (!flat) return res.status(404).json({ message: "Flat not found" });

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
      (id) => id.toString() !== userId
    );
    await flat.save();

    // Remove flat from user profile
    user.flatId = null;
    await user.save();

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
      { new: true }
    );

    if (!updatedFlat)
      return res.status(404).json({ message: "Flat not found" });

    return res.status(200).json({
      message: "Flat updated successfully",
      flat: updatedFlat,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};




