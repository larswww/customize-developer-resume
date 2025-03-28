import { type RouteConfig, index } from "@react-router/dev/routes";

// Only include the index route since we've moved API functionality to services
export default [index("routes/index.tsx")] satisfies RouteConfig;
