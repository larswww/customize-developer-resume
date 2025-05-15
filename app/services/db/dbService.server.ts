import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { z } from "zod";
import {
	DB_DIR,
	DB_NAMES,
	SETTINGS_KEYS,
	SETTINGS_SCHEMAS,
} from "~/config/constants";
import {
	type ContactInfo,
	ContactInfoSchema,
	type Education,
	EducationSchema,
} from "~/config/schemas/sharedTypes";
import type { SimpleConsultantCoreData } from "~/config/schemas/simple";
import serverLogger from "~/utils/logger.server";
import type {
	DefaultResumeCoreData,
	DefaultResumeData,
} from "../../config/schemas/default";
import { defaultWorkflowId } from "../../config/workflows";

export const DB_PATHS = {
	TEST: path.join(DB_DIR, DB_NAMES.TEST),
	UNIT: path.join(DB_DIR, DB_NAMES.UNIT),
	PROD: path.join(DB_DIR, DB_NAMES.PROD),
	E2E: path.join(DB_DIR, DB_NAMES.E2E),
};
const { DB_NAME } = process.env;
if (!DB_NAME) throw new Error("DB_NAME is not set");
const DEFAULT_DB_PATH = path.join(DB_DIR, DB_NAME);
const isTestEnv =
	process.env.NODE_ENV === "test" || process.env.MSW_ENABLED === "true";

if (isTestEnv) {
	serverLogger.log("DB test env...");
}

const TimeStampSchema = z.object({
	createdAt: z.string(),
	updatedAt: z.string(),
});

const JobInputSchema = z.object({
	title: z
		.string()
		.min(2, "Job title must be at least 2 characters")
		.max(255, "Job title cannot exceed 255 characters")
		.refine((val) => !val.includes("\\"), {
			message: "Job title cannot contain backslashes",
		}),
	jobDescription: z.string(),
	relevantDescription: z.string().optional(),
	link: z.string().nullish(),
});

const JobSchema = z
	.object({
		id: z.number(),
		title: z.string(),
		jobDescription: z.string(),
		relevantDescription: z.string().optional(),
		link: z.string().url().nullable().optional(),
	})
	.merge(TimeStampSchema);

const WorkflowStepStatusSchema = z.enum([
	"pending",
	"success",
	"error",
	"processing",
]);

const WorkflowStepInputSchema = z.object({
	jobId: z.number(),
	stepId: z.string(),
	workflowId: z.string(),
	result: z.string(),
	status: WorkflowStepStatusSchema,
});

const WorkflowStepSchema = z
	.object({
		id: z.number(),
		jobId: z.number(),
		stepId: z.string(),
		workflowId: z.string(),
		result: z.string(),
		status: z.string().transform((val) => WorkflowStepStatusSchema.parse(val)),
	})
	.merge(TimeStampSchema);

const ResumeInputSchema = z.object({
	jobId: z.number(),
	resumeText: z.string().optional(),
	templateId: z.string().default("default"),
	structuredData: z
		.union([
			z.string(),
			z.custom<DefaultResumeCoreData>(),
			z.custom<SimpleConsultantCoreData>(),
			z.null(),
		])
		.optional()
		.transform((data) => {
			if (typeof data === "string" || data === null) return data;
			return JSON.stringify(data);
		}),
});

const ResumeSchema = z
	.object({
		id: z.number().optional(),
		jobId: z.number(),
		templateId: z.string().default("default"),
		resumeText: z.string().nullable(),
		structuredData: z.preprocess((val) => {
			if (typeof val === "string") {
				try {
					return JSON.parse(val);
				} catch (e) {
					serverLogger.error("Error parsing structuredData JSON:", e);
					return undefined;
				}
			}
			return val;
		}, z.custom<DefaultResumeData>().optional()),
	})
	.merge(TimeStampSchema.partial());

