export interface RouteOutletContext {
	selectedWorkflowId: string;
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
}

export interface ResumeRouteContext extends RouteOutletContext {
	isWorkflowComplete: boolean;
}
