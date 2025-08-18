// server/index.ts
import express, { type Request, type Response, type NextFunction } from "express";
import { registerRoutes } from "./routes";

// Tiny logger helper to replace the previous `log()` from ./vite
const log = (msg: string) => console.log(`[server] ${msg}`);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// API request timing + response snippet (≤80 chars), replacing the old logger
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined;

  const originalResJson = res.json.bind(res);
  res.json = (bodyJson: any, ...args: any[]) => {
    capturedJsonResponse = bodyJson;
    return originalResJson(bodyJson, ...args);
  };

  res.on("finish", () => {
    if (!path.startsWith("/api")) return;

    const duration = Date.now() - start;
    let line = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
    if (capturedJsonResponse) line += ` :: ${JSON.stringify(capturedJsonResponse)}`;
    if (line.length > 80) line = line.slice(0, 79) + "…";
    log(line);
  });

  next();
});

// Wrap in an async IIFE just like before, but without importing ./vite
(async () => {
  const server = await registerRoutes(app);

  // Basic error handler
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err?.status || err?.statusCode || 500;
    const message = err?.message || "Internal Server Error";
    res.status(status).json({ message });
    // Keep the throw for visibility in logs
    throw err;
  });

  // NOTE: No Vite setup in production; this file must compile during Next build.
  // If you still want to run this server locally outside Next, set START_EXPRESS=true.
  const shouldStart =
    process.env.START_EXPRESS === "true" || process.env.NODE_ENV === "development";

  if (shouldStart) {
    const port = parseInt(process.env.PORT || "5000", 10);
    server.listen(
      {
        port,
        host: "0.0.0.0",
        reusePort: true,
      },
      () => log(`serving on port ${port}`)
    );
  }
})();

export default app;
