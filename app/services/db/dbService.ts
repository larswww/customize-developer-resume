import Database from 'better-sqlite3';
import type { ResumeData } from '../../components/ResumeTemplate';

export interface Job {
  id: number;
  title: string;
  jobDescription: string;
  relevantDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowStep {
  id: number;
  jobId: number;
  stepId: string;
  result: string;
  status: string; // 'pending', 'processing', 'completed', 'error'
  createdAt: string;
  updatedAt: string;
}

export interface Resume {
  id?: number;
  jobId: number;
  resumeText?: string;
  structuredData?: ResumeData;
  createdAt?: string;
  updatedAt?: string;
}

// Define the database file path
const dbPath = './resume_app.db';
let database: Database.Database;

try {
  // Initialize better-sqlite3 database connection
  database = new Database(dbPath, { verbose: console.log });
  
  // Enable WAL mode for better concurrency
  database.pragma('journal_mode = WAL');
  
  console.log(`SQLite database connected at ${dbPath}`);
} catch (error) {
  console.error('Error connecting to SQLite database:', error);
  // Depending on the error, you might want to exit the application
  // or handle it differently.
  process.exit(1); // Exit if DB connection fails
}

// DB Facade class for all database operations
class DbService {
  private db: Database.Database;

  // Initialize tables if they don't exist
  constructor(dbInstance: Database.Database) {
    this.db = dbInstance;
    this.initializeTables();
  }

  private initializeTables() {
    // Transaction for schema initialization
    const initSchema = this.db.transaction(() => {
      // Create jobs table
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

      // Create workflow_steps table
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS workflow_steps (
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
      
      // Create resumes table
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS resumes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          jobId INTEGER NOT NULL UNIQUE, -- Ensure only one resume per job
          resumeText TEXT,
          structuredData TEXT, -- Store JSON as text
          createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (jobId) REFERENCES jobs(id) ON DELETE CASCADE
        )
      `);

      // Create unique index on workflow_steps
      this.db.exec(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_workflow_steps_job_step
        ON workflow_steps (jobId, stepId)
      `);
      
      // Add triggers for updatedAt timestamp
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

      // Add a sample job for development if no jobs exist
      const jobCount = this.db.prepare('SELECT COUNT(*) as count FROM jobs').get() as { count: number };
      if (jobCount.count === 0) {
        console.log('Adding sample job for development');
        this.createJob({
          title: 'Sample Frontend Developer Job',
          jobDescription: `Frontend Developer - React/TypeScript

We're looking for a passionate Frontend Developer with expertise in React and TypeScript to join our growing team. The ideal candidate will be responsible for building and maintaining responsive web applications.

Requirements:
- 3+ years of experience with React
- Strong proficiency in TypeScript
- Experience with NextJS or similar React frameworks
- Knowledge of modern frontend build tools
- Good understanding of responsive design principles
- Ability to write clean, maintainable code
- Experience with RESTful APIs

Nice to have:
- Experience with GraphQL
- Knowledge of testing frameworks (Jest, React Testing Library)
- Understanding of CI/CD pipelines
- Experience with state management solutions (Redux, MobX, Zustand)

What we offer:
- Competitive salary
- Remote-friendly work environment
- Opportunities for professional growth
- Collaborative and supportive team culture`
        });
      }
    });

    try {
      initSchema();
      console.log('Database schema initialized successfully.');
    } catch (error) {
      console.error('Error initializing database schema:', error);
    }
  }

  // Job methods
  createJob(jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>): Job {
    const stmt = this.db.prepare(`
      INSERT INTO jobs (title, jobDescription, relevantDescription)
      VALUES (?, ?, ?)
    `);

    const result = stmt.run(
      jobData.title,
      jobData.jobDescription,
      jobData.relevantDescription || ''
    );

    // Fetch the newly created job to get default values like createdAt
    const newJob = this.getJob(result.lastInsertRowid as number);
    if (!newJob) {
      throw new Error('Failed to retrieve newly created job');
    }
    return newJob;
  }

