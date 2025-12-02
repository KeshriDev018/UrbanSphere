import mongoose from "mongoose";

const societySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: String,
    city: String,
    state: String,
    pincode: String,

    numberOfFlats: Number,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Society", societySchema);
