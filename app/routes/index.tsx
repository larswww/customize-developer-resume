import { useState } from "react";
import { Suspense } from "react";
import ReactMarkdown from "react-markdown";
import { Form, useActionData, useNavigation } from "react-router";
import type { ActionFunctionArgs } from "react-router";
import { Await, useAsyncError } from "react-router";
import { StepErrorBoundary } from "../components/StepErrorBoundary";
import { workflowSteps } from "../config/workflow";
import { executeWorkflow, validateApiKeys } from "../services/workflow/WorkflowService";
import { WorkflowEngine } from "../services/workflow/WorkflowEngine";
import { workHistory } from "../data/workHistory";

export function meta() {
	return [
		{ title: "AI Resume Generator" },
		{ name: "description", content: "Generate targeted resumes using AI" },
	];
}

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	const jobDescription = formData.get("jobDescription") as string;
	const mode = formData.get("mode") as string; // 'withSteps' or 'serverOnly'

	// Validate API keys
	const { missingKeys, isValid } = validateApiKeys();

	if (!isValid) {
		return {
			success: false,
			error: `Missing required API keys: ${missingKeys.join(", ")}. Please check your environment configuration.`,
			mode,
		};
	}

	try {
		if (mode === "serverOnly") {
			// For server-only execution
			const generatedResume = await executeWorkflow(jobDescription);
			return { success: true, result: generatedResume, mode };
		}

		// For step-by-step execution
		const engine = new WorkflowEngine({
			anthropic: process.env.ANTHROPIC_API_KEY || "",
			openai: process.env.OPENAI_API_KEY || "",
			gemini: process.env.GEMINI_API_KEY || "",
		}, workflowSteps);

		// Create promises for each step
		const stepPromises = engine.createStepPromises(jobDescription, workHistory);
		const stepResults: Record<string, Promise<unknown>> = {};

		// Store the promises by step ID for client-side resolution
		workflowSteps.forEach((step, index) => {
			// We don't call the promises here - they're already called in the WorkflowEngine
			stepResults[step.id] = stepPromises[index]();
		});

		// Return the promises for client-side resolution
		return {
			success: true,
			mode,
			stepPromises: stepResults,
			totalSteps: workflowSteps.length,
		};
	} catch (error) {
		// Enhanced error logging
		console.error("Error in action handler:", error);

		return {
			success: false,
			error:
				error instanceof Error ? error.message : "An unknown error occurred",
			mode,
		};
	}
}

const testJd = `Front-end developer | Opzetten nieuw project in Nextjs

Door Paul van Lent op 18 mrt 2025, 15:28

117 keer bekeken

    16 reacties ontvangen

Status
    Gesloten
Referentie
    -
Uiterste reactiedatum
    -
Op locatie
    In overleg, Utrecht, Utrecht
Startdatum
    Zo snel mogelijk starten
Duur van de opdracht
    3 maanden (optie tot verlenging)
Aantal uur per week
    32 - 40 uur per week
Tarief
    € 50,00 - € 70,00 Per uur
Contract
    Freelance

Opdrachtomschrijving

We zijn op zoek naar jou, de beste Nextjs frontend developer, om te helpen bij het opzetten van een nieuw product management systeem voor zowel tweedehands als nieuwe auto's.
Wat vragen we?

Onze ideale freelancer:

    Spreekt Nederlands en wil, naast thuiswerken, ook regelmatig op kantoor in Utrecht met ons samenwerken;

    Heeft meer dan voldoende ervaring met Nextjs, TypeScript en Tailwind;

    Is bedreven met het bouwen van responsieve en gebruiksvriendelijke interfaces;

    Is bekend met het opzetten vanaf scratch van applicaties zoals deze en schrikt daar niet van terug.

Waar ga je aan werken?

Het doel is een MVP opleveren van een Product Management Systeem (of Voertuig Management Systeem) wat ons helpt de doorlooptijd van onze auto's van inkoop tot verkoop te verkorten en inzicht in dit proces te verbeteren.

Het proces bestaat uit het innemen van een auto en bepalen wat de volgende stap is. Dat kan bijvoorbeeld spuiten, poetsen, wassen of uitdeuken zijn. Al deze stappen willen we per auto kunnen volgen, tot aan het moment dat de auto online gepubliceerd kan worden, om uiteindelijk verkocht te worden. Het management systeem stelt ons in staat om statussen aan auto's toe te kennen, voertuigdata en foto's toe te voegen, maar ook dashboarding en actielijstjes voor specifieke gebruikers te maken. Alles om dit proces zo digitaal en optimaal mogelijk te maken.

We hebben een duidelijk beeld, workflows en designs waarmee je aan de slag kunt. Je werkt samen met onze backend developer, UX/UI designers en product owner om te komen tot een goede afronding van dit project. We verwachten dat het opzetten en het komen tot een MVP wel enkele maanden in beslag kan nemen.`;

