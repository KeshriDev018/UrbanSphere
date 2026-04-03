import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyRole } from "../middlewares/verifyRole.middleware.js";
import upload from "../middlewares/multer.middleware.js";

import {
  createComplaint,
  getMyComplaints,
  closeComplaint,
  getAllComplaints,
  assignComplaintToStaff,
  updateComplaintPriority,
  setSLADeadline,
  getAssignedComplaints,
  updateComplaintStatus,
} from "../controllers/complaint.controller.js";

const router = Router();

/* ----------------------------------------------------
   USER ROUTES
---------------------------------------------------- */

// Create complaint (with multiple images)
router.post(
  "/create",
  verifyJWT,
  upload.array("images", 5), // <-- multiple image upload
  createComplaint
);

// Get logged-in user's complaints
router.get("/my", verifyJWT, getMyComplaints);

// Close own complaint
router.put("/close/:complaintId", verifyJWT, closeComplaint);

/* ----------------------------------------------------
   ADMIN ROUTES
---------------------------------------------------- */

// Get all complaints in the society (admin/staff)
router.get(
  "/all",
  verifyJWT,
  verifyRole("admin", "superadmin", "staff"),
  getAllComplaints
);

// Assign complaint to a staff
router.post(
  "/assign/:complaintId",
  verifyJWT,
  verifyRole("admin", "superadmin"),
  assignComplaintToStaff
);

// Update complaint priority (admin only)
router.post(
  "/priority/:complaintId",
  verifyJWT,
  verifyRole("admin", "superadmin"),
  updateComplaintPriority
);

// Set SLA deadline (admin only)
router.post(
  "/sla/:complaintId",
  verifyJWT,
  verifyRole("admin", "superadmin"),
  setSLADeadline
);

/* ----------------------------------------------------
   STAFF ROUTES
---------------------------------------------------- */

// Staff: Get complaints assigned to them
router.get("/assigned", verifyJWT, verifyRole("staff"), getAssignedComplaints);

/* ----------------------------------------------------
   ANY ROLE CONTROLLER (Assignee Only)
---------------------------------------------------- */

// Staff/Admin updating the complaint status
router.post("/status/:complaintId", verifyJWT,verifyRole("admin","superadmin","staff"), updateComplaintStatus);

export default router;