  getJob(id: number): Job | null {
    const stmt = this.db.prepare('SELECT * FROM jobs WHERE id = ?');
    return stmt.get(id) as Job | null;
  }

  getAllJobs(): Job[] {
    const stmt = this.db.prepare('SELECT * FROM jobs ORDER BY createdAt DESC');
    return stmt.all() as Job[];
  }

  updateJob(job: Partial<Job> & { id: number }): Job {
    const fieldsToUpdate = Object.keys(job).filter(key => key !== 'id' && key !== 'createdAt' && key !== 'updatedAt');
    if (fieldsToUpdate.length === 0) {
      const currentJob = this.getJob(job.id);
      if (!currentJob) throw new Error(`Job with id ${job.id} not found`);
      return currentJob; // No fields to update
    }
  
    const setClause = fieldsToUpdate.map(key => `${key} = ?`).join(', ');
    const values = fieldsToUpdate.map(key => (job as any)[key]);
    values.push(job.id); // Add id for the WHERE clause
  
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
  }

  deleteJob(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM jobs WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Workflow step methods
  saveWorkflowStep(stepData: {
    jobId: number;
    stepId: string;
    result: string;
    status: string;
  }): WorkflowStep {
    // Use INSERT OR REPLACE (UPSERT) based on unique index
    const stmt = this.db.prepare(`
      INSERT INTO workflow_steps (jobId, stepId, result, status)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(jobId, stepId) DO UPDATE SET
        result = excluded.result,
        status = excluded.status,
        updatedAt = CURRENT_TIMESTAMP
    `);

    const result = stmt.run(
      stepData.jobId,
      stepData.stepId,
      stepData.result,
      stepData.status
    );

    // Fetch the saved/updated step
    const savedStep = this.getWorkflowStep(stepData.jobId, stepData.stepId);
    if (!savedStep) {
      throw new Error('Failed to retrieve saved workflow step');
    }
    return savedStep;
  }

  getWorkflowStep(jobId: number, stepId: string): WorkflowStep | null {
    const stmt = this.db.prepare(
      'SELECT * FROM workflow_steps WHERE jobId = ? AND stepId = ?'
    );
    return stmt.get(jobId, stepId) as WorkflowStep | null;
  }

  getWorkflowSteps(jobId: number): WorkflowStep[] {
    const stmt = this.db.prepare(
      'SELECT * FROM workflow_steps WHERE jobId = ? ORDER BY id ASC'
    );
    return stmt.all(jobId) as WorkflowStep[];
  }

  // Resume operations
  saveResume(resume: Resume): Resume {
    const { jobId, resumeText, structuredData } = resume;
    // Serialize structuredData if it exists
    const structuredDataJson = structuredData ? JSON.stringify(structuredData) : null;

    const stmt = this.db.prepare(`
      INSERT INTO resumes (jobId, resumeText, structuredData)
      VALUES (?, ?, ?)
      ON CONFLICT(jobId) DO UPDATE SET
        resumeText = excluded.resumeText,
        structuredData = excluded.structuredData,
        updatedAt = CURRENT_TIMESTAMP
    `);

    stmt.run(jobId, resumeText, structuredDataJson);

    // Fetch the saved/updated resume
    const savedResume = this.getResume(jobId);
    if (!savedResume) {
      throw new Error('Failed to retrieve saved resume');
    }
    return savedResume;
  }

  getResume(jobId: number): Resume | null {
    const stmt = this.db.prepare('SELECT * FROM resumes WHERE jobId = ?');
    const result = stmt.get(jobId) as any; // Get raw result

    if (result && result.structuredData) {
      try {
        result.structuredData = JSON.parse(result.structuredData);
      } catch (e) {
        console.error(`Error parsing structuredData for resume jobId ${jobId}:`, e);
        result.structuredData = null; // Set to null if parsing fails
      }
    }
    return result as Resume | null;
  }
  
  close() {
    if (this.db?.open) {
      this.db.close();
      console.log('Database connection closed.');
    }
  }
}

// Create and export a singleton instance
const dbService = new DbService(database);

// Ensure the database connection is closed gracefully on exit
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