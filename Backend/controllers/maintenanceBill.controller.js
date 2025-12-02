import User from "../models/user.model.js";

import jwt from "jsonwebtoken";

import uploadBufferToCloudinary from "../utils/cloudinary.js";
import Society from "../models/society.model.js";
import bcrypt from "bcrypt";
import Flat from "../models/flat.model.js";
import Staff from "../models/staff.model.js";

export const createBill = async (req, res) => {
  try {
    const { flatId, amount, lineItems, month, dueDate, notes } = req.body;

    if (!flatId || !amount || !month || !dueDate) {
      return res.status(400).json({ message: "All required fields missing" });
    }

    const bill = await MaintenanceBill.create({
      flatId,
      amount,
      lineItems,
      month,
      dueDate,
      notes,
      societyId: req.user.societyId,
    });

    return res.status(201).json({
      message: "Bill created successfully",
      bill,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


export const createBulkBills = async (req, res) => {
  try {
    const { amount, lineItems, month, dueDate, notes } = req.body;

    if (!amount || !month || !dueDate) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // Get all flats in the society
    const flats = await Flat.find({ societyId: req.user.societyId });

    const bills = [];

    for (const flat of flats) {
      const bill = await MaintenanceBill.create({
        flatId: flat._id,
        amount,
        lineItems,
        month,
        dueDate,
        notes,
        societyId: req.user.societyId,
      });

      bills.push(bill);
    }

    return res.status(201).json({
      message: "Bills generated for all flats",
      totalBills: bills.length,
      bills,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getAllBills = async (req, res) => {
  try {
    const bills = await MaintenanceBill.find({
      societyId: req.user.societyId,
    })
      .populate("flatId", "flatNumber block")
      .populate("paymentIds")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "All bills fetched",
      bills,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getFlatBills = async (req, res) => {
  try {
    const { flatId } = req.params;

    const bills = await MaintenanceBill.find({ flatId })
      .populate("paymentIds")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Bills fetched",
      bills,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const updateBill = async (req, res) => {
  try {
    const { billId } = req.params;

    const updatedBill = await MaintenanceBill.findByIdAndUpdate(
      billId,
      req.body,
      { new: true }
    );

    if (!updatedBill)
      return res.status(404).json({ message: "Bill not found" });

    return res.status(200).json({
      message: "Bill updated",
      bill: updatedBill,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const updateBillStatus = async (req, res) => {
  try {
    const { billId } = req.params;
    const { status } = req.body;

    const allowed = ["Pending", "Paid", "Overdue", "Partially Paid"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updated = await MaintenanceBill.findByIdAndUpdate(
      billId,
      { status },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Bill not found" });

    return res.status(200).json({
      message: "Status updated",
      bill: updated,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


export const addPaymentToBill = async (req, res) => {
  try {
    const { billId } = req.params;
    const { paymentId } = req.body;

    const updated = await MaintenanceBill.findByIdAndUpdate(
      billId,
      { $push: { paymentIds: paymentId } },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Bill not found" });

    return res.status(200).json({
      message: "Payment added to bill",
      bill: updated,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const deleteBill = async (req, res) => {
  try {
    const { billId } = req.params;

    const deleted = await MaintenanceBill.findByIdAndDelete(billId);

    if (!deleted) return res.status(404).json({ message: "Bill not found" });

    return res.status(200).json({
      message: "Bill deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
