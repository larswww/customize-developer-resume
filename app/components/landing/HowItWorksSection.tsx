import text from "~/text";

export default function HowItWorksSection() {
	return (
		<section className="w-full flex flex-col items-center py-16 bg-[var(--color-yellow-100)]">
			<h2 className="text-3xl font-extrabold mb-10 tracking-tight">
				How it works
			</h2>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full max-w-6xl">
				{text.landing.howItWorks.map((step, i) => (
					<div
						key={step.step}
						className="flex flex-col items-center bg-[var(--card)] rounded-2xl shadow-lg p-6 border border-[var(--border)]"
					>
						<span className="font-bold text-lg mb-2 text-[var(--color-blue-700)]">
							{step.step}
						</span>
						<span className="text-[var(--muted-foreground)] text-base text-center mb-4">
							{step.desc}
						</span>
						<div className="w-[260px] h-[160px] md:w-[320px] md:h-[200px] lg:w-[400px] lg:h-[266px] bg-[var(--background)] rounded-xl flex items-center justify-center border-2 border-dashed border-[var(--border)] mt-2">
							<span className="text-[var(--muted-foreground)] text-xs md:text-base">
								[Step {i + 1} Screenshot 600×400]
							</span>
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
