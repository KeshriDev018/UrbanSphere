import mongoose from "mongoose";

const maintenanceBillSchema = new mongoose.Schema(
  {
    flatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flat",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    lineItems: [
      {
        label: { type: String }, // e.g., "Maintenance", "Water", "Penalty"
        amount: { type: Number },
      },
    ],

    month: {
      type: String, // e.g., "Jan-2025"
      required: true,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Paid", "Overdue", "Partially Paid"],
      default: "Pending",
    },

    paymentIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment",
      },
    ],

    notes: {
      type: String,
      default: "",
    },

    societyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Society",
      required: true,
    },
  },
  { timestamps: true }
);

const MaintenanceBill = mongoose.model(
  "MaintenanceBill",
  maintenanceBillSchema
);
export default MaintenanceBill;
