import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyRole } from "../middlewares/verifyRole.middleware.js";

import {
  createBill,
  createBulkBills,
  getAllBills,
  getFlatBills,
  updateBill,
  updateBillStatus,
  addPaymentToBill,
  deleteBill,
} from "../controllers/maintenanceBill.controller.js";

const router = Router();

/* ---------------------- ADMIN / SUPERADMIN ROUTES ---------------------- */

// Create bill for a single flat
router.post(
  "/create",
  verifyJWT,
  verifyRole("admin", "superadmin"),
  createBill
);

// Create bill for ALL flats in society
router.post(
  "/create-bulk",
  verifyJWT,
  verifyRole("admin", "superadmin"),
  createBulkBills
);

// Get ALL bills in society
router.get("/", verifyJWT, verifyRole("admin", "superadmin"), getAllBills);

// Update bill
router.put(
  "/update/:billId",
  verifyJWT,
  verifyRole("admin", "superadmin"),
  updateBill
);

// Admin manually updates status (optional)
router.put(
  "/status/:billId",
  verifyJWT,
  verifyRole("admin", "superadmin"),
  updateBillStatus
);

// Add paymentId to bill (Razorpay success)
router.put(
  "/add-payment/:billId",
  verifyJWT,
  verifyRole("admin", "superadmin"),
  addPaymentToBill
);

// Delete bill
router.delete(
  "/delete/:billId",
  verifyJWT,
  verifyRole("admin", "superadmin"),
  deleteBill
);

/* ---------------------- RESIDENT ROUTES ---------------------- */

// Get all bills for a specific flat
router.get(
  "/flat/:flatId",
  verifyJWT,
  verifyRole("resident", "admin", "superadmin"),
  getFlatBills
);

export default router;
