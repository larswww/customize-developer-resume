import compression from "compression";
import express, { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env file
dotenv.config();

// Initialize MSW for server-side API mocking if enabled
const isMswEnabled = process.env.NODE_ENV === 'development' || process.env.MSW_ENABLED === 'true';

// Add global fetch debugging in development
if (process.env.NODE_ENV === 'development') {
  const originalFetch = global.fetch;
  global.fetch = async function debugFetch(url: string | URL, options?: RequestInit) {
    console.log(`[DEBUG] Fetch request: ${options?.method || 'GET'} ${url.toString()}`);
    try {
      const response = await originalFetch(url, options);
      console.log(`[DEBUG] Fetch response: ${response.status} from ${url.toString()}`);
      return response;
    } catch (error) {
      console.error(`[DEBUG] Fetch error for ${url.toString()}:`, error);
      throw error;
    }
  } as typeof global.fetch;
}

if (isMswEnabled) {
  console.log('Initializing MSW for server-side API mocking...');
  try {
    const { startServer } = await import('./app/mocks/server');
    startServer();
  } catch (error) {
    console.error('Error initializing server-side MSW:', error);
  }
}

// Get __dirname equivalent in ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Short-circuit the type-checking of the built output.
const BUILD_PATH = "./build/server/index.js";
const DEVELOPMENT = process.env.NODE_ENV === "development";
const PORT = Number.parseInt(process.env.PORT || "3000");

const app = express();

app.use(compression());
app.disable("x-powered-by");

// Serve the public directory, which contains the MSW service worker
app.use(express.static(path.join(__dirname, 'public')));

if (DEVELOPMENT) {
  console.log("Starting development server");
  const viteDevServer = await import("vite").then((vite) =>
    vite.createServer({
      server: { middlewareMode: true },
    })
  );
  app.use(viteDevServer.middlewares);
  app.use(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const source = await viteDevServer.ssrLoadModule("./server/app.ts");
      return await source.app(req, res, next);
    } catch (error) {
      if (typeof error === "object" && error instanceof Error) {
        viteDevServer.ssrFixStacktrace(error);
      }
      next(error);
    }
  });
} else {
  console.log("Starting production server");
  app.use(
    "/assets",
    express.static("build/client/assets", { immutable: true, maxAge: "1y" })
  );
  app.use(express.static("build/client", { maxAge: "1h" }));
  app.use(await import(BUILD_PATH).then((mod) => mod.app));
}

app.use(morgan("tiny"));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
}); 