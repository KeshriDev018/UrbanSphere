import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyRole } from "../middlewares/verifyRole.middleware.js";
import  upload  from "../middlewares/multer.middleware.js";

import {
  requestSocietyRegistration,
  approveSociety,
} from "../controllers/societyRegistration.controller.js";


const router = Router();

// Public route
router.post(
  "/register",
  upload.array("documents", 5),
  requestSocietyRegistration
);

// Developer-only
router.put(
  "/approve/:requestId",
  verifyJWT,
  verifyRole("developer"), // developer role only
  approveSociety
);

export default router;
