import Database from 'better-sqlite3';
import type { DefaultResumeData } from '../../templates/default';
import path from 'node:path';
import fs from 'node:fs';
import { z } from 'zod';
import { defaultWorkflowId } from '../../config/workflows.config';

const DB_PATHS = {
  TEST: './db-data/test_resume_app.db',
  PROD: './db-data/resume_app.db',
}

const TimeStampSchema = z.object({
  createdAt: z.string(),
  updatedAt: z.string(),
});

const JobInputSchema = z.object({
  title: z.string()
    .min(2, "Job title must be at least 2 characters")
    .max(255, "Job title cannot exceed 255 characters")
    .refine(val => !val.includes('\\'), {
      message: "Job title cannot contain backslashes"
    }),
  jobDescription: z.string(),
  relevantDescription: z.string().optional(),
});

const JobSchema = z.object({
  id: z.number(),
  title: z.string(),
  jobDescription: z.string(),
  relevantDescription: z.string().optional(),
}).merge(TimeStampSchema);

const WorkflowStepStatusSchema = z.enum(['pending', 'success', 'error', 'processing']);

const WorkflowStepInputSchema = z.object({
  jobId: z.number(),
  stepId: z.string(),
  workflowId: z.string(),
  result: z.string(),
  status: WorkflowStepStatusSchema,
});

const WorkflowStepSchema = z.object({
  id: z.number(),
  jobId: z.number(),
  stepId: z.string(),
  workflowId: z.string(),
  result: z.string(),
  status: z.string().transform(val => 
    WorkflowStepStatusSchema.parse(val)
  ),
}).merge(TimeStampSchema);

const ResumeInputSchema = z.object({
  jobId: z.number(),
  resumeText: z.string().optional(),
  structuredData: z.union([
    z.string(),
    z.custom<DefaultResumeData>(),
    z.null()
  ]).optional().transform(data => {
    if (typeof data === 'string' || data === null) return data;
    return JSON.stringify(data);
  }),
});

const ResumeSchema = z.object({
  id: z.number().optional(),
  jobId: z.number(),
  resumeText: z.string().optional(),
  structuredData: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        try {
          return JSON.parse(val);
        } catch (e) {
          console.error('Error parsing structuredData JSON:', e);
          return undefined;
        }
      }
      return val;
    },
    z.custom<DefaultResumeData>().optional()
  ),
}).merge(TimeStampSchema.partial());

const SettingsSchema = z.object({
  key: z.string(),
  value: z.string(),
}).merge(TimeStampSchema);

// Inferred Types
export type Job = z.infer<typeof JobSchema>;
export type JobInput = z.infer<typeof JobInputSchema>;
export type WorkflowStepStatus = z.infer<typeof WorkflowStepStatusSchema>;
export type WorkflowStepInput = z.infer<typeof WorkflowStepInputSchema>;
export type WorkflowStep = z.infer<typeof WorkflowStepSchema>;
export type ResumeInput = {
  jobId: number;
  resumeText?: string;
  structuredData?: DefaultResumeData | string | null;
};
export type Resume = z.infer<typeof ResumeSchema>;
export type Settings = z.infer<typeof SettingsSchema>;

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
  defaultValue?: R
): R | null {
  try {
    const result = operation();
    if (result === undefined || result === null) {
      return defaultValue ?? null;
    }
    return schema.parse(result);
  } catch (error) {
    console.error(`Error in ${errorContext}:`, error);
    return defaultValue ?? null;
  }
}

function withArrayErrorHandling<T, R>(
  operation: () => T, 
  schema: z.ZodType<R[]>,
  errorContext: string
): R[] {
  try {
    const result = operation();
    if (result === undefined || result === null) {
      return [];
    }
    return schema.parse(result);
  } catch (error) {
    console.error(`Error in ${errorContext}:`, error);
    return [];
  }
}

// Function Schemas
// These define the contract for our database functions with built-in validation

// Job Functions
const createJobFn = z.function()
  .args(JobInputSchema)
  .returns(JobSchema);

const getJobFn = z.function()
  .args(z.number())
  .returns(JobSchema.nullable());

const getAllJobsFn = z.function()
  .args()
  .returns(z.array(JobSchema));

const updateJobFn = z.function()
  .args(z.object({ id: z.number() }).merge(JobInputSchema.partial()))
  .returns(JobSchema);

const deleteJobFn = z.function()
  .args(z.number())
  .returns(z.boolean());

// Workflow Step Functions
const saveWorkflowStepFn = z.function()
  .args(WorkflowStepInputSchema)
  .returns(WorkflowStepSchema);

const getWorkflowStepFn = z.function()
  .args(z.number(), z.string(), z.string())
  .returns(WorkflowStepSchema.nullable());

const getWorkflowStepsFn = z.function()
  .args(z.number(), z.string().optional())
  .returns(z.array(WorkflowStepSchema));

