import { ApiError } from "../utils/ApiError.js";
import { HttpStatus } from "../constants/index.js";

/**
 * @param {import("zod").ZodTypeAny} schema - Zod schema to validate req.body against
 * @returns {import("express").RequestHandler}
 */
const validate = (schema) => (req, _res, next) => {
  // safeParse never throws — returns { success, data } or { success, error }
  const result = schema.safeParse(req.body);

  if (result.success) {
    // ── KEY BENEFIT ──────────────────────────────────────────────────────────
    // Replace req.body with Zod's parsed output.
    // This means: trimmed strings, stripped unknown fields, coerced types.
    // Controllers receive clean, guaranteed data — no defensive coding needed.
    req.body = result.data;
    return next();
  }

  // ── Map ZodError into { field, message } pairs ───────────────────────────
  // ZodError.errors is an array of ZodIssue objects, each with:
  //   .path  → array like ["password"] or ["address", "city"] for nested
  //   .message → human-readable message we set in the schema
  const errors = result.error.errors.map((issue) => ({
    field: issue.path.join("."),   // "password" or "address.city" for nested
    message: issue.message,
  }));

  throw new ApiError(
    HttpStatus.UNPROCESSABLE,   // 422 — understood but semantically invalid
    "Validation failed. Please check your input.",
    errors
  );
};

export { validate };