import mongoose from "mongoose";

const societyRegistrationSchema = new mongoose.Schema(
  {
    societyName: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: String,
    state: String,
    pincode: String,

    chairpersonName: {
      type: String,
      required: true,
    },
    chairpersonEmail: {
      type: String,
      required: true,
    },
    chairpersonPhone: {
      type: String,
      required: true,
    },

    numberOfFlats: {
      type: Number,
      required: true,
    },

    documents: [String], // cloudinary URLs

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    approvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("SocietyRegistration", societyRegistrationSchema);