// Resume Functions
const saveResumeFn = z.function()
  .args(ResumeInputSchema)
  .returns(ResumeSchema);

const getResumeFn = z.function()
  .args(z.number())
  .returns(ResumeSchema.nullable());

// Settings Functions
const getWorkHistoryFn = z.function()
  .args()
  .returns(z.string().nullable());

const saveWorkHistoryFn = z.function()
  .args(z.string())
  .returns(z.boolean());

const isTestEnv = process.env.NODE_ENV === 'test';
const DEFAULT_DB_PATH = isTestEnv ? DB_PATHS.TEST : DB_PATHS.PROD;

export class DbService {
  private db: Database.Database;

  constructor(dbPath = DEFAULT_DB_PATH, verbose = !isTestEnv) {
    try {
      const dbDir = path.dirname(dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      
      this.db = new Database(dbPath, { verbose: verbose ? console.log : undefined });
      
      this.db.pragma('journal_mode = WAL');
      
      console.log(`SQLite database connected at ${dbPath}`);
      
      this.initializeTables();
    } catch (error) {
      console.error('Error connecting to SQLite database:', error);
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
          createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Check if workflowId column exists in workflow_steps table
      const tableInfo = this.db.prepare("PRAGMA table_info(workflow_steps)").all();
      const hasWorkflowIdColumn = tableInfo.some((column: any) => column.name === 'workflowId');
      
      if (!hasWorkflowIdColumn) {
        console.log("Migrating workflow_steps table to add workflowId column...");
        
        // Create a backup of the existing table
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
        
        // Copy data to backup
        this.db.exec("INSERT INTO workflow_steps_backup SELECT * FROM workflow_steps");
        
        // Drop existing table and recreate with new schema
        this.db.exec("DROP TABLE workflow_steps");
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
      
      // If we did a migration, restore data with default workflowId
      if (!hasWorkflowIdColumn && this.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='workflow_steps_backup'").get()) {
        console.log("Restoring workflow step data with default workflowId...");
        this.db.exec(`
          INSERT INTO workflow_steps (id, jobId, stepId, workflowId, result, status, createdAt, updatedAt)
          SELECT id, jobId, stepId, '${defaultWorkflowId}', result, status, createdAt, updatedAt 
          FROM workflow_steps_backup
        `);
        
        // Drop backup table
        this.db.exec("DROP TABLE workflow_steps_backup");
        console.log("Migration completed successfully.");
      }
      
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS resumes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          jobId INTEGER NOT NULL UNIQUE,
          resumeText TEXT,
          structuredData TEXT,
          createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (jobId) REFERENCES jobs(id) ON DELETE CASCADE
        )
      `);

      this.db.exec(`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL,
          createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);

      this.db.exec(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_workflow_steps_job_step
        ON workflow_steps (jobId, stepId, workflowId)
      `);
      
      this.db.exec('DROP TRIGGER IF EXISTS trigger_settings_updatedAt;');
      
      for (const tableName of ['jobs', 'workflow_steps', 'resumes']) {
        this.db.exec(`
          CREATE TRIGGER IF NOT EXISTS trigger_${tableName}_updatedAt
          AFTER UPDATE ON ${tableName}
          FOR EACH ROW
          BEGIN
            UPDATE ${tableName} SET updatedAt = CURRENT_TIMESTAMP WHERE id = OLD.id;
          END;
        `);
      }
    });

    try {
      initSchema();
      console.log('Database schema initialized successfully.');
    } catch (error) {
      console.error('Error initializing database schema:', error);
    }
  }

  createJob = createJobFn.implement((jobData) => {
    const stmt = this.db.prepare(`
      INSERT INTO jobs (title, jobDescription, relevantDescription)
      VALUES (?, ?, ?)
    `);

    const result = stmt.run(
      jobData.title,
      jobData.jobDescription,
      jobData.relevantDescription || ''
    );

    const newJob = this.getJob(result.lastInsertRowid as number);
    if (!newJob) {
      throw new Error('Failed to retrieve newly created job');
    }
    return newJob;
  });

  getJob = getJobFn.implement((id) => {
    return withErrorHandling(
      () => this.db.prepare('SELECT * FROM jobs WHERE id = ?').get(id),
      JobSchema,
      `getJob(${id})`
    );
  });

  getAllJobs = getAllJobsFn.implement(() => {
    return withArrayErrorHandling(
      () => this.db.prepare('SELECT * FROM jobs ORDER BY createdAt DESC').all(),
      z.array(JobSchema),
      'getAllJobs'
    );
  });

  updateJob = updateJobFn.implement((job) => {
    const fieldsToUpdate = Object.keys(job).filter(key => key !== 'id' && key !== 'createdAt' && key !== 'updatedAt');
    if (fieldsToUpdate.length === 0) {
      const currentJob = this.getJob(job.id);
      if (!currentJob) throw new Error(`Job with id ${job.id} not found`);
      return currentJob;
    }
  
    const setClause = fieldsToUpdate.map(key => `${key} = ?`).join(', ');
    const values = fieldsToUpdate.map(key => (job as any)[key]);
    values.push(job.id);
  
    const stmt = this.db.prepare(`
      UPDATE jobs
      SET ${setClause} 
      WHERE id = ?
    `);
  
    stmt.run(...values);
  
    const updatedJob = this.getJob(job.id);
    if (!updatedJob) {
      throw new Error('Failed to retrieve updated job');
    }
    return updatedJob;
  });

  deleteJob = deleteJobFn.implement((id) => {
    const stmt = this.db.prepare('DELETE FROM jobs WHERE id = ?');
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
      stepData.status
    );

    const savedStep = this.getWorkflowStep(stepData.jobId, stepData.stepId, stepData.workflowId);
    if (!savedStep) {
      throw new Error('Failed to retrieve saved workflow step');
    }
    return savedStep;
  });

  getWorkflowStep = getWorkflowStepFn.implement((jobId, stepId, workflowId) => {
    return withErrorHandling(
      () => this.db.prepare('SELECT * FROM workflow_steps WHERE jobId = ? AND stepId = ? AND workflowId = ?').get(jobId, stepId, workflowId),
      WorkflowStepSchema,
      `getWorkflowStep(${jobId}, ${stepId}, ${workflowId})`
    );
  });

  getWorkflowSteps = getWorkflowStepsFn.implement((jobId, workflowId) => {
    if (workflowId) {
      return withArrayErrorHandling(
        () => this.db.prepare('SELECT * FROM workflow_steps WHERE jobId = ? AND workflowId = ? ORDER BY id ASC').all(jobId, workflowId),
        z.array(WorkflowStepSchema),
        `getWorkflowSteps(${jobId}, ${workflowId})`
      );
    }
    return withArrayErrorHandling(
      () => this.db.prepare('SELECT * FROM workflow_steps WHERE jobId = ? ORDER BY id ASC').all(jobId),
      z.array(WorkflowStepSchema),
      `getWorkflowSteps(${jobId})`
    );
  });

  saveResume = saveResumeFn.implement((resume) => {
    const { jobId, resumeText, structuredData } = resume;

    const stmt = this.db.prepare(`
      INSERT INTO resumes (jobId, resumeText, structuredData)
      VALUES (?, ?, ?)
      ON CONFLICT(jobId) DO UPDATE SET
        resumeText = excluded.resumeText,
        structuredData = excluded.structuredData,
        updatedAt = CURRENT_TIMESTAMP
    `);

    stmt.run(jobId, resumeText, structuredData);

    const savedResume = this.getResume(jobId);
    if (!savedResume) {
      throw new Error('Failed to retrieve saved resume');
    }
    return savedResume;
  });

  getResume = getResumeFn.implement((jobId) => {
    return withErrorHandling(
      () => this.db.prepare('SELECT * FROM resumes WHERE jobId = ?').get(jobId),
      ResumeSchema,
      `getResume(${jobId})`
    );
  });
  
  getWorkHistory = getWorkHistoryFn.implement(() => {
    return withErrorHandling(
      () => {
        const row = this.db.prepare("SELECT value FROM settings WHERE key = 'workHistory'").get();
        if (!row) return null;
        return (row as any).value;
      },
      z.string().nullable(),
      'getWorkHistory'
    );
  });

  saveWorkHistory = saveWorkHistoryFn.implement((content) => {
    console.log("[saveWorkHistory] Attempting to save...");
    try {
      const stmt = this.db.prepare(`
        INSERT INTO settings (key, value) 
        VALUES ('workHistory', ?)
        ON CONFLICT(key) DO UPDATE SET 
          value = excluded.value, 
          updatedAt = CURRENT_TIMESTAMP
      `);
      console.log("[saveWorkHistory] Statement prepared.");
      const result = stmt.run(content);
      console.log("[saveWorkHistory] Statement executed. Result:", result);
      return true;
    } catch (error) {
      console.error('[saveWorkHistory] Error during save:', error);
      return false;
    }
  });

  close() {
    if (this.db?.open) {
      this.db?.close();
      console.log('SQLite database connection closed.');
    } else {
      console.log('SQLite database connection was already closed.');
    }
  }
}

export function createDbService(dbPath?: string, verbose?: boolean): DbService {
  return new DbService(dbPath, verbose);
}

const dbService = createDbService();

process.on('exit', () => dbService?.close());
process.on('SIGINT', () => {
  dbService?.close();
  process.exit(0);
});
process.on('SIGTERM', () => {
  dbService?.close();
  process.exit(0);
});

export default dbService; 