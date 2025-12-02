import mongoose from "mongoose";

const packageSchema = new mongoose.Schema(
  {
    courierName: {
      type: String,
      required: true, // e.g., Amazon, Flipkart, DTDC
      trim: true,
    },

    trackingNumber: {
      type: String,
      default: null,
    },

    flatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flat",
      required: true,
    },

    createdByGuard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // guard user
      required: true,
    },

    packagePhoto: {
      type: String,
      default: null, // optional photo of package
    },

    arrivalTime: {
      type: Date,
      default: Date.now,
    },

    pickedUpBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // resident
      default: null,
    },

    pickedUpTime: {
      type: Date,
      default: null,
    },

    pickupVerificationMethod: {
      type: String,
      enum: ["QR", "OTP", "Manual"],
      default: "Manual",
    },

    status: {
      type: String,
      enum: ["Pending", "Picked Up"],
      default: "Pending",
    },

    societyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Society",
      required: true,
    },
  },
  { timestamps: true }
);

const Package = mongoose.model("Package", packageSchema);
export default Package;
