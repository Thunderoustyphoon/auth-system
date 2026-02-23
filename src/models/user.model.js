import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";
import { UserRoles, OAuthProviders } from "../constants/index.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/token.utils.js";

const userSchema = new Schema(
  {
    // ── Core ──────────────────────────────────────────────────────────────────
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "Please provide a valid email address"],
      index: true,
    },
    password: {
      type: String,
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // NEVER returned in queries by default
    },
    avatar: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: Object.values(UserRoles),
      default: UserRoles.USER,
    },

    // ── Email verification ────────────────────────────────────────────────────
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },

    // ── Password reset ────────────────────────────────────────────────────────
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },

    // ── OAuth ─────────────────────────────────────────────────────────────────
    // Array so a user can link multiple providers (Google only for now)
    oauthProviders: [
      {
        provider: {
          type: String,
          enum: Object.values(OAuthProviders),
        },
        providerId: { type: String },
        displayName: { type: String },
      },
    ],

    // ── Refresh Tokens (Refresh Token Rotation) ───────────────────────────────
    // Stored in DB so we can invalidate them on logout.
    // TTL index on createdAt auto-removes tokens older than 7 days.
    refreshTokens: [
      {
        token: { type: String, required: true },
        createdAt: {
          type: Date,
          default: Date.now,
          expires: 60 * 60 * 24 * 7, // mongoose TTL — auto-deletes after 7 days
        },
      },
    ],
  },
  { timestamps: true } // adds createdAt, updatedAt
);

// ── Pre-save hook: hash password ──────────────────────────────────────────────
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Instance methods ──────────────────────────────────────────────────────────

userSchema.methods.isPasswordCorrect = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return generateAccessToken(this);
};

userSchema.methods.generateRefreshToken = function () {
  return generateRefreshToken();
};

userSchema.methods.isPasswordResetTokenValid = function () {
  return this.passwordResetExpires && this.passwordResetExpires > Date.now();
};

userSchema.methods.isEmailVerificationTokenValid = function () {
  return (
    this.emailVerificationExpires &&
    this.emailVerificationExpires > Date.now()
  );
};

// Strips sensitive fields before sending user object to client
userSchema.methods.toSafeObject = function () {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    role: this.role,
    isEmailVerified: this.isEmailVerified,
    oauthProviders: this.oauthProviders?.map((p) => p.provider),
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const User = mongoose.model("User", userSchema);
