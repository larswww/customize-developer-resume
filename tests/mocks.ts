import dbService from "../app/services/db/dbService.server"; // Adjust path if needed
import type { Job } from "~/services/db/dbService.server"; // Adjust path if needed

// Export handlers from the app for use in tests
export { handlers } from "../app/mocks/handlers";

// Helper function to create a job for testing purposes
export async function createNewJob(jobData: Partial<Job>): Promise<number> {
  const defaultJob = {
    title: 'Test Job',
    company: 'Test Company',
    jobDescription: '',
    relevantDescription: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: 'test-user', // Or handle user context appropriately
    status: 'draft',
    ...jobData,
  };
  const newJob = dbService.createJob(defaultJob as Omit<Job, 'id'>);
  if (!newJob || typeof newJob.id !== 'number') {
    throw new Error('Failed to create job for test setup');
  }
  return newJob.id;
}
