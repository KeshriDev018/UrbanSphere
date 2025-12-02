import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyRole } from "../middlewares/verifyRole.middleware.js";
import upload from "../middlewares/multer.middleware.js";

import {
  createPackage,
  getPendingPackages,
  markAsPickedUp,
  getMyPackages,
  getAllPackages,
  deletePackage,
} from "../controllers/package.controller.js";

const router = Router();

/* ---------------------- GUARD ROUTES ---------------------- */

// Guard adds a package
router.post(
  "/create",
  verifyJWT,
  verifyRole("guard", "admin", "superadmin"),
  upload.single("packagePhoto"),
  createPackage
);

// Guard sees all pending packages for society
router.get(
  "/pending",
  verifyJWT,
  verifyRole("guard", "admin", "superadmin"),
  getPendingPackages
);

// Guard marks a package as picked up
router.put(
  "/pickup/:packageId",
  verifyJWT,
  verifyRole("guard", "admin", "superadmin"),
  markAsPickedUp
);

/* ---------------------- RESIDENT ROUTES ---------------------- */

// Resident sees their own packages
router.get(
  "/my",
  verifyJWT,
  verifyRole("resident", "admin", "superadmin"),
  getMyPackages
);

/* ---------------------- ADMIN / SUPERADMIN ROUTES ---------------------- */

// Admin gets all packages
router.get(
  "/all",
  verifyJWT,
  verifyRole("admin", "superadmin"),
  getAllPackages
);

// Admin deletes a package
router.delete(
  "/delete/:packageId",
  verifyJWT,
  verifyRole("admin", "superadmin"),
  deletePackage
);

export default router;
