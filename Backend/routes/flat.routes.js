import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyRole } from "../middlewares/verifyRole.middleware.js";

import {
  createFlat,
  bulkCreateFlats,
  getAllFlats,
  getFlatById,
  assignResidentToFlat,
  removeResidentFromFlat,
  updateFlat,
  deleteFlat
} from "../controllers/flat.controller.js";

const router = Router();

/* ---------------------- ADMIN / SUPERADMIN ROUTES ---------------------- */

// Create a new flat
router.post(
  "/create",
  verifyJWT,
  verifyRole("admin","superadmin"),
  createFlat
);
router.post(
  "/createbulk",
  verifyJWT,
  verifyRole("admin","superadmin"),
  bulkCreateFlats
);

// Get all flats in society
router.get("/", verifyJWT, verifyRole("admin", "superadmin"), getAllFlats);

// Get specific flat details
router.get(
  "/:flatId",
  verifyJWT,
  verifyRole("admin", "superadmin"),
  getFlatById
);

// Assign a resident to a flat
router.put(
  "/assign",
  verifyJWT,
  verifyRole("admin", "superadmin"),
  assignResidentToFlat
);

// Remove resident from flat
router.put(
  "/remove",
  verifyJWT,
  verifyRole("admin", "superadmin"),
  removeResidentFromFlat
);

// Update flat details
router.put(
  "/update/:flatId",
  verifyJWT,
  verifyRole("admin", "superadmin"),
  updateFlat
);

// Get specific flat details
router.delete(
  "/:flatId",
  verifyJWT,
  verifyRole("admin", "superadmin"),
  deleteFlat
);

export default router;
