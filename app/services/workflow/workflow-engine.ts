import type { WorkflowStep } from "../../config/workflow";

type ApiKeys = {
	anthropic: string;
	openai: string;
	gemini?: string;
};

export interface WorkflowContext {
	[key: string]: unknown;
}

/**
 * WorkflowEngine - Handles the execution of workflow steps
 */
export class WorkflowEngine {
	private apiKeys: ApiKeys;
	private steps: WorkflowStep[];

	constructor(apiKeys: ApiKeys, steps: WorkflowStep[]) {
		this.apiKeys = apiKeys;
		this.steps = steps;
	}

	/**
	 * Execute all workflow steps in sequence
	 */
	async execute(initialContext: WorkflowContext): Promise<WorkflowContext> {
		let context: WorkflowContext = { ...initialContext };

		// Execute each step in order
		for (const step of this.steps) {
			try {
				const result = await this.executeStep(step, context);
				// Add result to context with step ID as key
				context[step.id] = result;
			} catch (error) {
				console.error(`Error executing step ${step.id}:`, error);
				throw error;
			}
		}

		return context;
	}

	/**
	 * Creates a list of promises for each step that can be executed independently
	 */
	createCustomStepPromises(initialContext: WorkflowContext): Array<() => Promise<unknown>> {
		const context: WorkflowContext = { ...initialContext };
		const stepPromises: Array<() => Promise<unknown>> = [];

		// For each step, create a promise factory function
		this.steps.forEach((step, index) => {
			// Create a function that when called, will execute the step
			const promise = async () => {
				// Wait for all previous steps to complete
				if (index > 0) {
					for (let i = 0; i < index; i++) {
						context[this.steps[i].id] = await stepPromises[i]();
					}
				}

				// Now execute this step with the updated context
				return this.executeStep(step, context);
			};

			stepPromises.push(promise);
		});

		return stepPromises;
	}

	/**
	 * Executes a single workflow step
	 */
	private async executeStep(step: WorkflowStep, context: WorkflowContext): Promise<string> {
		// Currently using a mock implementation for development
		// In production, this would call the appropriate AI service
		console.log(`Executing step: ${step.id}`);
		
		// Simple mock implementation - in a real app, we'd call an AI service here
		return this.mockStepExecution(step, context);
	}

	/**
	 * Mock implementation for step execution during development
	 */
	private mockStepExecution(step: WorkflowStep, context: WorkflowContext): string {
		// Replace placeholders in the userPrompt with context values
		let userPrompt = step.userPrompt;
		
		// Find all placeholders in the format {{key}}
		const placeholders = userPrompt.match(/{{([^}]+)}}/g) || [];
		
		// Replace each placeholder with its value from the context
		placeholders.forEach(placeholder => {
			const key = placeholder.replace('{{', '').replace('}}', '');
			const value = context[key];
			if (value !== undefined) {
				userPrompt = userPrompt.replace(placeholder, String(value));
			}
		});
		
		// Mock responses for different steps
		switch (step.id) {
			case "job-description-analysis":
				return "The job requires expertise in NextJS, React, and TypeScript. Key responsibilities include developing frontend components, implementing responsive UIs, and collaborating with backend teams.";
			
			case "extract-experience":
				return "Your most relevant experiences include:\n- Senior Software Engineer at Krew working with NextJS\n- Frontend Developer at NoLemons using NextJS and Drupal\n- Your geospatial analysis project using React";
			
			case "craft-resume":
				return "# LARS WOLDERN\n\n## PROFESSIONAL SUMMARY\nSenior Software Engineer with expertise in NextJS, React, and TypeScript, focusing on building responsive and performant web applications. Proven track record of taking ownership of complex projects and delivering successful outcomes.\n\n## RELEVANT EXPERIENCE\n\n**Senior Software Engineer - Krew (2023-Present)**\n- Took over a complex Nextjs codebase from the departing CTO; deployed new features to production within the first week\n- Translated detailed Figma prototypes into functional products\n\n**Frontend Developer - NoLemons (2021-2023)**\n- Assumed ownership of a legacy full-stack Nextjs and Drupal application\n- Stabilized code, improved responsiveness, and created enhancement backlog\n\n## SKILLS\n- **Frontend**: TypeScript, React, NextJS, Responsive Design\n- **Backend**: Python, FastAPI, Redis, PostgreSQL\n- **Tools**: Git, Docker, AWS";
			
			case "background-info":
				return "The company appears to be a technology startup focusing on web application development using modern JavaScript frameworks. They value expertise in NextJS and React, suggesting they likely have customer-facing web products requiring responsive design.";
			
			case "5-qualities-and-5-expertise":
				return "## Key Qualities\n1. Adaptability - Quickly taking over and understanding complex codebases\n2. Problem-solving - Identifying issues and implementing effective solutions\n3. Ownership - Taking responsibility for project success\n4. Collaboration - Working effectively with cross-functional teams\n5. Technical leadership - Guiding technical decisions and mentoring others\n\n## Areas of Expertise\n1. NextJS/React Development\n2. TypeScript\n3. Responsive UI Design\n4. Full-stack Integration\n5. Performance Optimization";
			
			case "write-cover-letter":
				return "Dear Hiring Manager,\n\nI am excited to apply for the Senior Frontend Developer position at your company. With extensive experience in NextJS, React, and TypeScript, I have successfully delivered numerous web applications from concept to production.\n\nMost recently at Krew, I took over a complex NextJS codebase and deployed new features within my first week, demonstrating my ability to quickly understand and contribute to established projects. Previously at NoLemons, I stabilized a legacy application while improving its responsiveness and creating a roadmap for future enhancements.\n\nI am particularly interested in joining your team because of your focus on innovative web solutions and your commitment to quality user experiences. I believe my technical expertise and collaborative approach would make me a valuable addition to your organization.\n\nThank you for considering my application. I look forward to discussing how my skills and experience align with your needs.\n\nSincerely,\nLars Woldern";
			
			default:
				return `Mock response for step: ${step.id}`;
		}
	}
}
