import { createServer } from "http";
import app from "./app";
import { setupVite, log } from "./vite";

(async () => {
  const server = createServer(app);

  // In development, set up Vite dev server as a catch-all after API routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Default to 3000 if not specified.
  const port = parseInt(process.env.PORT || '3000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
