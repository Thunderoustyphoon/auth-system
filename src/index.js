
import "dotenv/config"; // Load .env first — everything else depends on it
import connectDB from "./db/index.js";
import { app } from "./app.js";

const PORT = process.env.PORT || 8000;

connectDB()
  .then(() => {
    // ── Start server only after DB is connected ───────────────────────────
    const server = app.listen(PORT, () => {
      console.log(`⚙️  Server running on http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log(`📖 API Base:    http://localhost:${PORT}/api/v1`);
    });

    // ── Graceful shutdown ─────────────────────────────────────────────────
    // If something unhandled goes wrong after startup, log it and shut down cleanly
    process.on("unhandledRejection", (reason, promise) => {
      console.error("🔴 Unhandled Rejection at:", promise, "reason:", reason);
      server.close(() => {
        console.log("Server closed due to unhandled rejection.");
        process.exit(1);
      });
    });

    process.on("uncaughtException", (err) => {
      console.error("🔴 Uncaught Exception:", err.message);
      server.close(() => {
        console.log("Server closed due to uncaught exception.");
        process.exit(1);
      });
    });

    // SIGTERM is sent by hosts like Railway, Render, Heroku when shutting down
    process.on("SIGTERM", () => {
      console.log("SIGTERM received. Shutting down gracefully...");
      server.close(() => {
        console.log("Process terminated.");
      });
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  });