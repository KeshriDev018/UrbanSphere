import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // who performed the action
    },

    action: {
      type: String,
      required: true, // e.g., "CREATED_BILL", "UPDATED_COMPLAINT", "CHECKED_IN_VISITOR"
    },

    targetModel: {
      type: String,
      required: true, // e.g., "MaintenanceBill", "Complaint", "Visitor"
    },

    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false, // ID of the resource affected
    },

    description: {
      type: String,
      default: "", // human-readable summary
    },

    metadata: {
      type: Object,
      default: {}, // store any extra details
    },

    ipAddress: {
      type: String,
      default: null,
    },

    userAgent: {
      type: String,
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

const AuditLog = mongoose.model("AuditLog", auditLogSchema);
export default AuditLog;
