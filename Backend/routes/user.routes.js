import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyRole } from "../middlewares/verifyRole.middleware.js";
import upload from "../middlewares/multer.middleware.js";
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getCurrentUser,
  updateProfile,
  updateProfileImage,
  getAllResidents,
  getPendingResidents,
  approveResident,
  assignFlat,
  changeUserRole,
  getUserById,
  changePassword,
  deleteUser,
  forceChangePassword,
  createUserWithRole,
} from "../controllers/user.controller.js";

const router = Router();

/* ---------- AUTH ROUTES ---------- */
router.post("/register", upload.single("profileImage"), registerUser);
router.post("/login",loginUser);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", verifyJWT, logoutUser);
router.get("/me", verifyJWT, getCurrentUser);

/* ---------- PROFILE ---------- */
router.put("/updateProfile", verifyJWT, updateProfile);
router.put(
  "/updateProfileImage",
  verifyJWT,
  upload.single("profileImage"),
  updateProfileImage
);
router.put("/changePassword", verifyJWT, changePassword);
router.put("/forcechangePassword", verifyJWT, forceChangePassword);

/* ---------- ADMIN / SUPERADMIN ROUTES ---------- */
router.get(
  "/residents/:societyId",
  verifyJWT,
  verifyRole("admin", "superadmin"),
  getAllResidents
);

router.get(
  "/residents/pending/:societyId",
  verifyJWT,
  verifyRole("admin", "superadmin"),
  getPendingResidents
);

router.put(
  "/residents/approve/:userId",
  verifyJWT,
  verifyRole("admin", "superadmin"),
  approveResident
);

router.put(
  "/residents/assign-flat/:userId",
  verifyJWT,
  verifyRole("admin", "superadmin"),
  assignFlat
);

/* CREATE STAFF/ADMIN (ONLY ADMIN & SUPERADMIN) */
router.post(
  "/users",
  verifyJWT,
  verifyRole("admin", "superadmin"),
  createUserWithRole
);

/* CHANGE USER ROLE */
router.put(
  "/users/:userId/role",
  verifyJWT,
  verifyRole("admin", "superadmin"),
  changeUserRole
);

/* DELETE USER */
router.delete(
  "/users/:userId",
  verifyJWT,
  verifyRole("admin", "superadmin"),
  deleteUser
);

/* GET USER BY ID */
router.get(
  "/users/:userId",
  verifyJWT,
  verifyRole("admin", "superadmin"),
  getUserById
);

export default router;
 