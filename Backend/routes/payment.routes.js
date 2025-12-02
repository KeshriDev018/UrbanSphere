import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createOrder,
  getAllPayments,
  getPaymentsByFlat,
  razorpayWebhook,
  refundPayment,
  verifyPayment,
} from "../controllers/payment.controller.js";

const router = Router();

router.post("/create-order", verifyJWT, createOrder);
router.post("/verify", verifyJWT, verifyPayment);

router.get("/all", verifyJWT, verifyRole("treasurer", "admin"), getAllPayments);
router.get("/flat/:flatId", verifyJWT, getPaymentsByFlat);

router.post(
  "/refund",
  verifyJWT,
  verifyRole("superadmin", "treasurer"),
  refundPayment
);

router.post("/webhook", razorpayWebhook); 

export default router;
