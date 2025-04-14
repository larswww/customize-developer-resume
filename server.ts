import path from "node:path";
import { fileURLToPath } from "node:url";
import compression from "compression";
import * as dotenv from "dotenv";
import express, {
	type Request,
	type Response,
	type NextFunction,
} from "express";
import morgan from "morgan";
import { serverLogger } from "./app/utils/logger.server";

dotenv.config();
	
const isMswEnabled = process.env.MSW_ENABLED === "true";

if (process.env.NODE_ENV === "development") {
	const originalFetch = global.fetch;
	global.fetch = async function debugFetch(
		url: string | URL,
		options?: RequestInit,
	) {
		serverLogger.debug(
			`[DEBUG] Fetch request: ${options?.method || "GET"} ${url.toString()}`,
		);
		try {
			const response = await originalFetch(url, options);
			serverLogger.debug(
				`[DEBUG] Fetch response: ${response.status} from ${url.toString()}`,
			);
			return response;
		} catch (error) {
			serverLogger.error(`[DEBUG] Fetch error for ${url.toString()}:`, error);
			throw error;
		}
	} as typeof global.fetch;
}

if (isMswEnabled) {
	serverLogger.log("Initializing MSW for server-side API mocking...");
	try {
		const { startServer } = await import("./app/mocks/server");
		startServer();
	} catch (error) {
		serverLogger.error("Error initializing server-side MSW:", error);
	}
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BUILD_PATH = "./build/server/index.js";
const DEVELOPMENT = process.env.NODE_ENV === "development";
const PORT = Number.parseInt(process.env.PORT || "3000");

const app = express();

app.use(compression());
app.disable("x-powered-by");
app.use(express.static(path.join(__dirname, "public")));

if (DEVELOPMENT) {
	serverLogger.log("Starting development server");
	const viteDevServer = await import("vite").then((vite) =>
		vite.createServer({
			server: { middlewareMode: true },
		}),
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
	serverLogger.log("Starting production server");
	app.use(
		"/assets",
		express.static("build/client/assets", { immutable: true, maxAge: "1y" }),
	);
	app.use(express.static("build/client", { maxAge: "1h" }));
	app.use(await import(BUILD_PATH).then((mod) => mod.app));
}

app.use(morgan("tiny"));

app.listen(PORT, () => {
	serverLogger.log(`Server is running on http://localhost:${PORT}`);
});