const SettingsKeySchema = z.nativeEnum(SETTINGS_KEYS);
const SettingsDataSchema = EducationSchema.or(ContactInfoSchema);
const SettingsSchema = z
	.object({
		key: SettingsKeySchema,
		value: z.string().nullable(),
		structuredData: SettingsDataSchema.nullable(),
	})
	.merge(TimeStampSchema);

// Inferred Types
export type Job = z.infer<typeof JobSchema>;
export type JobInput = z.infer<typeof JobInputSchema>;
export type WorkflowStepStatus = z.infer<typeof WorkflowStepStatusSchema>;
export type WorkflowStepInput = z.infer<typeof WorkflowStepInputSchema>;
export type WorkflowStep = z.infer<typeof WorkflowStepSchema>;
export type ResumeInput = {
	jobId: number;
	resumeText?: string;
	templateId?: string;
	structuredData?: DefaultResumeData | string | null;
};
export type Resume = z.infer<typeof ResumeSchema>;
export type Settings = z.infer<typeof SettingsSchema>;
export type { ContactInfo };

/**
 * @param operation The database operation to execute
 * @param schema The Zod schema to validate the result against
 * @param errorContext Context information for error messages
 * @param defaultValue The default value to return on error (optional)
 */
function withErrorHandling<T, R>(
	operation: () => T,
	schema: z.ZodType<R>,
	errorContext: string,
	defaultValue?: R,
): R | null {
	try {
		const result = operation();
		if (result === undefined || result === null) {
			return defaultValue ?? null;
		}
		return schema.parse(result);
	} catch (error) {
		serverLogger.error(`Error in ${errorContext}:`, error);
		return defaultValue ?? null;
	}
}

function withArrayErrorHandling<T, R>(
	operation: () => T,
	schema: z.ZodType<R[]>,
	errorContext: string,
): R[] {
	try {
		const result = operation();
		if (result === undefined || result === null) {
			return [];
		}
		return schema.parse(result);
	} catch (error) {
		serverLogger.error(`Error in ${errorContext}:`, error);
		return [];
	}
}

const createJobFn = z.function().args(JobInputSchema).returns(JobSchema);

const getJobFn = z.function().args(z.number()).returns(JobSchema.nullable());

const getAllJobsFn = z.function().args().returns(z.array(JobSchema));

const updateJobFn = z
	.function()
	.args(z.object({ id: z.number() }).merge(JobInputSchema.partial()))
	.returns(JobSchema);

const deleteJobFn = z.function().args(z.number()).returns(z.boolean());

const saveWorkflowStepFn = z
	.function()
	.args(WorkflowStepInputSchema)
	.returns(WorkflowStepSchema);

const getWorkflowStepFn = z
	.function()
	.args(z.number(), z.string(), z.string())
	.returns(WorkflowStepSchema.nullable());

const getWorkflowStepsFn = z
	.function()
	.args(z.number(), z.string().optional())
	.returns(z.array(WorkflowStepSchema));

const saveResumeFn = z.function().args(ResumeInputSchema).returns(ResumeSchema);

const getResumeFn = z
	.function()
	.args(z.number(), z.string().optional())
	.returns(ResumeSchema.nullable());

const getResumesFn = z
	.function()
	.args(z.number().optional())
	.returns(z.array(ResumeSchema));

const getSettingFn = z
	.function()
	.args(SettingsKeySchema)
	.returns(SettingsSchema.nullable());

const saveSettingFn = z
	.function()
	.args(SettingsSchema.omit({ createdAt: true, updatedAt: true }))
	.returns(z.boolean());

const saveWorkHistoryFn = z.function().args(z.string()).returns(z.boolean());

const saveContactInfoFn = z
	.function()
	.args(ContactInfoSchema)
	.returns(z.boolean());

const saveEducationFn = z.function().args(EducationSchema).returns(z.boolean());

export class DbService {
	private db: Database.Database;