export default function Index() {
	const [jobDescription, setJobDescription] = useState(testJd);
	const actionData = useActionData<{
		success?: boolean;
		result?: string;
		error?: string;
		mode?: string;
		stepPromises?: Record<string, Promise<unknown>>;
		totalSteps?: number;
	}>();
	const navigation = useNavigation();

	// Use React Router's navigation state to determine if form is submitting
	const isSubmitting = navigation.state === "submitting";

	// Get the step name for display
	const getStepName = (stepId: string): string => {
		switch (stepId) {
			case "analyze-job":
				return "Analyzing Job Description";
			case "match-experience":
				return "Matching Relevant Experience";
			case "generate-resume":
				return "Generating Resume";
			default:
				return stepId;
		}
	};

	// Function to render the workflow steps
	const renderWorkflowSteps = () => {
		if (
			!actionData?.stepPromises ||
			!actionData.success ||
			actionData.mode !== "withSteps"
		) {
			return null;
		}

		// Final result will be in the last step
		const finalStepId = workflowSteps[workflowSteps.length - 1].id;

		// Component to handle errors from Await
		const StepErrorElement = ({ stepId }: { stepId: string }) => {
			const error = useAsyncError() as Error;
			return <StepErrorBoundary stepId={stepId} error={error} />;
		};

		return (
			<div className="mb-8">
				<h2 className="text-xl font-bold mb-4">Resume Generation Progress</h2>

				{workflowSteps.map((step, index) => (
					<div key={step.id} className="mb-4">
						<div className="flex items-center mb-2">
							<div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 mr-2">
								{index + 1}
							</div>
							<h3 className="font-medium">{getStepName(step.id)}</h3>
						</div>

						<Suspense
							fallback={
								<div className="ml-10 p-3 border rounded bg-gray-50">
									<div className="animate-pulse flex space-x-4">
										<div className="flex-1 space-y-4 py-1">
											<div className="h-4 bg-gray-200 rounded w-3/4" />
											<div className="space-y-2">
												<div className="h-4 bg-gray-200 rounded" />
												<div className="h-4 bg-gray-200 rounded w-5/6" />
											</div>
										</div>
									</div>
									<div className="mt-2 text-sm text-gray-500">
										Processing {getStepName(step.id)}...
									</div>
								</div>
							}
						>
							<Await
								resolve={actionData.stepPromises?.[step.id]}
								errorElement={<StepErrorElement stepId={step.id} />}
							>
								{(result) => (
									<div className="ml-10 p-3 border rounded bg-green-50">
										<div className="flex items-center text-green-700 mb-2">
											<svg
												className="w-5 h-5 mr-2"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
												xmlns="http://www.w3.org/2000/svg"
												aria-hidden="true"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M5 13l4 4L19 7"
												/>
											</svg>
											<span>Step completed</span>
										</div>

										{step.id === finalStepId ? (
											<div>
												<h3 className="font-medium mb-2">
													Your Generated Resume:
												</h3>
												<ReactMarkdown className="prose max-w-none">
													{typeof result === "string" ? result : String(result)}
												</ReactMarkdown>
											</div>
										) : (
											<div className="markdown-content">
												<ReactMarkdown className="prose max-w-none">
													{typeof result === "string" ? result : String(result)}
												</ReactMarkdown>
											</div>
										)}
									</div>
								)}
							</Await>
						</Suspense>
					</div>
				))}
			</div>
		);
	};

	return (
		<div className="max-w-4xl mx-auto p-6">
			<h1 className="text-2xl font-bold mb-6">AI Resume Generator</h1>

			<Form method="post" className="mb-8">
				<div className="mb-4">
					<label htmlFor="jobDescription" className="block mb-2 font-medium">
						Job Description
					</label>
					<textarea
						id="jobDescription"
						name="jobDescription"
						value={jobDescription}
						onChange={(e) => setJobDescription(e.target.value)}
						className="w-full h-48 p-2 border rounded"
						placeholder="Paste the job description here..."
					/>
				</div>

				<div className="flex gap-4">
					<button
						type="submit"
						name="mode"
						value="withSteps"
						className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
						disabled={isSubmitting}
					>
						{isSubmitting ? "Processing..." : "Generate Resume with Steps"}
					</button>

					<button
						type="submit"
						name="mode"
						value="serverOnly"
						className="px-4 py-2 bg-gray-500 text-white rounded disabled:bg-gray-400"
						disabled={isSubmitting}
					>
						{isSubmitting ? "Generating..." : "Generate Resume (Server only)"}
					</button>
				</div>
			</Form>

			{renderWorkflowSteps()}

			{navigation.state === "loading" && actionData === undefined && (
				<div className="mb-4 p-4 border rounded bg-blue-50">
					Loading results...
				</div>
			)}

			{actionData?.error && (
				<div className="text-red-500 mb-4 p-4 border border-red-200 rounded bg-red-50">
					{actionData.error}
				</div>
			)}

			{actionData?.success &&
				actionData.result &&
				actionData.mode === "serverOnly" && (
					<div className="border rounded p-4">
						<h2 className="text-xl font-bold mb-4">Generated Resume</h2>
						<ReactMarkdown>{actionData.result}</ReactMarkdown>
					</div>
				)}
		</div>
	);
}
