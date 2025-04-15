import fs from "node:fs";
import { DB_PATHS } from "~/services/db/dbService.server";
try {
  if (fs.existsSync(DB_PATHS.TEST)) {
    fs.unlinkSync(DB_PATHS.TEST);
    console.log(`Test database at ${DB_PATHS.TEST} deleted successfully.`);
  }
} catch (error) {
  console.error(`Failed to delete test database: ${error}`);
}
