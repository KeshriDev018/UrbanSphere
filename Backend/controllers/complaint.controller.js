

import uploadBufferToCloudinary from "../utils/cloudinary.js";

import Complaint from "../models/complaint.model.js";



export const createComplaint = async (req, res) => {
  try {
    const {title,description,category} = req.body;

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
      flatId:req.user.flatId,
      societyId:req.user.societyId,
      createdBy: req.user._id,
      images: imageUrls,
    });

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
    const complaints = await Complaint.find({ createdBy: req.user._id })
    .sort({ createdAt: -1 });

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
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

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
    const { societyId } = req.user; // admin’s society

    const complaints = await Complaint.find({ societyId })
      .populate("createdBy", "name email phone")
      .populate("assignedTo", "name email phone")
      .populate("flatId", "flatNumber block")
      .sort({ createdAt: -1 });

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
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

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
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

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
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

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
    const complaints = await Complaint.find({ assignedTo: req.user._id })
      .populate("createdBy", "name phone")
      .populate("flatId", "flatNumber block")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Assigned complaints fetched",
      complaints,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


//any role controllers

export const updateComplaintStatus = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { status } = req.body;

    const allowed = ["In Progress", "Resolved", "Closed"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const complaint = await Complaint.findOneAndUpdate(
      { _id: complaintId, assignedTo: req.user._id },
      { status },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found or not assigned to you",
      });
    }

    return res.status(200).json({
      message: "Status updated successfully",
      complaint,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};



