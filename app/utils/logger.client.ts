import { createLogger } from "./logger";
const isProduction = import.meta.env.PROD;
export const clientLogger = createLogger(!isProduction, console);

export default clientLogger;
