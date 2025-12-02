import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    flatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flat",
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // resident who created complaint
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: [
        "Plumbing",
        "Electrical",
        "Cleaning",
        "Lift",
        "Security",
        "General",
      ],
      default: "General",
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
    },

    societyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Society",
      required: true,
    },

    status: {
      type: String,
      enum: ["New", "Assigned", "In Progress", "Resolved", "Closed"],
      default: "New",
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // staff userId
      default: null,
    },

    images: [
      {
        type: String, // image URLs
      },
    ],

    comments: [
      {
        commentBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        message: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // SLA Deadline (optional cron job can auto-escalate)
    slaDeadline: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const Complaint = mongoose.model("Complaint", complaintSchema);
export default Complaint;
