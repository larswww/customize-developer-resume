import type React from "react";
import {
	CalendarIcon,
	EmailIcon,
	GitHubIcon,
	WhatsAppIcon,
} from "../../../components/Icons";
import type { ConsultantOnePagerData } from "../../../config/templates/consultantOnePager";
import { ArrayRenderer } from "~/components/ArrayRenderer";
import { TextWrap } from "~/components/TextWrap";

interface ConsultantOnePagerTemplateProps {
	data: ConsultantOnePagerData;
}

const ConsultantOnePagerTemplate: React.FC<ConsultantOnePagerTemplateProps> = ({
	data,
}) => {
	const {
		contactInfo,
		title,
		subtitle,
		expertise,
		highlights,
		profileText,
		companyName = "McKinsey & Company",
		language = "English",
	} = data;

	const whatsappLink = "https://wa.me/31612345678";
	const calendarLink = "https://calendly.com/yourname/meeting";
	const emailAddress = "lars@productworks.nl";
	const githubLink = "https://github.com/larsww";

	const textMap = {
		scheduleIntro: {
			English: "Schedule Intro",
			Swedish: "Boka introduktion",
			Dutch: "Introductie plannen",
		},
		disclaimer: {
			start: {
				English: "Made for ",
				Swedish: "Skapat för ",
				Dutch: "Gemaakt voor ",
			},
			middle: {
				English: " with my own application. All information is verified. ",
				Swedish:
					" med min egen applikation. All information är verifierad av mig. ",
				Dutch: " met eigen applicatie. Informatie is geverifieerd door mij. ",
			},
			end: {
				English: " open source ",
				Swedish: " open source ",
				Dutch: " open source ",
			},
		},
	};

	return (
		<div className="font-sans text-gray-800 w-full h-full flex flex-col relative overflow-hidden">
			{/* Blue background for header */}
			<header className="relative z-10 bg-[#1e3a8a] text-white p-6 pb-8">
				<div className="max-w-5xl mx-auto">
					{/* Top row with company and name */}
					<div className="flex justify-between items-center mb-8">
						<div>
							<h2 className="text-xl font-light"><TextWrap text={companyName} name="companyName" label="Company Name" /></h2>
						</div>
						<div className="text-right">
							<h1 className="text-4xl font-semibold text-white">
								<TextWrap text={contactInfo.name || "Lars Wöldern"} name="contactInfo.name" label="Name" />
							</h1>
						</div>
					</div>

					{/* Main content row */}
					<div className="flex flex-col md:flex-row justify-between items-start gap-8">
						<div className="flex-1 pr-6">
							<p className="text-xl text-blue-100 mb-6 max-w-3xl leading-relaxed text-justify">
								<TextWrap text={subtitle || "Consultant subtitle"} name="subtitle" label="Subtitle" />
							</p>

							{/* Key bullet points */}
							<ul className="space-y-4 text-blue-50 max-w-3xl">
								<ArrayRenderer
									items={highlights?.slice(0, 3) || []}
									getKey={(highlight, index) => `top-highlight-${highlight.substring(0, 10)}-${index}`}
									renderItem={(highlight, index) => (
										<li className="flex items-start">
											<span className="text-blue-300 mr-3 text-lg ml-2">•</span>
											<span className="font-light text-lg text-justify">
												<TextWrap text={highlight} name={`highlights[${index}]`} label="Highlight" />
											</span>
										</li>
									)}
								/>
							</ul>
						</div>

						{/* Profile image */}
						<div className="flex-shrink-0 mt-2">
							<img
								src={contactInfo.imageUrl || "/placeholder-profile.jpg"}
								alt={contactInfo.name || "Profile"}
								className="w-48 h-auto rounded-lg border border-white shadow-sm object-cover"
							/>
						</div>
					</div>
				</div>
			</header>

			{/* Button section outside blue area */}
			<div className="bg-white py-4 shadow-md print:py-2">
				<div className="max-w-5xl mx-auto flex flex-wrap gap-2 px-4 justify-between print:flex-nowrap">
					<a
						href={whatsappLink}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center px-3 py-2 bg-[#25D366] text-white rounded-md hover:bg-opacity-90 transition-colors text-sm print:text-xs"
					>
						<WhatsAppIcon size="sm" className="mr-1.5 print:w-4 print:h-4" />
						<TextWrap text="WhatsApp" name="whatsappLabel" label="WhatsApp Button" />
					</a>
					<a
						href={calendarLink}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center px-3 py-2 bg-[#333333] text-white rounded-md hover:bg-opacity-90 transition-colors text-sm print:text-xs"
					>
						<CalendarIcon size="sm" className="mr-1.5 print:w-4 print:h-4" />
						<TextWrap text={textMap.scheduleIntro[language]} name="scheduleIntroLabel" label="Schedule Intro Button" />
					</a>
					<a
						href={`mailto:${emailAddress}`}
						className="inline-flex items-center px-3 py-2 bg-[#0055AA] text-white rounded-md hover:bg-opacity-90 transition-colors text-sm print:text-xs"
					>
						<EmailIcon size="sm" className="mr-1.5 print:w-4 print:h-4" />
						<TextWrap text={emailAddress} name="emailAddress" label="Email Address" />
					</a>
					<a
						href={githubLink}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center px-3 py-2 bg-[#24292e] text-white rounded-md hover:bg-opacity-90 transition-colors text-sm print:text-xs"
					>
						<GitHubIcon size="sm" className="mr-1.5 print:w-4 print:h-4" />
						<TextWrap text="GitHub" name="githubLabel" label="GitHub Button" />
					</a>
				</div>
			</div>

			<main className="flex-1 bg-gray-50 p-4 relative z-10">
				<div className="max-w-5xl mx-auto">
					{/* Profile text */}
					<section className="bg-white rounded-lg p-6 shadow-sm mb-6">
						<h2 className="text-2xl font-light text-gray-800 mb-4">
							<TextWrap text={title || "Consultant Profile"} name="title" label="Profile Title" />
						</h2>
						<p className="text-base text-gray-600 leading-relaxed text-justify">
							<TextWrap text={profileText} name="profileText" label="Profile Text" />
						</p>

						{/* Expertise tags */}
						{expertise && expertise.length > 0 && (
							<div className="flex flex-wrap gap-2 mt-4">
								<ArrayRenderer
									items={expertise}
									getKey={(skill, index) => `expertise-${skill}-${index}`}
									renderItem={(skill, index) => (
										<span className="px-3 py-1 bg-blue-50 text-blue-700 rounded text-sm">
											<TextWrap text={skill} name={`expertise[${index}]`} label="Expertise" />
										</span>
									)}
								/>
							</div>
						)}
					</section>

					{/* Additional highlights - if there are more than shown in the header */}
					{highlights && highlights.length > 3 && (
						<section className="bg-white rounded-lg p-6 shadow-sm mt-4">
							<h2 className="text-2xl font-light text-gray-800 mb-4">
								<TextWrap text="Additional Highlights" name="additionalHighlightsTitle" label="Additional Highlights Title" />
							</h2>
							<ul className="space-y-2">
								<ArrayRenderer
									items={highlights.slice(3)}
									getKey={(highlight, index) => `additional-highlight-${highlight.substring(0, 10)}-${index}`}
									renderItem={(highlight, index) => (
										<li className="flex items-start">
											<span className="text-blue-500 mr-2 text-lg">•</span>
											<span className="text-gray-700">
												<TextWrap text={highlight} name={`highlights[${index + 3}]`} label="Additional Highlight" />
											</span>
										</li>
									)}
								/>
							</ul>
						</section>
					)}
				</div>
			</main>

			{/* Disclaimer footer */}
			<footer className="bg-gray-100 py-3 border-t border-gray-200">
				<div className="max-w-5xl mx-auto px-6 flex items-center justify-center">
					<TextWrap text={textMap.disclaimer.start[language]} name="disclaimerStart" label="Disclaimer Start" />
					<span className="font-medium mx-1"><TextWrap text={companyName} name="companyName" label="Company Name" /></span>
					<TextWrap text={textMap.disclaimer.middle[language]} name="disclaimerMiddle" label="Disclaimer Middle" />
					<a
						href={githubLink}
						target="_blank"
						rel="noopener noreferrer"
						className="ml-1 font-medium text-blue-600 hover:text-blue-800 transition-colors"
						style={{
							textDecoration: "underline",
							textUnderlineOffset: "2px",
						}}
					>
						<TextWrap text={textMap.disclaimer.end[language]} name="disclaimerEnd" label="Disclaimer End" />
					</a>
				</div>
			</footer>
		</div>
	);
};

export default ConsultantOnePagerTemplate;
