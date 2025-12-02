import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyRole } from "../middlewares/verifyRole.middleware.js";

import {
  createFlat,
  getAllFlats,
  getFlatById,
  assignResidentToFlat,
  removeResidentFromFlat,
  updateFlat,
} from "../controllers/flat.controller.js";

const router = Router();

/* ---------------------- ADMIN / SUPERADMIN ROUTES ---------------------- */

// Create a new flat
router.post(
  "/create",
  verifyJWT,
  verifyRole("admin", "superadmin"),
  createFlat
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

export default router;
