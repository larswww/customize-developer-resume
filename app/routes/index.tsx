import { useState } from "react";
import FaqSection from "~/components/landing/FaqSection";
import FeatureDeepDiveSection from "~/components/landing/FeatureDeepDiveSection";
import FooterSection from "~/components/landing/FooterSection";
import HeroSection from "~/components/landing/HeroSection";
import HowItWorksSection from "~/components/landing/HowItWorksSection";
import PainSolutionSection from "~/components/landing/PainSolutionSection";
import SecondaryCtaSection from "~/components/landing/SecondaryCtaSection";
import SocialProofSection from "~/components/landing/SocialProofSection";
import TestimonialSection from "~/components/landing/TestimonialSection";
import { Button } from "~/components/ui/button";
import text from "~/text";

export function meta() {
	return [
		{ title: "AI Resume Builder for Developers | Resume Landing" },
		{
			name: "description",
			content:
				"Generate a developer-ready resume in 5 mins. Free first PDF. Import LinkedIn, let AI do the writing.",
		},
	];
}

export default function Index() {
	const [showPrivacy, setShowPrivacy] = useState(false);

	return (
		<div className="flex flex-col min-h-screen bg-[var(--background)]">
			<HeroSection onShowPrivacy={() => setShowPrivacy(true)} />
			<SocialProofSection />
			<PainSolutionSection />
			<HowItWorksSection />
			<FeatureDeepDiveSection />
			<TestimonialSection />
			<FaqSection />
			<SecondaryCtaSection />
			<FooterSection onShowPrivacy={() => setShowPrivacy(true)} />

			{showPrivacy && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
					<div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
						<h2 className="text-xl font-bold mb-2">Privacy Policy</h2>
						<p className="text-sm text-gray-700 mb-4">
							{text.landing.privacyPolicy}
						</p>
						<Button
							variant="default"
							size="sm"
							className="absolute top-2 right-2"
							onClick={() => setShowPrivacy(false)}
							type="button"
						>
							Close
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
