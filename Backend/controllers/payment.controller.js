import MaintenanceBill from "../models/maintenanceBill.model";
import { razorpay } from "../src/config/razorpay.config";
import crypto from "crypto";
import Payment from "../models/payment.model.js";





export const createOrder = async (req, res) => {
  try {
    const { billId } = req.body;

    if (!billId) return res.status(400).json({ message: "billId required" });

    // Get the bill details
    const bill = await MaintenanceBill.findById(billId);
    if (!bill) return res.status(404).json({ message: "Bill not found" });

    const options = {
      amount: bill.amount * 100, // convert to paise
      currency: "INR",
      receipt: "receipt_" + bill._id,
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      message: "Order created",
      orderId: order.id,
      amount: bill.amount,
      currency: "INR",
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};



export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      billId,
    } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment details" });
    }

    // Verify signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (expectedSign !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    // Store payment in DB
    const bill = await MaintenanceBill.findById(billId);

    const payment = await Payment.create({
      billId,
      flatId: bill.flatId,
      amount: bill.amount,
      method: "online",
      provider: "Razorpay",
      providerPaymentId: razorpay_payment_id,
      providerOrderId: razorpay_order_id,
      status: "Success",
      paidAt: new Date(),
      societyId: req.user.societyId,
    });

    // Add payment to bill
    bill.paymentIds.push(payment._id);
    bill.status = "Paid";
    await bill.save();

    return res.status(200).json({
      message: "Payment successful",
      payment,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find({
      societyId: req.user.societyId,
    })
      .populate("flatId", "flatNumber block")
      .populate("billId", "month amount")
      .sort({ paidAt: -1 });

    return res.status(200).json({
      message: "All payments fetched",
      payments,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


export const getPaymentsByFlat = async (req, res) => {
  try {
    const { flatId } = req.params;

    const payments = await Payment.find({ flatId })
      .populate("billId", "month amount")
      .sort({ paidAt: -1 });

    return res.status(200).json({ payments });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


export const refundPayment = async (req, res) => {
  try {
    const { paymentId } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    const refund = await razorpay.payments.refund(payment.providerPaymentId);

    payment.status = "Refunded";
    await payment.save();

    return res.status(200).json({
      message: "Payment refunded",
      refund,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


export const razorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    const hmac = crypto
      .createHmac("sha256", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hmac !== req.headers["x-razorpay-signature"]) {
      return res.status(400).json({ message: "Invalid webhook signature" });
    }

    const event = req.body.event;

    if (event === "payment.captured") {
      const payment = req.body.payload.payment.entity;

      await Payment.findOneAndUpdate(
        { providerPaymentId: payment.id },
        { status: "Success", paidAt: new Date() }
      );
    }

    return res.status(200).json({ message: "Webhook processed" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

