import mongoose from "mongoose";

const visitorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    purpose: {
      type: String,
      enum: ["Delivery", "Guest", "Maintenance", "Cab", "Other"],
      required: true,
    },

    vehicleNo: {
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
      ref: "User",
      required: true,
    },

    photoUrl: {
      type: String,
      default: null,
    },

    // Resident approval
    approvedByResident: {
      type: Boolean,
      default: false,
    },

    rejectedByResident: {
      type: Boolean,
      default: false,
    },

    residentResponseTime: {
      type: Date,
      default: null,
    },

    checkInTime: {
      type: Date,
      default: Date.now,
    },

    checkOutTime: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Exited"],
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

const Visitor = mongoose.model("Visitor", visitorSchema);
export default Visitor;
