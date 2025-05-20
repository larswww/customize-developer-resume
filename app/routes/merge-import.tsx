import { SETTINGS_KEYS } from "~/config/constants";
import { ExperienceSchema } from "~/config/schemas/sharedTypes";
import { parseGenerate } from "~/services/ai/resumeStructuredDataService";
import dbService from "~/services/db/dbService.server";

export async function loader({
	request,
}: { request: Request }): Promise<Response> {
	const url = new URL(request.url);
	const jobIdParam = url.searchParams.get("jobId");
	const templateIdParam = url.searchParams.get("templateId");
	if (!jobIdParam) {
		return new Response("Missing jobId", { status: 400 });
	}
	const jobId = Number(jobIdParam);
	if (Number.isNaN(jobId)) {
		return new Response("Invalid jobId", { status: 400 });
	}
	if (!templateIdParam) {
		return new Response("Missing templateId", { status: 400 });
	}

	const resume = dbService.getResume(jobId, templateIdParam);
	if (!resume || !resume.structuredData) {
		return new Response("Resume not found or missing structured data", {
			status: 404,
		});
	}

	const currentExperienceSetting = dbService.getSetting(
		SETTINGS_KEYS.EXPERIENCE,
	);
	const currentExperience = currentExperienceSetting?.structuredData ?? null;

	const systemPrompt = `
    You are a helpful assistant that will help me merge my work experience with my resume.
    I will provide you with my work experience and my resume.
    You will then merge the work experience with the resume and return the merged data.

    THIS IS THE CURRENT EXPERIENCE:
    ${currentExperience}
    `;

	const aiExperience = await parseGenerate(
		JSON.stringify(resume.structuredData),
		ExperienceSchema,
		{
			systemPrompt,
			model: "gpt-4o-mini",
		},
	);

	// Save merged experience to settings
	dbService.saveSetting({
		key: SETTINGS_KEYS.EXPERIENCE,
		structuredData: aiExperience,
		value: null,
	});

	return new Response(JSON.stringify(aiExperience), {
		headers: { "Content-Type": "application/json" },
	});
}
