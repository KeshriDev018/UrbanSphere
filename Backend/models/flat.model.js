import mongoose from "mongoose";

const flatSchema = new mongoose.Schema(
  {
    block: {
      type: String,
      required: true, // Example: "A", "B", "C"
      trim: true,
    },

    flatNumber: {
      type: String,
      required: true, // Example: "101", "204"
      trim: true,
    },

    floor: {
      type: Number,
      required: true,
    },
    societyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Society",
      required: true,
    },

    // List of residents linked to User model
    residentIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    parkingSlotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ParkingSlot", // optional future model
      default: null,
    },
  },
  { timestamps: true }
);

const Flat = mongoose.model("Flat", flatSchema);
export default Flat;
