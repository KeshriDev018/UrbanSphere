import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyRole } from "../middlewares/verifyRole.middleware.js";
import upload from "../middlewares/multer.middleware.js";

import {
  createNotice,
  getMyNotices,
  updateNotice,
  deleteNotice,
  getNoticeById,
  getAllNotices,
} from "../controllers/notice.controller.js";

const router = Router();

/* ---------------------- ADMIN / SUPERADMIN ROUTES ---------------------- */

// Create notice with attachments
router.post(
  "/create",
  verifyJWT,
  verifyRole("admin", "superadmin"),
  upload.array("attachments", 5),
  createNotice
);

// Update a notice
router.put(
  "/update/:noticeId",
  verifyJWT,
  verifyRole("admin", "superadmin"),
  updateNotice
);

// Delete a notice
router.delete(
  "/delete/:noticeId",
  verifyJWT,
  verifyRole("admin", "superadmin"),
  deleteNotice
);

/* ---------------------- PUBLIC (STAFF + RESIDENT) ROUTES ---------------------- */

// Get notice by ID
router.get("/:noticeId", verifyJWT, getNoticeById);

// Get notices for logged-in user (filtered by audience)
router.get("/", verifyJWT, getMyNotices);

/* ---------------------- ADMIN / STAFF ROUTE ---------------------- */

// All notices without audience filter
router.get(
  "/all/notices/list",
  verifyJWT,
  verifyRole("admin", "superadmin", "staff"),
  getAllNotices
);

export default router;
