import { useState } from "react";
import text from "~/text";

export default function FeatureDeepDiveSection() {
	const [active, setActive] = useState(0);
	const features = text.landing.features;
	return (
		<section className="w-full flex flex-col items-center py-16 bg-[var(--background)]">
			<h2 className="text-3xl font-extrabold mb-10 tracking-tight">Features</h2>
			<div className="flex gap-4 mb-8">
				{features.map((f, i) => (
					<button
						key={f.tab}
						className={`px-5 py-2 rounded-full font-semibold transition-colors duration-150 ${active === i ? "bg-[var(--color-blue-700)] text-[var(--background)] shadow" : "bg-[var(--card)] text-[var(--color-blue-700)] border border-[var(--color-blue-200)]"}`}
						onClick={() => setActive(i)}
						type="button"
					>
						{f.tab}
					</button>
				))}
			</div>
			<div className="flex flex-col md:flex-row gap-10 items-center w-full max-w-5xl">
				<ul className="list-disc list-inside text-left text-lg mb-6 md:mb-0 md:w-1/2">
					{features[active].bullets.map((b) => (
						<li key={b} className="mb-2 text-[var(--color-blue-700)]">
							{b}
						</li>
					))}
				</ul>
				<div className="w-[300px] h-[200px] md:w-[400px] md:h-[266px] lg:w-[600px] lg:h-[400px] bg-[var(--card)] rounded-2xl flex items-center justify-center border-2 border-dashed border-[var(--border)] shadow-xl md:w-1/2">
					<span className="text-[var(--muted-foreground)] text-base md:text-lg">
						[Feature Screenshot 600×400]
					</span>
				</div>
			</div>
		</section>
	);
}
