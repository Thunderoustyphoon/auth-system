import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import morgan from "morgan";

const app = express();

// ── Security Headers (helmet) ─────────────────────────────────────────────────
// Sets ~15 HTTP headers that protect against XSS, clickjacking, sniffing etc.
// Always put this FIRST — before anything that could leak information.

app.use(helmet());

// ── Request Logging (morgan) ──────────────────────────────────────────────────
// "dev" format in development: GET /api/v1/auth/login 200 42ms
// "combined" in production: Apache-style with IP, user-agent, etc.

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,          // Required for cookies (refresh token)
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);

// ── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());


// ── NoSQL Injection Protection (mongo-sanitize) ───────────────────────────────
// Strips $ and . from req.body, req.query, req.params.
// Without this: { "email": { "$gt": "" } } could bypass auth queries.
// Must come AFTER body parsing so req.body is populated.
app.use(mongoSanitize());

// ── Health Check ─────────────────────────────────────────────────────────────
app.get("/healthcheck", (_req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    statusCode: 404,
    success: false,
    message: "Route not found",
    data: null,
  });
});


export {app}
