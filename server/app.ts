import express, { type Request, Response, NextFunction } from "express";
import helmet from "helmet";
import session from "express-session";
import cookieParser from "cookie-parser";
import { doubleCsrf } from "csrf-csrf";
import connectPgSimple from "connect-pg-simple";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { registerRoutes } from "./routes";
import { serveStatic, log } from "./logger";

const app = express();

const isProduction = process.env.NODE_ENV === 'production';

// Security headers with helmet
app.use(helmet({
  contentSecurityPolicy: isProduction ? {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Tailwind requires inline styles
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "data:"],
    }
  } : false, // Disable CSP in development for Vite compatibility
  crossOriginEmbedderPolicy: false,
}));

// Cookie parser
app.use(cookieParser());

// Session management with PostgreSQL store when DATABASE_URL is available
const PgStore = connectPgSimple(session);

let sessionStore: session.Store | undefined;
if (process.env.DATABASE_URL) {
  neonConfig.webSocketConstructor = ws;
  const sessionPool = new Pool({ connectionString: process.env.DATABASE_URL });
  sessionStore = new PgStore({
    // @neondatabase/serverless Pool is API-compatible with pg.Pool used by connect-pg-simple.
    // The cast is needed because @types/pg is not a direct dependency.
    pool: sessionPool as any,
    createTableIfMissing: true,
    tableName: 'sessions',
  });
}

app.use(session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET || 'portfolio-session-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  },
}));

// CSRF Protection
const {
  generateCsrfToken,
  doubleCsrfProtection,
} = doubleCsrf({
  getSecret: () => process.env.SESSION_SECRET || 'csrf-secret-change-in-production',
  getSessionIdentifier: () => '',
  cookieName: isProduction ? '__Host-psifi.x-csrf-token' : 'psifi.x-csrf-token',
  cookieOptions: {
    httpOnly: true,
    sameSite: isProduction ? 'strict' : 'lax',
    secure: isProduction,
    path: '/',
  },
  size: 64,
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
});

// Make CSRF token generator available to routes
app.use((req, res, next) => {
  res.locals.csrfToken = generateCsrfToken(req, res);
  next();
});

// Extend session type
declare module 'express-session' {
  interface SessionData {
    authenticated: boolean;
  }
}

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(express.json({
  limit: '50mb',
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Set CSRF middleware for routes to access
app.set('csrfProtection', doubleCsrfProtection);

// Register all API routes
registerRoutes(app);

// Serve static frontend in production when not running on Vercel
// (Vercel serves static files from its CDN via outputDirectory)
if (isProduction && !process.env.VERCEL) {
  serveStatic(app);
}

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return res.status(status).json({ message });
});

export default app;
