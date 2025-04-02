import { useState } from "react";
import { Form, Link, useActionData, useLoaderData } from "react-router";
import type { ActionFunctionArgs } from "react-router";
import dbService, { type Job } from "../services/db/dbService";

export function meta() {
  return [
    { title: "Resume Generator Dashboard" },
    { name: "description", content: "Manage your resume generation jobs" },
  ];
}

export async function loader() {
  // Get all jobs from the database
  const jobs = dbService.getAllJobs();
  return { jobs };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const action = formData.get("action") as string;

  if (action === "create") {
    const title = formData.get("title") as string;
    
    if (!title.trim()) {
      return { 
        success: false, 
        error: "Job title is required" 
      };
    }

    // Create a new job with default empty job description
    const jobId = dbService.createJob({
      title,
      jobDescription: "",
    });

    return { 
      success: true, 
      jobId,
      message: "Job created successfully" 
    };
  }

  if (action === "delete") {
    const jobIdString = formData.get("jobId") as string;
    const jobId = Number(jobIdString);
    
    if (Number.isNaN(jobId)) {
      return { 
        success: false, 
        error: "Invalid job ID" 
      };
    }

    const success = dbService.deleteJob(jobId);
    
    return { 
      success, 
      message: success ? "Job deleted successfully" : "Failed to delete job" 
    };
  }

  return { 
    success: false, 
    error: "Invalid action" 
  };
}

export default function Dashboard() {
  const { jobs } = useLoaderData<{ jobs: Job[] }>();
  const actionData = useActionData<{
    success?: boolean;
    error?: string;
    message?: string;
    jobId?: number;
  }>();

  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Resume Generator Dashboard</h1>
        <div className="flex gap-2">
          <Link 
            to="/settings/work-history"
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
          >
            Edit Work History
          </Link>
          <button
            type="button"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? "Cancel" : "Create New Job"}
          </button>
        </div>
      </div>

      {actionData?.error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded">
          {actionData.error}
        </div>
      )}

      {actionData?.success && actionData.message && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-600 rounded">
          {actionData.message}
        </div>
      )}

      {showCreateForm && (
        <div className="mb-8 p-6 bg-gray-50 border rounded">
          <h2 className="text-xl font-semibold mb-4">Create New Resume Job</h2>
          <Form method="post">
            <input type="hidden" name="action" value="create" />
            <div className="mb-4">
              <label htmlFor="title" className="block mb-2 font-medium">
                Job Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                className="w-full px-3 py-2 border rounded"
                placeholder="Enter a title for this job"
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Create Job
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </button>
            </div>
          </Form>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4">Your Resume Jobs</h2>
        
        {jobs.length === 0 ? (
          <div className="text-center p-8 bg-gray-50 border rounded">
            <p className="text-gray-600 mb-4">You don't have any resume jobs yet.</p>
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => setShowCreateForm(true)}
            >
              Create Your First Job
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <div key={job.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 truncate">{job.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    Created: {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : '—'}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Updated: {job.updatedAt ? new Date(job.updatedAt).toLocaleDateString() : '—'}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`/job/${job.id}/content`}
                      className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm flex items-center"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-4 w-4 mr-1" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <title>Generate Content</title>
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                        />
                      </svg>
                      Generate Content
                    </Link>
                    
                    <Link
                      to={`/job/${job.id}/resume`}
                      className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 text-sm flex items-center"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-4 w-4 mr-1" 
                        fill="none" 
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <title>Create Resume</title>
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                        />
                      </svg>
                      Create Resume
                    </Link>
                    
                    <Form method="post">
                      <input type="hidden" name="action" value="delete" />
                      <input type="hidden" name="jobId" value={job.id} />
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm flex items-center"
                        onClick={(e) => {
                          if (!confirm('Are you sure you want to delete this job?')) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-4 w-4 mr-1" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <title>Delete Job</title>
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                          />
                        </svg>
                        Delete
                      </button>
                    </Form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 