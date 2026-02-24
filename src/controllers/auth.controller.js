import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  sendRefreshTokenCookie,
  clearRefreshTokenCookie,
  generateSecureToken,
} from "../utils/token.utils.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from "../utils/email.utils.js";
import { HttpStatus, TokenExpiry } from "../constants/index.js";

// ─────────────────────────────────────────────────────────────────────────────
// SHARED HELPER — used by login, refresh, OAuth

const generateTokensAndSetCookie = async (user, res) => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  user.refreshTokens.push({ token: refreshToken });
  // validateBeforeSave: false — only pushing a token, don't re-run all validators
  await user.save({ validateBeforeSave: false });
  sendRefreshTokenCookie(res, refreshToken);
  return accessToken;
};

// ─────────────────────────────────────────────────────────────────────────────
// POST register

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  // email is already lowercase + trimmed. name is already trimmed + HTML-escaped.

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(HttpStatus.CONFLICT, "An account with this email already exists");
  }

  const emailVerificationToken = generateSecureToken();
  const emailVerificationExpires = new Date(Date.now() + TokenExpiry.EMAIL_VERIFY);

  const user = await User.create({
    name,
    email,
    password,
    emailVerificationToken,
    emailVerificationExpires,
  });

  // try/catch: email is a side effect — user is already created in DB.
  // An SMTP failure must NOT roll back a successful registration.
  // User can use /resend-verification if they don't get the email.
  try {
    await sendVerificationEmail(user, emailVerificationToken);
  } catch (emailError) {
    console.error(` Verification email failed for ${user.email}:`, emailError.message);
  }

  return res.status(HttpStatus.CREATED).json(
    new ApiResponse(
      HttpStatus.CREATED,
      { email: user.email },
      "Account created! Please check your email to verify your account."
    )
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// GET verify-email.

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;

  if (!token) {
    throw new ApiError(HttpStatus.BAD_REQUEST, "Verification token is required");
  }

  const user = await User.findOne({ emailVerificationToken: token }).select(
    "+emailVerificationToken +emailVerificationExpires"
  );

  if (!user) {
    throw new ApiError(
      HttpStatus.BAD_REQUEST,
      "Invalid verification link. It may have already been used."
    );
  }

  if (!user.isEmailVerificationTokenValid()) {
    throw new ApiError(
      HttpStatus.BAD_REQUEST,
      "Verification link has expired. Please request a new one.",
      [{ code: "TOKEN_EXPIRED" }]
    );
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  // try/catch: welcome email must NOT un-verify the user if SMTP fails.
  // Verification already happened — this email is purely informational.
  try {
    await sendWelcomeEmail(user);
  } catch (emailError) {
    console.error(` Welcome email failed for ${user.email}:`, emailError.message);
  }

  return res.status(HttpStatus.OK).json(
    new ApiResponse(HttpStatus.OK, null, "Email verified successfully! You can now log in.")
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// POST resend-verification

const resendVerificationEmail = asyncHandler(async (req, res) => {
  const { email } = req.body; // already lowercased by Zod

  // Always return the same response — prevents email enumeration.
  // Attacker can't learn whether an email exists in the system.
  const safeResponse = new ApiResponse(
    HttpStatus.OK,
    null,
    "If an unverified account exists with that email, a new link has been sent."
  );

  const user = await User.findOne({ email }).select(
    "+emailVerificationToken +emailVerificationExpires"
  );

  if (!user || user.isEmailVerified) {
    return res.status(HttpStatus.OK).json(safeResponse);
  }

  user.emailVerificationToken = generateSecureToken();
  user.emailVerificationExpires = new Date(Date.now() + TokenExpiry.EMAIL_VERIFY);
  await user.save({ validateBeforeSave: false });

  // try/catch: email is a side effect — safeResponse is returned either way.
  try {
    await sendVerificationEmail(user, user.emailVerificationToken);
  } catch (emailError) {
    console.error(`⚠️  Resend verification failed for ${user.email}:`, emailError.message);
  }

  return res.status(HttpStatus.OK).json(safeResponse);
});

// ─────────────────────────────────────────────────────────────────────────────
// POST login

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body; // email is already lowercased by Zod

  // +password: needed because schema has select: false — never returned normally
  const user = await User.findOne({ email }).select("+password");

  // SAME message for "user not found" and "wrong password".
  // Different messages would let an attacker enumerate valid emails.
  if (!user || !user.password) {
    throw new ApiError(HttpStatus.UNAUTHORIZED, "Invalid email or password");
  }

  let isPasswordValid;
  try {
    isPasswordValid = await user.isPasswordCorrect(password);
  } catch (bcryptError) {
    throw new ApiError(
      HttpStatus.INTERNAL,
      "Error verifying credentials. Please try again.",
      [],
      bcryptError.stack
    );
  }

  if (!isPasswordValid) {
    throw new ApiError(HttpStatus.UNAUTHORIZED, "Invalid email or password");
  }

  const accessToken = await generateTokensAndSetCookie(user, res);

  return res.status(HttpStatus.OK).json(
    new ApiResponse(
      HttpStatus.OK,
      { accessToken, user: user.toSafeObject() },
      "Login successful"
    )
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// POST refresh-token and refresh-token rotation
//

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(
      HttpStatus.UNAUTHORIZED,
      "No refresh token found. Please log in again."
    );
  }

  const user = await User.findOne({ "refreshTokens.token": incomingRefreshToken });

  if (!user) {
    throw new ApiError(
      HttpStatus.UNAUTHORIZED,
      "Invalid or expired refresh token. Please log in again."
    );
  }

  // Rotation: remove old token, generateTokensAndSetCookie adds the new one
  user.refreshTokens = user.refreshTokens.filter(
    (rt) => rt.token !== incomingRefreshToken
  );

  const accessToken = await generateTokensAndSetCookie(user, res);

  return res.status(HttpStatus.OK).json(
    new ApiResponse(
      HttpStatus.OK,
      { accessToken, user: user.toSafeObject() },
      "Access token refreshed successfully"
    )
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// POST logout

const logoutUser = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;

  if (refreshToken) {
    try {
      await User.findOneAndUpdate(
        { "refreshTokens.token": refreshToken },
        { $pull: { refreshTokens: { token: refreshToken } } }
      );
    } catch (dbError) {
      // Log it but do NOT re-throw — cookie is cleared regardless below
      console.error(" Could not remove refresh token from DB:", dbError.message);
    }
  }

  clearRefreshTokenCookie(res);

  return res.status(HttpStatus.OK).json(
    new ApiResponse(HttpStatus.OK, null, "Logged out successfully")
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// POST logoutall (requires verifyJWT)

const logoutAllDevices = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $set: { refreshTokens: [] } });
  clearRefreshTokenCookie(res);

  return res.status(HttpStatus.OK).json(
    new ApiResponse(HttpStatus.OK, null, "Logged out from all devices successfully")
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// POST forgot password

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body; // already lowercased by Zod

  // Same response whether user exists or not — prevents email enumeration
  const safeResponse = new ApiResponse(
    HttpStatus.OK,
    null,
    "If an account exists with that email, a password reset link has been sent."
  );

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(HttpStatus.OK).json(safeResponse);
  }

  user.passwordResetToken = generateSecureToken();
  user.passwordResetExpires = new Date(Date.now() + TokenExpiry.PASSWORD_RESET);
  await user.save({ validateBeforeSave: false });

  try {
    await sendPasswordResetEmail(user, user.passwordResetToken);
  } catch (emailError) {
    // Revert — partial state (token in DB but no email sent) is dangerous
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    console.error(` Password reset email failed for ${user.email}:`, emailError.message);
    throw new ApiError(
      HttpStatus.INTERNAL,
      "Failed to send password reset email. Please try again later."
    );
  }

  return res.status(HttpStatus.OK).json(safeResponse);
});

// ─────────────────────────────────────────────────────────────────────────────
// POST for reset password

const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.query;
  const { password } = req.body;
  // confirmPassword already checked by Zod — passwords match is guaranteed here

  if (!token) {
    throw new ApiError(HttpStatus.BAD_REQUEST, "Reset token is required");
  }

  const user = await User.findOne({ passwordResetToken: token }).select(
    "+passwordResetToken +passwordResetExpires"
  );

  if (!user || !user.isPasswordResetTokenValid()) {
    throw new ApiError(
      HttpStatus.BAD_REQUEST,
      "Invalid or expired reset link. Please request a new one."
    );
  }

  try {
    user.password = password; // Mongoose pre-save hook hashes this
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshTokens = []; // force logout all devices — password changed
    await user.save();
  } catch (saveError) {
    throw new ApiError(
      HttpStatus.INTERNAL,
      "Failed to reset password. Please try again.",
      [],
      saveError.stack
    );
  }

  clearRefreshTokenCookie(res);

  return res.status(HttpStatus.OK).json(
    new ApiResponse(
      HttpStatus.OK,
      null,
      "Password reset successful! Please log in with your new password."
    )
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// OAuth callback (Google) — called after Passport verifies the user
//
// try/catch on token generation: a failure here should redirect with an error
// param, not crash the browser with a raw 500 page.
const oauthCallback = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    console.error(" OAuth callback: No user attached to request");
    return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
  }

  // Verify email was actually saved
  if (!user.email) {
    console.error(" OAuth callback: User created but email is missing!", { 
      userId: user._id, 
      email: user.email 
    });
    return res.redirect(`${process.env.CLIENT_URL}/login?error=no_email`);
  }

  console.log(` OAuth callback: User authenticated - ${user.email}`);

  let accessToken;
  try {
    accessToken = await generateTokensAndSetCookie(user, res);
    console.log(` OAuth: Tokens generated for ${user.email}`);
  } catch (tokenError) {
    console.error("  OAuth token generation failed:", tokenError.message);
    return res.redirect(`${process.env.CLIENT_URL}/login?error=login_failed`);
  }

  return res.redirect(
    `${process.env.CLIENT_URL}/oauth-callback?token=${accessToken}`
  );
});

export {
  registerUser,
  verifyEmail,
  resendVerificationEmail,
  loginUser,
  refreshAccessToken,
  logoutUser,
  logoutAllDevices,
  forgotPassword,
  resetPassword,
  oauthCallback,
};