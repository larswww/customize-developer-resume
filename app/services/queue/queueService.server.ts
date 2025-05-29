import { type JobState, Queue, QueueEvents } from "bullmq";
import { serverLogger } from "~/utils/logger.server";

// Redis connection configuration
const connection = {
	host: process.env.REDIS_HOST || "localhost",
	port: Number.parseInt(process.env.REDIS_PORT || "6379"),
};

// Queue names
export const QUEUE_NAMES = {
	RESUME_GENERATION: "resume-generation",
};

// Job types
export const JOB_TYPES = {
	GENERATE_RESUME: "generate-resume",
};

// Job status
export const JobStatus = {
	WAITING: "waiting",
	ACTIVE: "active",
	COMPLETED: "completed",
	FAILED: "failed",
} as const;

// Type for resume generation job data
export interface ResumeGenerationJobData {
	jobId: number;
	templateId: string;
	workflowId: string;
}

// Type for search criteria
export interface JobSearchCriteria {
	jobId?: number;
	templateId?: string;
	workflowId?: string;
}

// Create queues
const resumeGenerationQueue = new Queue(QUEUE_NAMES.RESUME_GENERATION, {
	connection,
});
const queueEvents = new QueueEvents(QUEUE_NAMES.RESUME_GENERATION, {
	connection,
});

// Increase max listeners to prevent memory leak warnings
queueEvents.setMaxListeners(50);

// Cache for job completion promises to prevent duplicate listeners
const jobCompletionCache = new Map<string, Promise<any>>();

// Export the queue service
export const queueService = {
	// Add a resume generation job to the queue
	async addResumeGenerationJob(data: ResumeGenerationJobData) {
		const job = await resumeGenerationQueue.add(
			JOB_TYPES.GENERATE_RESUME,
			data,
			{
				removeOnComplete: false,
				removeOnFail: false,
			},
		);

		serverLogger.log(`Added resume generation job to queue: ${job.id}`);
		return job.id;
	},

	// Get a job by id
	async getJob(jobId: string) {
		return await resumeGenerationQueue.getJob(jobId);
	},

	// Search for jobs by their data properties
	async searchJobsByData(
		criteria: JobSearchCriteria,
		statuses: JobState[] = [],
	) {
		// Get jobs in various states
		const jobs = await resumeGenerationQueue.getJobs(statuses);

		// Filter jobs by criteria
		return jobs.filter((job) => {
			const data = job.data;

			// Match each provided criteria
			if (criteria.jobId !== undefined && data.jobId !== criteria.jobId) {
				return false;
			}

			if (
				criteria.templateId !== undefined &&
				data.templateId !== criteria.templateId
			) {
				return false;
			}

			if (
				criteria.workflowId !== undefined &&
				data.workflowId !== criteria.workflowId
			) {
				return false;
			}

			return true;
		});
	},

	// Get job status
	async getJobStatus(jobId: string) {
		const job = await resumeGenerationQueue.getJob(jobId);
		if (!job) return null;

		if (await job.isCompleted()) return JobStatus.COMPLETED;
		if (await job.isActive()) return JobStatus.ACTIVE;
		if (await job.isFailed()) return JobStatus.FAILED;
		return JobStatus.WAITING;
	},

	// Wait for a job to complete and get the result
	async waitForJobCompletion(jobId: string) {
		// Check if we already have a cached promise for this job
		if (jobCompletionCache.has(jobId)) {
			return jobCompletionCache.get(jobId);
		}

		await queueEvents.waitUntilReady();

		const job = await resumeGenerationQueue.getJob(jobId);
		if (!job) {
			throw new Error(`Job ${jobId} not found`);
		}

		// If job is already completed, return immediately
		if (await job.isCompleted()) {
			const result = {
				status: JobStatus.COMPLETED,
				jobId: job.data.jobId,
				templateId: job.data.templateId,
			};
			jobCompletionCache.set(jobId, Promise.resolve(result));
			return result;
		}

		// If job has failed, throw error
		if (await job.isFailed()) {
			throw new Error(`Job ${jobId} failed: ${job.failedReason}`);
		}

		// Create a promise that will resolve when the job completes
		const completionPromise = job
			.waitUntilFinished(queueEvents)
			.then(() => ({
				status: JobStatus.COMPLETED,
				jobId: job.data.jobId,
				templateId: job.data.templateId,
			}))
			.catch((error: Error) => {
				// Remove from cache on error
				jobCompletionCache.delete(jobId);
				throw new Error(`Error waiting for job ${jobId}: ${error.message}`);
			})
			.finally(() => {
				// Clean up the cache after the job completes or fails
				// with a small delay to allow any other code to access the result
				setTimeout(() => {
					jobCompletionCache.delete(jobId);
				}, 5000);
			});

		// Cache the promise to avoid creating duplicate event listeners
		jobCompletionCache.set(jobId, completionPromise);
		return completionPromise;
	},

	// Clear cached job completion promises
	clearJobCompletionCache() {
		jobCompletionCache.clear();
	},

	// Clean up - close connections
	async close() {
		this.clearJobCompletionCache();
		await resumeGenerationQueue.close();
	},
};

// Initialize shutdown handlers
process.on("exit", async () => {
	await queueService.close();
});
process.on("SIGINT", async () => {
	await queueService.close();
	process.exit(0);
});
process.on("SIGTERM", async () => {
	await queueService.close();
	process.exit(0);
});

export default queueService;
