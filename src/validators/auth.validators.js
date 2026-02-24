
import { z } from "zod";
import { emailSchema, strongPasswordSchema, nameSchema } from "./shared.validators.js";

const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: strongPasswordSchema,
});

// ─────────────────────────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string({ required_error: "Password is required" })
    .trim()
    .min(1, "Password is required"),
});

// ─────────────────────────────────────────────────────────────────────────────
const forgotPasswordSchema = z.object({
  email: emailSchema,
});

// ─────────────────────────────────────────────────────────────────────────────
const resetPasswordSchema = z
  .object({
    password: strongPasswordSchema,
    confirmPassword: z
      .string({ required_error: "Confirm password is required" })
      .trim()
      .min(1, "Confirm password is required"),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
    }
  });

// ─────────────────────────────────────────────────────────────────────────────
const resendVerificationSchema = z.object({
  email: emailSchema,
});

export {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resendVerificationSchema,
};
