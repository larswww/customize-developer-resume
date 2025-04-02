import { useState } from "react";
import { Form, useActionData, useNavigation } from "react-router";
import type { ActionFunctionArgs } from "react-router";
import { PrintableResume } from "../components/PrintableResume";

export function meta() {
	return [
		{ title: "Resume Editor" },
		{ name: "description", content: "Edit and format your resume" },
	];
}

// This is the mock resume content we'll use as the default
const mockResumeContent = `PROFILE  
Front-end developer with substantial experience in Nextjs, TypeScript, and Tailwind. Comfortable setting up new applications from scratch in high-velocity environments. Proven track record in automotive projects, delivering user-friendly interfaces and improving workflows.

RELEVANT EXPERIENCE

Krew (AI)  
• Took over a complex Nextjs codebase from the departing CTO; deployed new features to production within the first week.  
• Translated a detailed Figma prototype into a functional product, enhancing output depth and quality with Python, FastAPI, and Redis on the backend.  
• Iterated on UI from beta to production, focusing on clear typography and streamlined design for end users.

NoLemons (Automotive)  
• Assumed ownership of a legacy full-stack Nextjs and Drupal application; quickly understood, refactored, and deployed it.  
• Enabled the CEO to sell the project to a new owner by stabilizing code, improving responsiveness, and creating a backlog for upcoming enhancements.  

Major Automotive Manufacturer (Automotive)  
• Built a geospatial analysis platform (NextJs, MapBox, MongoDB) to identify optimal EV charging locations, iterating weekly with stakeholders.  
• Repositioned the solution as a generic tool for multiple clients and showcased it at the Junction Hackathon 2022, resulting in high participation and successful recruitment outcomes.  

McKinsey Leap Gen AI Platform (AI, Strategy Consulting) – Lead Developer  
• Implemented core full-stack logic in NextJs/Nestjs for a system modeling McKinsey's business methodology, generating real-time UI in client workshops.  
• Built secure private document ingestion and agent-based retrieval-augmented generation (RAG), ensuring data privacy.  
• Designed an evaluation workflow using LLM feedback to maintain text quality, awarded "Innovation Olympics" Gold Medal and secured €2M in funding.

McKinsey Leap Navigator (Project Management Tools) – Full Stack Team Lead  
• Oversaw sprint planning, backlog grooming, and technical alignment for a Nextjs/Nestjs/Strapi application.  
• Proposed a simplified UX to unblock content delivery, leading to increased user adoption on both desktop and mobile devices.  
• Established a developer-friendly team atmosphere, boosting velocity and encouraging transparent discussions on product-market fit.`;

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	const resumeText = formData.get("resumeText") as string;

	try {
		// For now, we're just sending the text back as-is
		// In a real implementation, we'd process it further
		return {
			success: true,
			resumeText,
		};
	} catch (error) {
		return {
			success: false,
			error:
				error instanceof Error ? error.message : "An unknown error occurred",
		};
	}
}

export default function ResumeEditor() {
	const [resumeText, setResumeText] = useState(mockResumeContent);
	const [showPrintableResume, setShowPrintableResume] = useState(false);

	const actionData = useActionData<{
		success?: boolean;
		resumeText?: string;
		error?: string;
	}>();
	const navigation = useNavigation();

	// Use React Router's navigation state to determine if form is submitting
	const isSubmitting = navigation.state === "submitting";

	return (
		<div className="max-w-6xl mx-auto p-6">
			<div className="mb-6">
				<h1 className="text-3xl font-bold mb-2">Resume Editor</h1>
				<p className="text-gray-600">
					Edit your resume text and convert it to a printable format.
				</p>
			</div>

			<div className="bg-white shadow-md rounded-lg p-6 mb-8">
				<Form method="post" className="mb-4">
					<div className="mb-4">
						<label
							htmlFor="resumeText"
							className="block mb-2 font-medium text-gray-700"
						>
							Resume Text
						</label>
						<textarea
							id="resumeText"
							name="resumeText"
							value={resumeText}
							onChange={(e) => setResumeText(e.target.value)}
							className="w-full h-96 p-4 border rounded font-mono text-sm bg-gray-50"
							placeholder="Enter your resume text here..."
						/>
					</div>

					<div className="flex gap-4">
						<button
							type="submit"
							className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center"
							disabled={isSubmitting}
						>
							{isSubmitting ? (
								<>
									<svg
										className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										aria-hidden="true"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										/>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										/>
									</svg>
									Processing...
								</>
							) : (
								<>Format Resume</>
							)}
						</button>
					</div>
				</Form>
			</div>

			{navigation.state === "loading" && actionData === undefined && (
				<div className="mb-4 p-4 border rounded bg-blue-50">
					<div className="flex items-center">
						<svg
							className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<circle
								className="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="4"
							/>
							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							/>
						</svg>
						<span>Loading results...</span>
					</div>
				</div>
			)}

			{actionData?.error && (
				<div className="text-red-500 mb-4 p-4 border border-red-200 rounded bg-red-50">
					{actionData.error}
				</div>
			)}

			{actionData?.success && actionData.resumeText && (
				<div className="bg-white shadow-md rounded-lg p-6">
					<div className="flex justify-between items-center mb-4">
						<h2 className="text-xl font-bold">Formatted Resume</h2>
						<button
							type="button"
							onClick={() => setShowPrintableResume(true)}
							className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
								/>
							</svg>
							Print/Export as PDF
						</button>
					</div>
					<div className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-6 rounded border border-gray-200 max-h-[600px] overflow-y-auto">
						{actionData.resumeText}
					</div>
				</div>
			)}

			{/* Printable Resume Modal */}
			{showPrintableResume && actionData?.resumeText && (
				<PrintableResume
					resumeContent={actionData.resumeText}
					onClose={() => setShowPrintableResume(false)}
				/>
			)}
		</div>
	);
}