	constructor(dbPath = DEFAULT_DB_PATH, verbose = !isTestEnv) {
		try {
			const dbDir = path.dirname(dbPath);
			if (!fs.existsSync(dbDir)) {
				fs.mkdirSync(dbDir, { recursive: true });
			}

			this.db = new Database(dbPath, {
				verbose: verbose ? serverLogger.log : undefined,
			});

			this.db.pragma("journal_mode = WAL");
			this.db.pragma("synchronous = NORMAL");
			this.db.pragma("busy_timeout = 5000");

			serverLogger.log(`SQLite database connected at ${dbPath}`);

			this.initializeTables();
		} catch (error) {
			serverLogger.error("Error connecting to SQLite database:", error);
			if (!isTestEnv) {
				process.exit(1);
			} else {
				throw error;
			}
		}
	}
	private initializeTables() {
		const initSchema = this.db.transaction(() => {
			this.db.exec(`
        CREATE TABLE IF NOT EXISTS jobs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          jobDescription TEXT NOT NULL,
          relevantDescription TEXT,
          link TEXT,
          createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);

			const jobsTableInfo = this.db.prepare("PRAGMA table_info(jobs)").all();
			const hasLinkColumn = jobsTableInfo.some(
				(column: any) => column.name === "link",
			);

			if (!hasLinkColumn) {
				serverLogger.log("Adding link column to jobs table...");
				this.db.exec("ALTER TABLE jobs ADD COLUMN link TEXT DEFAULT NULL");
			}

			const tableExists = this.db
				.prepare(
					"SELECT name FROM sqlite_master WHERE type='table' AND name='workflow_steps'",
				)
				.get();
			let hasWorkflowIdColumn = false;

			if (tableExists) {
				const tableInfo = this.db
					.prepare("PRAGMA table_info(workflow_steps)")
					.all();
				hasWorkflowIdColumn = tableInfo.some(
					(column: any) => column.name === "workflowId",
				);

				if (!hasWorkflowIdColumn) {
					serverLogger.log(
						"Migrating workflow_steps table to add workflowId column...",
					);

					this.db.exec(`
            CREATE TABLE IF NOT EXISTS workflow_steps_backup (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              jobId INTEGER NOT NULL,
              stepId TEXT NOT NULL,
              result TEXT,
              status TEXT NOT NULL,
              createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
              updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (jobId) REFERENCES jobs(id) ON DELETE CASCADE
            )
          `);

					this.db.exec(
						"INSERT INTO workflow_steps_backup SELECT * FROM workflow_steps",
					);

					this.db.exec("DROP TABLE workflow_steps");
				}
			}

			this.db.exec(`
        CREATE TABLE IF NOT EXISTS workflow_steps (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          jobId INTEGER NOT NULL,
          stepId TEXT NOT NULL,
          workflowId TEXT NOT NULL,
          result TEXT,
          status TEXT NOT NULL,
          createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (jobId) REFERENCES jobs(id) ON DELETE CASCADE
        )
      `);

			if (
				tableExists &&
				!hasWorkflowIdColumn &&
				this.db
					.prepare(
						"SELECT name FROM sqlite_master WHERE type='table' AND name='workflow_steps_backup'",
					)
					.get()
			) {
				serverLogger.log(
					"Restoring workflow step data with default workflowId...",
				);
				this.db.exec(`
          INSERT INTO workflow_steps (id, jobId, stepId, workflowId, result, status, createdAt, updatedAt)
          SELECT id, jobId, stepId, '${defaultWorkflowId}', result, status, createdAt, updatedAt 
          FROM workflow_steps_backup
        `);

				this.db.exec("DROP TABLE workflow_steps_backup");
				serverLogger.log("Migration completed successfully.");
			}

			this.db.exec(`
        CREATE TABLE IF NOT EXISTS resumes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          jobId INTEGER NOT NULL,
          templateId TEXT NOT NULL DEFAULT 'default',
          resumeText TEXT,
          structuredData TEXT,
          createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (jobId) REFERENCES jobs(id) ON DELETE CASCADE,
          UNIQUE (jobId, templateId)
        )
      `);

			this.db.exec(`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NULL,
          structuredData TEXT,
          createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);

			const settingsTableInfo = this.db
				.prepare("PRAGMA table_info(settings)")
				.all();
			const hasStructuredDataColumn = settingsTableInfo.some(
				(column: any) => column.name === "structuredData",
			);

			if (!hasStructuredDataColumn) {
				serverLogger.log("Adding structuredData column to settings table...");
				this.db.exec(
					"ALTER TABLE settings ADD COLUMN structuredData TEXT DEFAULT NULL",
				);
			}

			this.db.exec(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_workflow_steps_job_step
        ON workflow_steps (jobId, stepId, workflowId)
      `);

			this.db.exec("DROP TRIGGER IF EXISTS trigger_settings_updatedAt;");

			for (const tableName of ["jobs", "workflow_steps", "resumes"]) {
				this.db.exec(`
          CREATE TRIGGER IF NOT EXISTS trigger_${tableName}_updatedAt
          AFTER UPDATE ON ${tableName}
          FOR EACH ROW
          BEGIN
            UPDATE ${tableName} SET updatedAt = CURRENT_TIMESTAMP WHERE id = OLD.id;
          END;
        `);
			}

			this.db.exec(`
        CREATE TRIGGER IF NOT EXISTS trigger_settings_updatedAt
        AFTER UPDATE ON settings
        FOR EACH ROW
        BEGIN
          UPDATE settings SET updatedAt = CURRENT_TIMESTAMP WHERE key = OLD.key;
        END;
      `);

			const resumesTableInfo = this.db
				.prepare("PRAGMA table_info(resumes)")
				.all();
			const hasTemplateIdColumn = resumesTableInfo.some(
				(column: any) => column.name === "templateId",
			);

			if (!hasTemplateIdColumn) {
				serverLogger.log("Adding templateId column to resumes table...");
				// Add default value to avoid NOT NULL constraint issues on existing rows
				this.db.exec(
					"ALTER TABLE resumes ADD COLUMN templateId TEXT NOT NULL DEFAULT 'default'",
				);
			}
		});

		try {
			initSchema();
			serverLogger.log("Database schema initialized successfully.");
		} catch (error) {
			serverLogger.error("Error initializing database schema:", error);
		}
	}
	createJob = createJobFn.implement((jobData) => {
		const stmt = this.db.prepare(`
      INSERT INTO jobs (title, jobDescription, relevantDescription, link)
      VALUES (?, ?, ?, ?)
    `);

		const result = stmt.run(
			jobData.title,
			jobData.jobDescription,
			jobData.relevantDescription || "",
			jobData.link || null,
		);

		const newJob = this.getJob(result.lastInsertRowid as number);
		if (!newJob) {
			throw new Error("Failed to retrieve newly created job");
		}
		return newJob;
	});

	getJob = getJobFn.implement((id) => {
		return withErrorHandling(
			() => this.db.prepare("SELECT * FROM jobs WHERE id = ?").get(id),
			JobSchema,
			`getJob(${id})`,
		);
	});

	getAllJobs = getAllJobsFn.implement(() => {
		return withArrayErrorHandling(
			() => this.db.prepare("SELECT * FROM jobs ORDER BY createdAt DESC").all(),
			z.array(JobSchema),
			"getAllJobs",
		);
	});

	updateJob = updateJobFn.implement((job) => {
		const fieldsToUpdate = Object.keys(job).filter(
			(key) => key !== "id" && key !== "createdAt" && key !== "updatedAt",
		);
		if (fieldsToUpdate.length === 0) {
			const currentJob = this.getJob(job.id);
			if (!currentJob) throw new Error(`Job with id ${job.id} not found`);
			return currentJob;
		}

		const setClause = fieldsToUpdate.map((key) => `${key} = ?`).join(", ");
		const values = fieldsToUpdate.map((key) => (job as any)[key]);
		values.push(job.id);

		const stmt = this.db.prepare(`
      UPDATE jobs
      SET ${setClause} 
      WHERE id = ?
    `);

		stmt.run(...values);

		const updatedJob = this.getJob(job.id);
		if (!updatedJob) {
			throw new Error("Failed to retrieve updated job");
		}
		return updatedJob;
	});

	deleteJob = deleteJobFn.implement((id) => {
		const stmt = this.db.prepare("DELETE FROM jobs WHERE id = ?");
		const result = stmt.run(id);
		return result.changes > 0;
	});

	saveWorkflowStep = saveWorkflowStepFn.implement((stepData) => {
		const stmt = this.db.prepare(`
      INSERT INTO workflow_steps (jobId, stepId, workflowId, result, status)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(jobId, stepId, workflowId) DO UPDATE SET
        result = excluded.result,
        status = excluded.status,
        updatedAt = CURRENT_TIMESTAMP
    `);

		stmt.run(
			stepData.jobId,
			stepData.stepId,
			stepData.workflowId,
			stepData.result,
			stepData.status,
		);

		const savedStep = this.getWorkflowStep(
			stepData.jobId,
			stepData.stepId,
			stepData.workflowId,
		);
		if (!savedStep) {
			throw new Error("Failed to retrieve saved workflow step");
		}
		return savedStep;
	});

	getWorkflowStep = getWorkflowStepFn.implement((jobId, stepId, workflowId) => {
		return withErrorHandling(
			() =>
				this.db
					.prepare(
						"SELECT * FROM workflow_steps WHERE jobId = ? AND stepId = ? AND workflowId = ?",
					)
					.get(jobId, stepId, workflowId),
			WorkflowStepSchema,
			`getWorkflowStep(${jobId}, ${stepId}, ${workflowId})`,
		);
	});

	getWorkflowSteps = getWorkflowStepsFn.implement((jobId, workflowId) => {
		if (workflowId) {
			return withArrayErrorHandling(
				() =>
					this.db
						.prepare(
							"SELECT * FROM workflow_steps WHERE jobId = ? AND workflowId = ? ORDER BY id ASC",
						)
						.all(jobId, workflowId),
				z.array(WorkflowStepSchema),
				`getWorkflowSteps(${jobId}, ${workflowId})`,
			);
		}
		return withArrayErrorHandling(
			() =>
				this.db
					.prepare(
						"SELECT * FROM workflow_steps WHERE jobId = ? ORDER BY id ASC",
					)
					.all(jobId),
			z.array(WorkflowStepSchema),
			`getWorkflowSteps(${jobId})`,
		);
	});

	saveResume = saveResumeFn.implement((resume) => {
		const { jobId, resumeText, structuredData } = resume;

		const templateId = resume.templateId || "default";

		const stmt = this.db.prepare(`
      INSERT INTO resumes (jobId, templateId, resumeText, structuredData)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(jobId, templateId) DO UPDATE SET
        resumeText = excluded.resumeText,
        structuredData = excluded.structuredData,
        updatedAt = CURRENT_TIMESTAMP
    `);

		stmt.run(jobId, templateId, resumeText, structuredData);

		const savedResume = this.getResume(jobId, templateId);
		if (!savedResume) {
			throw new Error("Failed to retrieve saved resume");
		}
		return savedResume;
	});

	getResume = getResumeFn.implement((jobId, templateId = "default") => {
		return withErrorHandling(
			() =>
				this.db
					.prepare("SELECT * FROM resumes WHERE jobId = ? AND templateId = ?")
					.get(jobId, templateId),
			ResumeSchema,
			`getResume(${jobId}, ${templateId})`,
		);
	});

	getResumes = getResumesFn.implement((jobId) => {
		if (jobId) {
			return withArrayErrorHandling(
				() =>
					this.db
						.prepare(
							"SELECT * FROM resumes WHERE jobId = ? ORDER BY updatedAt DESC",
						)
						.all(jobId),
				z.array(ResumeSchema),
				`getResumes(${jobId})`,
			);
		}
		return withArrayErrorHandling(
			() =>
				this.db.prepare("SELECT * FROM resumes ORDER BY updatedAt DESC").all(),
			z.array(ResumeSchema),
			"getResumes()",
		);
	});

	getSetting = getSettingFn.implement((key) => {
		return withErrorHandling(
			() => {
				const row = this.db
					.prepare("SELECT * FROM settings WHERE key = ?")
					.get(key) as any;

				if (row && typeof row.structuredData === "string") {
					try {
						row.structuredData = JSON.parse(row.structuredData);
					} catch (e) {
						serverLogger.error(
							`[getSetting] Error parsing structuredData JSON for key ${key}:`,
							e,
						);
						row.structuredData = null;
					}
				}
				return row;
			},
			SettingsSchema,
			`getSetting(${key})`,
		);
	});

	saveSetting = saveSettingFn.implement(({ key, value, structuredData }) => {
		try {
			const stmt = this.db.prepare(`
        INSERT INTO settings (key, value, structuredData)
        VALUES (?, ?, ?)
        ON CONFLICT(key) DO UPDATE SET
          value = excluded.value,
          structuredData = excluded.structuredData,
          updatedAt = CURRENT_TIMESTAMP
      `);

			// Stringify structuredData if it's an object, otherwise pass null
			const structuredDataString =
				structuredData !== null ? JSON.stringify(structuredData) : null;

			const result = stmt.run(key, value, structuredDataString);
			return result.changes > 0;
		} catch (error) {
			serverLogger.error(`[saveSetting] Error saving setting ${key}:`, error);
			return false;
		}
	});

	getWorkHistory = () => {
		const result = this.getSetting(SETTINGS_KEYS.WORK_HISTORY);
		return result?.value as string | null;
	};

	saveWorkHistory = saveWorkHistoryFn.implement((content) => {
		return this.saveSetting({
			key: SETTINGS_KEYS.WORK_HISTORY,
			value: content,
			structuredData: null,
		});
	});

	getContactInfo = () => {
		const result = this.getSetting(SETTINGS_KEYS.CONTACT_INFO);
		return (
			(result?.structuredData as ContactInfo) ??
			SETTINGS_SCHEMAS[SETTINGS_KEYS.CONTACT_INFO].emptyValue
		);
	};

	saveContactInfo = saveContactInfoFn.implement((contactInfoData) => {
		return this.saveSetting({
			key: SETTINGS_KEYS.CONTACT_INFO,
			structuredData: contactInfoData,
			value: null,
		});
	});

	getEducation = () => {
		const result = this.getSetting(SETTINGS_KEYS.EDUCATION);
		return (
			(result?.structuredData as Education) ??
			SETTINGS_SCHEMAS[SETTINGS_KEYS.EDUCATION].emptyValue
		);
	};

	saveEducation = saveEducationFn.implement((structuredData) => {
		return this.saveSetting({
			key: SETTINGS_KEYS.EDUCATION,
			structuredData,
			value: null,
		});
	});

	close() {
		if (this.db?.open) {
			this.db?.close();
			serverLogger.log("SQLite database connection closed.");
		} else {
			serverLogger.log("SQLite database connection was already closed.");
		}
	}
}

export function createDbService(dbPath?: string, verbose?: boolean): DbService {
	return new DbService(dbPath, verbose);
}

const dbService = createDbService();

process.on("exit", () => dbService?.close());
process.on("SIGINT", () => {
	dbService?.close();
	process.exit(0);
});
process.on("SIGTERM", () => {
	dbService?.close();
	process.exit(0);
});

export default dbService;
