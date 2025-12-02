import mongoose from "mongoose";

const staffSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one staff profile per user
    },

    staffRole: {
      type: String,
      enum: ["guard", "maintenance"],
      required: true,
    },

    shift: {
      type: String,
      enum: ["Morning", "Evening", "Night", "Rotational"],
      default: "Morning",
    },

    // optional fields
    skills: [
      {
        type: String, // e.g., "Plumbing", "Electrical"
      },
    ],
    societyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Society",
      required: true,
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Staff = mongoose.model("Staff", staffSchema);
export default Staff;
