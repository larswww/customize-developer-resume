import type { TemplateStatus } from "./templateStatus";

export interface RouteOutletContext {
	selectedTemplateId: string;
	isWorkflowComplete: boolean;
	currentWorkflowSteps?: any[];
	templateDescription?: string;
	workflowStepsData?: any[];
	job?: {
		id: number;
		title: string;
		jobDescription: string;
		relevantDescription?: string;
	};
	error?: string;
	templateStatuses?: TemplateStatus[];
}

export interface ResumeRouteContext extends RouteOutletContext {
	isWorkflowComplete: boolean;
}
