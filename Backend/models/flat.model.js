import mongoose from "mongoose";

const flatSchema = new mongoose.Schema(
  {
    block: {
      type: String,
      required: true,
      trim: true,
    },

    flatNumber: {
      type: String,
      required: true,
      trim: true,
    },

    floor: {
      type: Number,
      required: true,
    },

    // 🔥 ADD THIS (you are already using it)
    type: {
      type: String,
      enum: ["1BHK", "2BHK", "3BHK"],
      required: true,
    },

    // 🔥 ADD THIS (very important)
    status: {
      type: String,
      enum: ["VACANT", "OCCUPIED"],
      default: "VACANT",
    },

    societyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Society",
      required: true,
    },

    residentIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    parkingSlotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ParkingSlot",
      default: null,
    },
  },
  { timestamps: true },
);

flatSchema.index({ societyId: 1, block: 1, flatNumber: 1 }, { unique: true });

const Flat = mongoose.model("Flat", flatSchema);
export default Flat;
