import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type { ContactInfo } from "~/config/schemas/sharedTypes";
import type { DefaultResumeData } from "../../config/schemas/default";
import { type WorkflowStepStatus, createDbService, DB_PATHS } from "./dbService.server";
import deleteTestDb from "~/../tests/e2e/utils/deleteTestDb";

// Use the standard test DB path
// const TEST_DB_PATH = "./db-data/test_resume_app.db"; 

describe("DbService", () => {
  let dbService: ReturnType<typeof createDbService>;

  beforeEach(() => {
    deleteTestDb();
    // Use DB_PATHS.TEST here
    dbService = createDbService(DB_PATHS.TEST, false);
  });

  afterEach(() => {
    try {
      if (dbService) {
        dbService.close();
      }
    } catch (error) {
      console.error("Error closing database:", error);
    }
  });

  describe("Job operations", () => {
    it("should create a job", () => {
      const jobData = {
        title: "Software Engineer",
        jobDescription: "Develop software applications",
        relevantDescription: "Looking for React experience",
      };

      const job = dbService.createJob(jobData);

      expect(job).toBeDefined();
      expect(job.id).toBeDefined();
      expect(job.title).toBe(jobData.title);
      expect(job.jobDescription).toBe(jobData.jobDescription);
      expect(job.relevantDescription).toBe(jobData.relevantDescription);
      expect(job.createdAt).toBeDefined();
      expect(job.updatedAt).toBeDefined();
    });

    it("should get a job by id", () => {
      const jobData = {
        title: "Frontend Developer",
        jobDescription: "Build user interfaces",
        relevantDescription: "React expertise required",
      };

      const createdJob = dbService.createJob(jobData);
      const retrievedJob = dbService.getJob(createdJob.id);

      expect(retrievedJob).toBeDefined();
      if (retrievedJob) {
        expect(retrievedJob.id).toBe(createdJob.id);
        expect(retrievedJob.title).toBe(jobData.title);
      }
    });

    it("should update a job", () => {
      const jobData = {
        title: "Backend Developer",
        jobDescription: "Develop server-side logic",
        relevantDescription: "Node.js experience needed",
      };

      const createdJob = dbService.createJob(jobData);

      const updatedJobData = {
        id: createdJob.id,
        title: "Senior Backend Developer",
        relevantDescription: "Node.js and AWS experience needed",
      };

      const updatedJob = dbService.updateJob(updatedJobData);

      expect(updatedJob.title).toBe(updatedJobData.title);
      expect(updatedJob.relevantDescription).toBe(
        updatedJobData.relevantDescription
      );
      expect(updatedJob.jobDescription).toBe(jobData.jobDescription); // Should remain unchanged
    });

    it("should delete a job", () => {
      const jobData = {
        title: "DevOps Engineer",
        jobDescription: "Manage CI/CD pipelines",
      };

      const createdJob = dbService.createJob(jobData);
      const deleteResult = dbService.deleteJob(createdJob.id);

      expect(deleteResult).toBe(true);

      const retrievedJob = dbService.getJob(createdJob.id);
      expect(retrievedJob).toBeFalsy();
    });

    it("should get all jobs", () => {
      const jobData1 = {
        title: "Job 1",
        jobDescription: "Description 1",
      };

      const jobData2 = {
        title: "Job 2",
        jobDescription: "Description 2",
      };

      dbService.createJob(jobData1);
      dbService.createJob(jobData2);

      const allJobs = dbService.getAllJobs();

      expect(allJobs.length).toBeGreaterThanOrEqual(2);
      expect(allJobs.some((job) => job.title === "Job 1")).toBe(true);
      expect(allJobs.some((job) => job.title === "Job 2")).toBe(true);
    });
  });

  describe("Workflow step operations", () => {
    it("should save a workflow step", () => {
      const job = dbService.createJob({
        title: "Test Job",
        jobDescription: "Description",
      });

      const stepData = {
        jobId: job.id,
        stepId: "analyze",
        workflowId: "default",
        result: "Analysis complete",
        status: "success" as WorkflowStepStatus,
      };

      const step = dbService.saveWorkflowStep(stepData);

      expect(step).toBeDefined();
      expect(step.jobId).toBe(job.id);
      expect(step.stepId).toBe(stepData.stepId);
      expect(step.workflowId).toBe(stepData.workflowId);
      expect(step.result).toBe(stepData.result);
      expect(step.status).toBe(stepData.status);
    });

    it("should update an existing workflow step", () => {
      const job = dbService.createJob({
        title: "Update Step Job",
        jobDescription: "Testing step updates",
      });

      // Initial step
      const initialStep = {
        jobId: job.id,
        stepId: "extract",
        workflowId: "default",
        result: "Initial result",
        status: "processing" as WorkflowStepStatus,
      };

      dbService.saveWorkflowStep(initialStep);

      // Update step
      const updatedStep = {
        jobId: job.id,
        stepId: "extract",
        workflowId: "default",
        result: "Updated result",
        status: "success" as WorkflowStepStatus,
      };

      const result = dbService.saveWorkflowStep(updatedStep);

      expect(result.result).toBe(updatedStep.result);
      expect(result.status).toBe(updatedStep.status);
    });

    it("should get workflow steps for a job", () => {
      const job = dbService.createJob({
        title: "Multiple Steps Job",
        jobDescription: "Testing multiple steps",
      });

      const step1 = {
        jobId: job.id,
        stepId: "step1",
        workflowId: "default",
        result: "Result 1",
        status: "success" as WorkflowStepStatus,
      };

      const step2 = {
        jobId: job.id,
        stepId: "step2",
        workflowId: "default",
        result: "Result 2",
        status: "success" as WorkflowStepStatus,
      };

      dbService.saveWorkflowStep(step1);
      dbService.saveWorkflowStep(step2);

      const steps = dbService.getWorkflowSteps(job.id, "default");

      expect(steps.length).toBe(2);
      expect(steps.some((s) => s.stepId === "step1")).toBe(true);
      expect(steps.some((s) => s.stepId === "step2")).toBe(true);
    });
  });

  describe("Resume operations", () => {
    it("should save a resume", () => {
      const job = dbService.createJob({
        title: "Resume Job",
        jobDescription: "Testing resume save",
      });

      const resumeData = {
        jobId: job.id,
        resumeText: "This is a test resume",
        structuredData: {
          contactInfo: {
            title: "Software Developer",
            name: "John Doe",
            location: "San Francisco, CA",
            phone: "123-456-7890",
            email: "john.doe@example.com",
            linkedin: "linkedin.com/in/johndoe",
          },
          workExperience: [
            {
              title: "Developer",
              company: "Tech Inc",
              location: "San Francisco, CA",
              dates: "2020-2023",
              description: ["Developed features", "Fixed bugs"],
            },
          ],
          education: [
            {
              institution: "University of Code",
              degree: "BS Computer Science",
              location: "San Francisco, CA",
              dates: "2016-2020",
            },
          ],
          skills: [
            {
              category: "Programming",
              items: [
                { name: "JavaScript" },
                { name: "React" },
                { name: "Node.js" },
              ],
            },
          ],
        } as DefaultResumeData,
      };

      const resume = dbService.saveResume(resumeData);

      expect(resume).toBeDefined();
      expect(resume.jobId).toBe(job.id);
      expect(resume.resumeText).toBe(resumeData.resumeText);
      expect(resume.structuredData).toEqual(resumeData.structuredData);
    });

    it("should get a resume by job id", () => {
      const job = dbService.createJob({
        title: "Get Resume Job",
        jobDescription: "Testing resume retrieval",
      });

      const resumeData = {
        jobId: job.id,
        resumeText: "Another test resume",
        structuredData: {
          contactInfo: {
            title: "UI Designer",
            name: "Jane Smith",
            location: "New York, NY",
            phone: "123-456-7890",
            email: "jane.smith@example.com",
            linkedin: "linkedin.com/in/janesmith",
          },
          workExperience: [
            {
              title: "Designer",
              company: "Creative Co",
              location: "New York, NY",
              dates: "2019-2023",
              description: ["Designed interfaces", "Created prototypes"],
            },
          ],
          education: [
            {
              institution: "Design Institute",
              degree: "BA Design",
              location: "New York, NY",
              dates: "2015-2019",
            },
          ],
          skills: [
            {
              category: "Design",
              items: [
                { name: "UI/UX" },
                { name: "Figma" },
                { name: "Adobe XD" },
              ],
            },
          ],
        } as DefaultResumeData,
      };

      dbService.saveResume(resumeData);

      const resume = dbService.getResume(job.id, "default");

      expect(resume).toBeDefined();
      if (resume) {
        expect(resume.jobId).toBe(job.id);
        expect(resume.resumeText).toBe(resumeData.resumeText);
        expect(resume.structuredData).toEqual(resumeData.structuredData);
      }
    });

    it("should update an existing resume", () => {
      const job = dbService.createJob({
        title: "Update Resume Job",
        jobDescription: "Testing resume updates",
      });

      // Initial resume
      const initialResume = {
        jobId: job.id,
        resumeText: "Initial resume text",
        structuredData: {
          contactInfo: {
            title: "Developer",
            name: "Initial Name",
            location: "Location",
            phone: "123-456-7890",
            email: "initial@example.com",
            linkedin: "linkedin.com/in/initial",
          },
          workExperience: [],
          education: [],
          skills: [],
        } as DefaultResumeData,
      };

      dbService.saveResume(initialResume);

      // Update resume
      const updatedResume = {
        jobId: job.id,
        resumeText: "Updated resume text",
        structuredData: {
          contactInfo: {
            title: "Senior Developer",
            name: "Updated Name",
            location: "Updated Location",
            phone: "123-456-7890",
            email: "updated@example.com",
            linkedin: "linkedin.com/in/updated",
          },
          workExperience: [],
          education: [],
          skills: [],
        } as DefaultResumeData,
      };

      const result = dbService.saveResume(updatedResume);

      expect(result.resumeText).toBe(updatedResume.resumeText);
      expect(result.structuredData).toEqual(updatedResume.structuredData);
    });
  });

  // Work history settings tests
  describe("Work history settings", () => {
    it("should save and retrieve work history", () => {
      const workHistory = "My detailed work history goes here";

      const saveResult = dbService.saveWorkHistory(workHistory);
      expect(saveResult).toBe(true);

      const retrievedHistory = dbService.getWorkHistory();
      expect(retrievedHistory).toBe(workHistory);
    });
  });

  // Contact Info settings tests
  describe("Contact info settings", () => {
    it("should save and retrieve contact info", () => {
      const contactData: ContactInfo = {
        firstName: "Test User",
        title: "Tester",
        location: "Test City",
        phone: "111-222-3333",
        email: "test@example.com",
        linkedin: "https://linkedin.com/in/test",
        portfolio: "https://test.com",
        imageUrl: "https://example.com/image.jpg",
      };

      const saveResult = dbService.saveContactInfo(contactData);
      expect(saveResult).toBe(true);

      const retrievedInfo = dbService.getContactInfo();
      expect(retrievedInfo).toEqual(contactData);
    });

    it("should update existing contact info", () => {
      const initialData: ContactInfo = {
        firstName: "Initial User",
        title: "Initial Title",
        location: "Initial City",
        phone: "111-111-1111",
        email: "initial@example.com",
        linkedin: "https://linkedin.com/in/initial",
        portfolio: "https://initial.com",
        imageUrl: "https://example.com/image.jpg",
      };
      dbService.saveContactInfo(initialData);

      const updatedData: ContactInfo = {
        ...initialData, // Keep some initial data
        firstName: "Updated User",
        title: "Updated Title",
        imageUrl: "https://example.com/new-image.png",
      };

      const saveResult = dbService.saveContactInfo(updatedData);
      expect(saveResult).toBe(true);

      const retrievedInfo = dbService.getContactInfo();
      expect(retrievedInfo).toEqual(updatedData);
    });
  });
});
