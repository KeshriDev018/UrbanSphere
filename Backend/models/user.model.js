import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: [
        "resident",
        "admin",
        "treasurer",
        "staff",
        "superadmin",
        "developer",
      ],
      default: "resident",
    },

    flatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flat",
      default: null,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    deviceTokens: [
      {
        type: String,
      },
    ],

    profileImage: {
      type: String, // S3 URL or Cloudinary URL
      default: null,
    },

    societyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Society",
      default: null,
    },

    mustChangePassword: {
      type: Boolean,
      default: false,
    },

  },
  { timestamps: true }
);


  userSchema.methods.isPasswordCorrect = async function (password) {
 
  const result = await bcrypt.compare(password, this.password);

  return result;
};


userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this.id,
      role:this.role
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this.id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};


userSchema.methods.generateTempAccessToken = function () {
  return jwt.sign(
    {
      _id: this.id,
      role: this.role,
      force: true, // <--- important flag
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "10m", // temporary token for password reset
    }
  );
};


const User = mongoose.model("User", userSchema);
export default User;


