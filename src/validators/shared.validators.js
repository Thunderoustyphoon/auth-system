import { z } from "zod";

export const emailSchema = z
  .string({ required_error: "Email is required" })
  .trim()
  .min(1, "Email is required")
  .email("Please provide a valid email address")
  .toLowerCase();

// ─────────────────────────────────────────────────────────────────────────────
export const strongPasswordSchema = z
  .string({ required_error: "Password is required" })
  .trim()
  .min(1, "Password is required")
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password cannot exceed 128 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
    "Password must contain at least one special character (!@#$%^& etc.)"
  );

// ─────────────────────────────────────────────────────────────────────────────
export const nameSchema = z
  .string({ required_error: "Name is required" })
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(50, "Name cannot exceed 50 characters")
  .regex(
    /^[a-zA-Z '-]+$/,
    "Name can only contain letters, spaces, hyphens, and apostrophes"
  )
  .transform((val) =>
    val
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
  );
