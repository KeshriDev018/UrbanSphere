import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyRole } from "../middlewares/verifyRole.middleware.js";
import upload from "../middlewares/multer.middleware.js";

import {
  createVisitor,
  approveVisitor,
  rejectVisitor,
  exitVisitor,
  getPendingVisitors,
  getMyVisitors,
  getAllVisitors,
  deleteVisitor,
} from "../controllers/visitor.controller.js";

const router = Router();

/* ---------------------- GUARD ROUTES ---------------------- */

// Guard creates visitor entry
router.post(
  "/create",
  verifyJWT,
  verifyRole("guard", "admin", "superadmin"),
  upload.single("photo"),
  createVisitor
);

// Guard marks visitor exit
router.put(
  "/exit/:visitorId",
  verifyJWT,
  verifyRole("guard", "admin", "superadmin"),
  exitVisitor
);

/* ---------------------- RESIDENT ROUTES ---------------------- */

// Resident gets visitors waiting for approval
router.get(
  "/pending",
  verifyJWT,
  verifyRole("resident", "admin", "superadmin"),
  getPendingVisitors
);

// Resident approves visitor
router.put(
  "/approve/:visitorId",
  verifyJWT,
  verifyRole("resident", "admin", "superadmin"),
  approveVisitor
);

// Resident rejects visitor
router.put(
  "/reject/:visitorId",
  verifyJWT,
  verifyRole("resident", "admin", "superadmin"),
  rejectVisitor
);

// Resident gets full visitor history
router.get(
  "/my",
  verifyJWT,
  verifyRole("resident", "admin", "superadmin"),
  getMyVisitors
);

/* ---------------------- ADMIN ROUTES ---------------------- */

// Admin or Guard sees all visitors in society
router.get(
  "/all",
  verifyJWT,
  verifyRole("guard", "admin", "superadmin"),
  getAllVisitors
);

// Admin deletes visitor entry
router.delete(
  "/delete/:visitorId",
  verifyJWT,
  verifyRole("admin", "superadmin"),
  deleteVisitor
);

export default router;
