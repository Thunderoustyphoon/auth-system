import mongoose from "mongoose";
import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {
  let error = err;

  // ── ZodError — schema validation escaped validate middleware (defensive) ─────
  // Should not normally reach here — validate() catches it first.
  // But if a schema is used outside of the validate middleware, this catches it.
  if (err instanceof ZodError) {
    const errors = err.errors.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    error = new ApiError(422, "Validation failed. Please check your input.", errors);
  }

  // ── Mongoose CastError — malformed ObjectId in URL params ────────────────
  // e.g. GET /api/v1/user/not-a-valid-id
  if (err instanceof mongoose.Error.CastError) {
    error = new ApiError(400, `Invalid value for field '${err.path}': ${err.value}`);
  }

  // ── Mongoose ValidationError — schema-level validation failed ─────────────
  // Last line of defence after Zod. Catches any DB-layer constraint violations
  // that slipped through (e.g. a direct DB write bypassing the validator layer).
  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    error = new ApiError(422, "Database validation failed", messages);
  }

  // ── Mongoose Duplicate Key Error — unique constraint violated ─────────────
  // e.g. registering with an email that already exists in the DB
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    error = new ApiError(
      409,
      `An account with this ${field} (${value}) already exists`
    );
  }

  // ── JWT Errors — shouldn't reach here normally (caught in verifyJWT) ──────
  if (err.name === "JsonWebTokenError") {
    error = new ApiError(401, "Invalid access token");
  }
  if (err.name === "TokenExpiredError") {
    error = new ApiError(401, "Access token has expired", [{ code: "TOKEN_EXPIRED" }]);
  }

  // ── SyntaxError — malformed JSON in request body ──────────────────────────
  // e.g. sending "{ name: John }" instead of "{ \"name\": \"John\" }"
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    error = new ApiError(400, "Invalid JSON in request body. Please check your syntax.");
  }

  // ── Fallback: anything not handled above becomes a 500 ───────────────────
  if (!(error instanceof ApiError)) {
    error = new ApiError(
      500,
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal Server Error"
    );
  }

  // ── Build response ────────────────────────────────────────────────────────
  const response = {
    statusCode: error.statusCode,
    success: false,
    message: error.message,
    errors: error.errors,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  };

  // Dev logging — morgan handles prod logging
  if (process.env.NODE_ENV === "development") {
    console.error(`\n [${req.method}] ${req.originalUrl} → ${error.statusCode}`);
    console.error(err.stack || err.message);
  }

  return res.status(error.statusCode).json(response);
};

export { errorHandler };