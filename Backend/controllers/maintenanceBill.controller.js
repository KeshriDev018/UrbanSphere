import Flat from "../models/flat.model.js";
import MaintenanceBill from "../models/maintenanceBill.model.js";
import {
  getCache,
  setCache,
  deleteCache,
  deleteCachePattern,
} from "../utils/cache.js";

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

    // Invalidate cache for bills
    await deleteCachePattern(`bills:*`);
    console.log("🗑️ Cache invalidated for bill creation");

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

    // Invalidate cache for bills
    await deleteCachePattern(`bills:*`);
    console.log("🗑️ Cache invalidated for bulk bill creation");

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
    const cacheKey = `bills:${req.user.societyId}`;

    // Check cache first
    const cached = await getCache(cacheKey);
    if (cached) {
      console.log("✅ Cache hit for getAllBills");
      return res.status(200).json({
        message: "All bills fetched",
        bills: cached,
        cached: true,
      });
    }

    const bills = await MaintenanceBill.find({
      societyId: req.user.societyId,
    })
      .populate("flatId", "flatNumber block")
      .populate("paymentIds")
      .sort({ createdAt: -1 });

    // Store in cache for 1 hour
    await setCache(cacheKey, bills, 3600);
    console.log("💾 Bill data cached");

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
    const cacheKey = `flat:${flatId}:bills`;

    // Check cache first
    const cached = await getCache(cacheKey);
    if (cached) {
      console.log("✅ Cache hit for getFlatBills");
      return res.status(200).json({
        message: "Bills fetched",
        bills: cached,
        cached: true,
      });
    }

    const bills = await MaintenanceBill.find({ flatId })
      .populate("paymentIds")
      .sort({ createdAt: -1 });

    // Store in cache for 1 hour
    await setCache(cacheKey, bills, 3600);
    console.log("💾 Flat bills cached");

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
      { new: true },
    );

    if (!updatedBill)
      return res.status(404).json({ message: "Bill not found" });

    // Invalidate cache
    await deleteCachePattern(`bills:*`);
    await deleteCachePattern(`*:bills`);
    console.log("🗑️ Cache invalidated for bill update");

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
      { new: true },
    );

    if (!updated) return res.status(404).json({ message: "Bill not found" });

    // Invalidate cache
    await deleteCachePattern(`bills:*`);
    await deleteCachePattern(`*:bills`);
    console.log("🗑️ Cache invalidated for bill status update");

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
      { new: true },
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

    // Invalidate cache
    await deleteCachePattern(`bills:*`);
    await deleteCachePattern(`*:bills`);
    console.log("🗑️ Cache invalidated for bill deletion");

    return res.status(200).json({
      message: "Bill deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
