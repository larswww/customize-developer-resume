import type { WorkflowStep } from "../services/ai/types";
import {
	createJsonTransform,
	createMarkdownTransform,
	textTransform,
} from "../utils/workflowUtils";

// Define interfaces for our intermediate results to improve type safety
interface JobAnalysis {
	jobTitle: string;
	responsibilities: string[];
	requiredSkills: string[];
	preferredSkills: string[];
	requiredExperience: string[];
	companyInfo: string;
	roleType: string;
}

interface ResumeData {
	professionalSummary: string;
	workExperience: Array<{
		company: string;
		position: string;
		startDate: string;
		endDate: string;
		isContract: boolean;
		achievements: string[];
		technologies: string[];
	}>;
	education: Array<{
		institution: string;
		degree: string;
		field: string;
		startDate: string;
		endDate: string;
	}>;
	skills: {
		technical: string[];
		soft: string[];
	};
	projects: Array<{
		name: string;
		description: string;
		technologies: string[];
		url?: string;
	}>;
	certifications: Array<{
		name: string;
		issuer: string;
		date: string;
		expires?: string;
	}>;
}

interface RelevanceMatches {
	skillMatches: Array<{
		requiredSkill: string;
		relevantExperiences: Array<{
			company: string;
			position: string;
			achievement: string;
			impact: string;
		}>;
		matchStrength: string;
	}>;
	responsibilityMatches: Array<{
		responsibility: string;
		relevantExperiences: Array<{
			company: string;
			position: string;
			achievement: string;
			impact: string;
		}>;
		matchStrength: string;
	}>;
	keywordMatches: {
		matched: string[];
		missing: string[];
	};
	prioritizedExperiences: number[];
}

