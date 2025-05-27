import text from "~/text";

export default function SocialProofSection() {
	return (
		<section className="w-full flex justify-center py-10 bg-[var(--color-yellow-100)]">
			<div className="flex flex-row gap-12 items-center grayscale opacity-80">
				<div className="w-28 h-10 md:w-40 md:h-12 bg-[var(--card)] rounded-xl flex items-center justify-center border border-[var(--border)] shadow-md">
					<span className="text-[var(--muted-foreground)] text-sm md:text-lg">
						[Logo 1]
					</span>
				</div>
				<div className="w-28 h-10 md:w-40 md:h-12 bg-[var(--card)] rounded-xl flex items-center justify-center border border-[var(--border)] shadow-md">
					<span className="text-[var(--muted-foreground)] text-sm md:text-lg">
						[Logo 2]
					</span>
				</div>
				<div className="w-28 h-10 md:w-40 md:h-12 bg-[var(--card)] rounded-xl flex items-center justify-center border border-[var(--border)] shadow-md">
					<span className="text-[var(--muted-foreground)] text-sm md:text-lg">
						[Logo 3]
					</span>
				</div>
				<span className="sr-only">{text.landing.socialProofAlt}</span>
			</div>
		</section>
	);
}
