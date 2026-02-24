import rateLimit from "express-rate-limit";

// ── Auth routes (login, register, forgot-password) ────────────────────────────
// 10 attempts per 15 minutes per IP — brute-force protection
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    statusCode: 429,
    success: false,
    message: "Too many attempts. Please wait 15 minutes and try again.",
    data: null,
  },
});

// ── Strict routes (resend email) ──────────────────────────────────────────────
// 3 attempts per hour
const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    statusCode: 429,
    success: false,
    message: "Too many requests. Please wait an hour and try again.",
    data: null,
  },
});

export { authLimiter, strictLimiter };