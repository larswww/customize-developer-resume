import { DB_PATHS } from "~/services/db/dbService.server";
import deleteTestDb from "./utils/deleteTestDb";

deleteTestDb(DB_PATHS.E2E);
