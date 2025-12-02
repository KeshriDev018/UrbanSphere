import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // admin or treasurer
      required: true,
    },

    attachmentUrls: [
      {
        type: String, // optional PDFs, images, links
      },
    ],

    validTill: {
      type: Date,
      default: null, // auto-hide after expiry
    },

    isImportant: {
      type: Boolean,
      default: false, // highlight emergency notices
    },

    audience: {
      type: String,
      enum: ["All", "Residents", "Staff"],
      default: "All",
    },

    societyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Society",
      required: true,
    },
  },
  { timestamps: true }
);

const Notice = mongoose.model("Notice", noticeSchema);
export default Notice;
