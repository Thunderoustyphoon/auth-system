import { z } from "zod";
import { nameSchema, strongPasswordSchema } from "./shared.validators.js";

const updateProfileSchema = z.object({
  name: nameSchema.optional(),

  avatar: z
    .string()
    .trim()
    .url("Avatar must be a valid URL (e.g. https://example.com/photo.jpg)")
    .max(2048, "Avatar URL is too long")
    .optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
const changePasswordSchema = z
  .object({
    currentPassword: z
      .string({ required_error: "Current password is required" })
      .trim()
      .min(1, "Current password is required"),

    newPassword: strongPasswordSchema,

    confirmNewPassword: z
      .string({ required_error: "Confirm new password is required" })
      .trim()
      .min(1, "Confirm new password is required"),
  })
  .superRefine(({ currentPassword, newPassword, confirmNewPassword }, ctx) => {
    if (newPassword === currentPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["newPassword"],
        message: "New password must be different from your current password",
      });
    }
    if (confirmNewPassword !== newPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmNewPassword"],
        message: "New passwords do not match",
      });
    }
  });

// ─────────────────────────────────────────────────────────────────────────────
const deleteAccountSchema = z.object({
  password: z
    .string()
    .trim()
    .min(1, "Password cannot be blank if provided")
    .optional()
    .nullish(),
});

export { updateProfileSchema, changePasswordSchema, deleteAccountSchema };
