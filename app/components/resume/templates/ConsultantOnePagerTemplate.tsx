import type React from "react";
import {
	CalendarIcon,
	EmailIcon,
	GitHubIcon,
	WhatsAppIcon,
} from "../../../components/Icons";
import type { ConsultantOnePagerData } from "../../../config/schemas/consultantOnePager";
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
		companyName,
		language = "English",
		highlightHeadline = "Key Highlights",
		expertiseHeadline = "Areas of Expertise",
	} = data;

	const whatsappLink = "https://wa.me/message/RDGPSHJHCOZ6I1";
	const calendarLink = "https://cal.com/productworks";
	const emailAddress = "lars@productworks.nl";
	const githubLink = "https://github.com/larswww/customize-developer-resume";

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
			end: "[Open Source]",
		},
	};

	// Function to create a drop cap for the profile text
	const renderProfileText = () => {
		if (!profileText || typeof profileText !== "string") return null;
		
		return (
			<p className="text-lg text-gray-700 leading-relaxed mb-6 mx-4">
				<span className="float-left text-4xl font-semibold mr-2 mt-1">{profileText.charAt(0)}</span>
				<TextWrap text={profileText.substring(1)} name="profileText" label="Profile Text" />
			</p>
		);
	};

	return (
		<div className="font-serif text-gray-800 w-full h-full flex flex-col relative overflow-hidden">
			<input type="hidden" name="language" value={language} />
			{/* Header with just company name and personal name */}
			<header className="bg-[#1e3a8a] text-white py-5">
				<div className="max-w-4xl mx-auto px-6 flex justify-between items-center">
					<h2 className="text-xl font-light tracking-wide">
						<TextWrap text={companyName} name="companyName" label="Company Name" />
					</h2>
					<h1 className="text-2xl font-semibold tracking-wide">
						<TextWrap text={contactInfo.name || "Lars Wöldern"} name="contactInfo.name" label="Name" />
					</h1>
				</div>
			</header>

			<main className="flex-1 bg-white">
				{/* Content area */}
				<div className="max-w-4xl mx-auto px-6 py-8">
					{/* Profile section with image and subtitle */}
					<div className="flex flex-row gap-8 mb-12">
						<div className="flex-1">
							<h2 className="text-3xl font-normal text-gray-700 mb-5">
								<TextWrap text={title || "Senior Frontend Developer & Digital Product Consultant"} name="title" label="Profile Title" />
							</h2>
							<p className="text-xl text-gray-600 mb-7 leading-relaxed">
								<TextWrap text={subtitle || "Consultant subtitle"} name="subtitle" label="Subtitle" />
							</p>
							
							{/* Highlight section headline */}
							<h3 className="text-lg font-medium text-gray-700 mb-3">
								<TextWrap text={highlightHeadline} name="highlightHeadline" label="Highlight Headline" />
							</h3>
							
							{/* Key bullet points */}
							<ul className="space-y-4 mb-6">
								<ArrayRenderer
									items={highlights?.slice(0, 3) || []}
									getKey={(highlight, index) => `top-highlight-${highlight.substring(0, 10)}-${index}`}
									renderItem={(highlight, index) => (
										<li className="flex items-start">
											<span className="text-blue-700 mr-3 text-xl">•</span>
											<span className="text-lg text-gray-700">
												<TextWrap text={highlight} name={`highlights[${index}]`} label="Highlight" />
											</span>
										</li>
									)}
								/>
							</ul>
						</div>

						{/* Profile image */}
						<div className="flex-shrink-0">
							<img
								src={contactInfo.imageUrl || "https://productworks.nl/image/lars_2.jpg?height=1096&width=625&format=webp&fit=cover"}
								alt={contactInfo.name || "Profile"}
								className="w-48 h-auto rounded-lg border border-white shadow-sm object-cover"
							/>
						</div>
					</div>

					{/* Main content */}
					<section className="mb-12">
						{renderProfileText()}

						{/* Expertise tags */}
						{expertise && expertise.length > 0 && (
							<div className="mx-4">
								{/* Expertise headline */}
								<h3 className="text-lg font-medium text-gray-700 mb-3">
									<TextWrap text={expertiseHeadline} name="expertiseHeadline" label="Expertise Headline" />
								</h3>
								
								<div className="flex flex-wrap gap-2 mb-10">
									<ArrayRenderer
										items={expertise}
										getKey={(skill, index) => `expertise-${skill}-${index}`}
										renderItem={(skill, index) => (
											<span className="px-3 py-1 bg-blue-50 text-blue-700 rounded text-sm border border-blue-100">
												<TextWrap text={skill} name={`expertise[${index}]`} label="Expertise" />
											</span>
										)}
									/>
								</div>
							</div>
						)}
					</section>

					{/* Main content ends here - Additional highlights section removed */}
				</div>
			</main>

			{/* Contact links - moved to be just above footer */}
			<div className="bg-white pt-6 pb-4 border-t border-gray-200">
				<div className="max-w-4xl mx-auto flex justify-center flex-wrap gap-6 px-6">
					<a
						href={whatsappLink}
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center text-gray-700 hover:text-blue-700 transition-colors text-sm"
					>
						<WhatsAppIcon size="sm" className="mr-1.5" />
						<TextWrap text="WhatsApp" name="whatsappLabel" label="WhatsApp Button" />
					</a>
					<a
						href={calendarLink}
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center text-gray-700 hover:text-blue-700 transition-colors text-sm"
					>
						<CalendarIcon size="sm" className="mr-1.5" />
						<TextWrap text={textMap.scheduleIntro[language]} name="scheduleIntroLabel" label="Schedule Intro Button" />
					</a>
					<a
						href={`mailto:${emailAddress}`}
						className="flex items-center text-gray-700 hover:text-blue-700 transition-colors text-sm"
					>
						<EmailIcon size="sm" className="mr-1.5" />
						<TextWrap text={emailAddress} name="emailAddress" label="Email Address" />
					</a>
					<a
						href={githubLink}
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center text-gray-700 hover:text-blue-700 transition-colors text-sm"
					>
						<GitHubIcon size="sm" className="mr-1.5" />
						<TextWrap text="GitHub" name="githubLabel" label="GitHub Button" />
					</a>
				</div>
			</div>

			{/* Disclaimer footer */}
			<footer className="bg-gray-50 py-3 border-t border-gray-200">
				<div className="max-w-4xl mx-auto px-6 text-center text-gray-600 text-sm">
					<TextWrap text={textMap.disclaimer.start[language]} name="disclaimerStart" label="Disclaimer Start" />
					<span className="font-bold">
						<TextWrap text={companyName} name="companyNameSecond" label="Company Name" />
					</span>
					<TextWrap text={textMap.disclaimer.middle[language]} name="disclaimerMiddle" label="Disclaimer Middle" />
					<a
						href={githubLink}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-block font-medium text-blue-600 hover:text-blue-800 transition-colors"
						style={{
							textDecoration: "underline",
							textUnderlineOffset: "2px",
						}}
					>
						<TextWrap text={textMap.disclaimer.end} name="disclaimerEnd" label="Disclaimer End" />
					</a>
				</div>
			</footer>
		</div>
	);
};

export default ConsultantOnePagerTemplate;