export const workflowSteps: WorkflowStep[] = [
	{
		id: "job-description-analysis",
		provider: "anthropic",
		options: {
			systemPrompt:
				"You are an expert resume writer with 15 years of experience in aligning resumes to job descriptions. You speak in a professional, concise manner and excel at identifying key requirements from job postings.",
			temperature: 0.3,
		},
		prompt: (
			context,
		) => `Extract the key details from the following job description and format them in a clear, organized manner.

Job Description:
${context.jobDescription}

Provide your response in the following Markdown format:

# Job Analysis

## Job Title
[Extracted job title here]

## Responsibilities
- [Responsibility 1]
- [Responsibility 2]
- etc.

## Required Skills
- [Skill 1]
- [Skill 2]
- etc.

## Preferred Skills
- [Skill 1]
- [Skill 2]
- etc.

## Required Experience
- [Experience 1]
- [Experience 2]
- etc.

## Company Info
[Brief company information]

## Role Type
[Contract/Freelance or Permanent]

Focus only on the qualifications, skills, and experience directly relevant to the role. For Required Skills, include specific programming languages, frameworks, technologies, and methodologies.`,
		transform: createMarkdownTransform(
			"job-description-analysis",
			"jobAnalysis",
		),
	},
	{
		id: "resume-parsing",
		provider: "anthropic",
		options: {
			systemPrompt:
				"You are a resume analysis expert who can accurately parse resume content into structured data. You preserve all details without summarizing or omitting information.",
			temperature: 0.2,
		},
		prompt: (
			context,
		) => `Parse the following work history into a structured format. Preserve all details and do not summarize or omit any information.

Work History:
${context.workHistory}

Provide your response in the following Markdown format:

# Resume Analysis

## Professional Summary
[Extract or create a brief professional summary]

## Work Experience
### [Company Name 1] | [Position] | [Start Date] - [End Date]
- [Achievement 1]
- [Achievement 2]
- etc.
**Technologies used:** [List of technologies]

### [Company Name 2] | [Position] | [Start Date] - [End Date]
- [Achievement 1]
- [Achievement 2]
- etc.
**Technologies used:** [List of technologies]

## Education
- [Degree] in [Field], [Institution], [Year]
- etc.

## Skills
### Technical Skills
- [Skill 1]
- [Skill 2]
- etc.

### Soft Skills
- [Skill 1]
- [Skill 2]
- etc.

## Projects
### [Project Name 1]
[Brief description]
**Technologies used:** [List of technologies]

## Certifications
- [Certification Name], [Issuer], [Date]
- etc.

For each work experience entry, extract specific achievements, impact metrics, and technologies used. For achievements, include quantifiable results where available (e.g., "improved performance by 40%").`,
		transform: createMarkdownTransform("resume-parsing", "resumeData"),
	},
	{
		id: "relevance-matching",
		provider: "openai",
		options: {
			systemPrompt:
				"You are a semantic matching expert who can identify the strongest connections between job requirements and a candidate's experience. You focus on finding concrete evidence of the candidate's ability to fulfill job requirements.",
			temperature: 0.4,
		},
		prompt: (
			context,
		) => `Identify the strongest matches between the job requirements and the candidate's experience.

Job Analysis:
${context.intermediateResults.jobAnalysis}

Candidate Resume Data:
${context.intermediateResults.resumeData}

For each required skill and responsibility in the job description, find the most relevant experiences, projects, or achievements from the candidate's resume that demonstrate competence in that area.

Format your response as Markdown with the following structure:

# Relevance Matching

## Skill Matches

### [Required Skill 1]
**Relevant Experience**: [Description of relevant experience]
**Impact**: [Impact or achievement related to skill]
**Match Strength**: [High/Medium/Low]

### [Required Skill 2]
**Relevant Experience**: [Description of relevant experience]
**Impact**: [Impact or achievement related to skill]
**Match Strength**: [High/Medium/Low]

## Responsibility Matches

### [Responsibility 1]
**Relevant Experience**: [Description of relevant experience]
**Impact**: [Impact or achievement related to responsibility]
**Match Strength**: [High/Medium/Low]

### [Responsibility 2]
**Relevant Experience**: [Description of relevant experience]
**Impact**: [Impact or achievement related to responsibility]
**Match Strength**: [High/Medium/Low]

## Keyword Analysis
**Matched Keywords**: [Comma-separated list of keywords found in both job description and resume]
**Missing Keywords**: [Comma-separated list of important keywords in job description not found in resume]

## Prioritized Experiences
1. [Company & Position most relevant to job]
2. [Second most relevant experience]
3. [Third most relevant experience]

Only include experiences that are explicitly mentioned in the candidate's resume. Do not invent or assume additional experience. If there is no match for a required skill, indicate this with "No direct match found in resume."`,
		transform: createMarkdownTransform(
			"relevance-matching",
			"relevanceMatches",
		),
	},
	{
		id: "professional-summary",
		provider: "anthropic",
		options: {
			systemPrompt:
				"You are a professional resume writer who crafts compelling, concise professional summaries that highlight a candidate's most relevant qualifications for specific job opportunities.",
			temperature: 0.5,
		},
		prompt: (context) => {
			// Extract role type from job analysis Markdown (if possible)
			const jobAnalysis =
				(context.intermediateResults.jobAnalysis as string) || "";
			const roleTypeMatch = jobAnalysis.match(/## Role Type\s*\n([^\n#]+)/);
			const roleType = roleTypeMatch
				? roleTypeMatch[1].trim().toLowerCase().includes("contract")
					? "contract"
					: "permanent"
				: "permanent";

			return `Create a compelling professional summary for the candidate based on their matched experiences and the job requirements.

Job Analysis:
${context.intermediateResults.jobAnalysis}

Relevance Matches:
${context.intermediateResults.relevanceMatches}

Write a concise professional summary (2-3 sentences) that:
1. Highlights the candidate's most relevant experience for this specific role
2. Mentions their expertise with the top required technologies/skills
3. Includes their most impressive quantifiable achievement that aligns with the job
4. Briefly references their experience with ${roleType === "contract" ? "contract/freelance work" : "relevant work"}

Use a confident, direct tone with active voice. Avoid generic claims and focus on specific, verifiable qualifications. The summary should be written in implied first-person (no "I" statements).

Return ONLY the professional summary text without any additional explanation.`;
		},
		transform: textTransform,
	},
	{
		id: "work-experience-rewrite",
		provider: "anthropic",
		options: {
			systemPrompt:
				"You are an expert resume editor who tailors work experience descriptions to highlight relevance to specific job requirements. You use concise, impactful language with action verbs and quantifiable achievements.",
			temperature: 0.4,
		},
		prompt: (
			context,
		) => `Rewrite the candidate's work experience section to highlight relevance to the job requirements.

Job Analysis:
${context.intermediateResults.jobAnalysis}

Resume Data:
${context.intermediateResults.resumeData}

Relevance Matches:
${context.intermediateResults.relevanceMatches}

Format your response in Markdown with the following structure:

# Work Experience

## [Company Name 1] | [Position] | [Start Date] - [End Date]
- [Achievement 1 rewritten to emphasize relevance]
- [Achievement 2 rewritten to emphasize relevance]
- [Achievement 3 rewritten to emphasize relevance]
**Technologies:** [Relevant technologies]

## [Company Name 2] | [Position] | [Start Date] - [End Date]
- [Achievement 1 rewritten to emphasize relevance]
- [Achievement 2 rewritten to emphasize relevance]
**Technologies:** [Relevant technologies]

Guidelines for rewriting:
1. Prioritize experiences identified as most relevant in the Relevance Matches
2. Retain the company name, position, and dates from the original resume
3. Rewrite the achievements to emphasize skills and experiences most relevant to the job requirements
4. Emphasize achievements with quantifiable results
5. Use active voice with strong action verbs (developed, implemented, led, etc.)
6. Include relevant technologies that match job requirements
7. Limit each position to 3-5 bullet points maximum
8. For older or less relevant positions, include only 1-2 bullets or a brief summary
9. If the job is a contract/freelance position, clearly mark any past contract work as "(Contract)" in the title

Important: Use only information that exists in the original resume. Do not invent new achievements or exaggerate existing ones. Focus on quality over quantity - each bullet should provide specific, relevant information.`,
		transform: createMarkdownTransform(
			"work-experience-rewrite",
			"tailoredWorkExperience",
		),
	},
	{
		id: "skills-section-rewrite",
		provider: "openai",
		options: {
			systemPrompt:
				"You are a resume skills section specialist who highlights the most relevant skills for specific job opportunities while maintaining honesty about the candidate's actual capabilities.",
			temperature: 0.3,
		},
		prompt: (
			context,
		) => `Create a targeted skills section based on the candidate's skills and the job requirements.

Job Analysis:
${context.intermediateResults.jobAnalysis}

Resume Data:
${context.intermediateResults.resumeData}

Relevance Matches:
${context.intermediateResults.relevanceMatches}

Format your response using Markdown with the following structure:

# Skills

## [Category Name 1]
- [Skill 1]
- [Skill 2]
- [Skill 3]

## [Category Name 2]
- [Skill 1]
- [Skill 2]
- [Skill 3]

Guidelines for creating the skills section:
1. Prioritize skills that directly match job requirements
2. Group skills by logical categories (e.g., Programming Languages, Frameworks, Tools, Soft Skills)
3. List the most important/relevant skills first within each category
4. Exclude skills that are completely irrelevant to this job
5. Keep the format concise - no lengthy descriptions of each skill

Important: Only include skills that are actually present in the candidate's original resume. Do not add skills that aren't in the original data, even if they're mentioned in the job description.`,
		transform: createMarkdownTransform(
			"skills-section-rewrite",
			"tailoredSkills",
		),
	},
	{
		id: "final-resume-assembly",
		provider: "anthropic",
		options: {
			systemPrompt:
				"You are a professional resume formatter who creates concise, impactful resumes tailored to specific job opportunities. You focus on clarity, readability, and highlighting the most relevant qualifications.",
			temperature: 0.4,
		},
		prompt: (
			context,
		) => `Assemble a complete, tailored resume in markdown format based on the following components:

Professional Summary:
${context.intermediateResults.professionalSummary}

Tailored Work Experience:
${context.intermediateResults.tailoredWorkExperience}

Tailored Skills:
${context.intermediateResults.tailoredSkills}

Original Resume Data:
${context.intermediateResults.resumeData}

Job Analysis:
${context.intermediateResults.jobAnalysis}

Create a complete resume using proper Markdown formatting. The resume should:
1. Begin with the candidate's name as a heading (extract from original resume)
2. Include the professional summary directly below
3. Present work experience with clean formatting (company, position, dates clearly displayed)
4. Organize skills in a clear, scannable format
5. Include education, certifications, and other relevant sections from the original resume
6. Use markdown formatting for clean presentation
7. Maintain a consistent tone throughout
8. Be concise enough to fit within 2 pages
9. Use action verbs and concrete achievements throughout

Important formatting guidelines:
- Use clear hierarchical headings (# for name, ## for sections, ### for subsections)
- Use bullet points for achievements and skills
- Keep design simple and professional
- Ensure consistency in date formats and punctuation
- For freelance/contract roles, clearly indicate "(Contract)" in position titles if applicable

Return ONLY the markdown resume without any additional explanation.`,
		transform: textTransform,
	},
];
