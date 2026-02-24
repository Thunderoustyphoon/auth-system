import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpStatus, UserRoles } from "../constants/index.js";

// ── verifyJWT ─────────────────────────────────────────────────────────────────
// Reads the Bearer token from Authorization header, verifies it, attaches
const verifyJWT = asyncHandler(async (req, _, next) => {
  // ── Step 1: Extract token ────────────────────────────────────────────────
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(HttpStatus.UNAUTHORIZED, "Unauthorized request. No token provided.");
  }

  // ── Step 2: Verify token — try/catch needed here ─────────────────────────
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      // Client should silently call /refresh-token and retry
      throw new ApiError(
        HttpStatus.UNAUTHORIZED,
        "Access token has expired. Please refresh.",
        [{ code: "TOKEN_EXPIRED" }]
      );
    }
    if (err.name === "JsonWebTokenError") {
      // Malformed or tampered token — client should log out
      throw new ApiError(
        HttpStatus.UNAUTHORIZED,
        "Invalid access token. Please log in again."
      );
    }
    // Any other jwt error (NotBeforeError etc.)
    throw new ApiError(HttpStatus.UNAUTHORIZED, "Token verification failed.");
  }

  // ── Step 3: Find user in DB ──────────────────────────────────────────────
  // try/catch here gives a clearer message if the DB call fails vs "not found"
  let user;
  try {
    user = await User.findById(decodedToken._id).select(
      "-password -refreshTokens -emailVerificationToken -passwordResetToken"
    );
  } catch (err) {
    // DB error (connection lost, bad ObjectId shape, etc.)
    throw new ApiError(
      HttpStatus.INTERNAL,
      "Error fetching user. Please try again.",
      [],
      err.stack
    );
  }

  if (!user) {
    // Token was valid but the user was deleted — edge case
    throw new ApiError(
      HttpStatus.UNAUTHORIZED,
      "User belonging to this token no longer exists."
    );
  }

  req.user = user;
  next();
});

// ── verifyAdmin ───────────────────────────────────────────────────────────────
// Must be used AFTER verifyJWT. Checks the role field.
const verifyAdmin = asyncHandler(async (req, _, next) => {
  if (req.user?.role !== UserRoles.ADMIN) {
    throw new ApiError(
      HttpStatus.FORBIDDEN,
      "Admin access required. You don't have permission."
    );
  }
  next();
});

// ── verifyEmailVerified ───────────────────────────────────────────────────────
// Blocks unverified users from accessing certain routes.
// Must be used AFTER verifyJWT.
const verifyEmailVerified = asyncHandler(async (req, _, next) => {
  if (!req.user?.isEmailVerified) {
    throw new ApiError(
      HttpStatus.FORBIDDEN,
      "Please verify your email address to access this resource",
      [{ code: "EMAIL_NOT_VERIFIED" }]
    );
  }
  next();
});

export { verifyJWT, verifyAdmin, verifyEmailVerified };
