import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyRole } from "../middlewares/verifyRole.middleware.js";

import {
  getAllStaff,
  getStaffById,
  updateStaff,
} from "../controllers/staff.controller.js";

const router = Router();

/* ---------------------- ADMIN / SUPERADMIN ROUTES ---------------------- */

// Get all staff
router.get("/", verifyJWT, verifyRole("admin", "superadmin"), getAllStaff);

// Get single staff by ID
router.get(
  "/:staffId",
  verifyJWT,
  verifyRole("admin", "superadmin"),
  getStaffById
);

// Update staff details
router.put(
  "/update/:staffId",
  verifyJWT,
  verifyRole("admin", "superadmin"),
  updateStaff
);

export default router;
