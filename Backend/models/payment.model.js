import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    billId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MaintenanceBill",
      required: true,
    },

    flatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flat",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    method: {
      type: String,
      enum: ["online", "cash", "cheque"],
      default: "online",
    },

    provider: {
      type: String, // e.g. Razorpay, Stripe
      default: "Razorpay",
    },

    providerPaymentId: {
      type: String, // payment_id from gateway
      required: true,
    },

    providerOrderId: {
      type: String, // order_id from gateway
      required: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Success", "Failed"],
      default: "Pending",
    },

    receiptUrl: {
      type: String, // URL to generated PDF receipt
      default: null,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    societyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Society",
      required: true,
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
