import { Router } from "express";
import passport from "passport";
import {
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
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { authLimiter, strictLimiter } from "../middlewares/rateLimiter.middleware.js";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resendVerificationSchema,
} from "../validators/auth.validators.js";

const router = Router();

// ── Standard Auth ─────────────────────────────────────────────────────────────
router.route("/register").post(authLimiter, validate(registerSchema), registerUser);
router.route("/verify-email").get(verifyEmail);
router.route("/resend-verification").post(strictLimiter, validate(resendVerificationSchema), resendVerificationEmail);
router.route("/login").post(authLimiter, validate(loginSchema), loginUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/logout").post(logoutUser);
router.route("/logout-all").post(verifyJWT, logoutAllDevices);
router.route("/forgot-password").post(authLimiter, validate(forgotPasswordSchema), forgotPassword);
router.route("/reset-password").post(validate(resetPasswordSchema), resetPassword);

// ── Google OAuth ──────────────────────────────────────────────────────────────
router.route("/google").get(
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);
router.route("/google/callback").get(
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed`,
  }),
  oauthCallback
);


export default router;
