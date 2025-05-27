import { useState } from "react";
import text from "~/text";

export default function FaqSection() {
	const [open, setOpen] = useState<number | null>(null);
	return (
		<section className="w-full flex flex-col items-center py-16 bg-[var(--background)]">
			<div className="bg-[var(--card)] rounded-2xl shadow-lg p-10 w-full max-w-2xl border border-[var(--border)]">
				<h2 className="text-3xl font-extrabold mb-10 tracking-tight text-center text-[var(--color-blue-900)]">
					FAQ
				</h2>
				<div className="divide-y divide-[var(--border)]">
					{text.landing.faq.map((item, i) => (
						<div key={item.q} className="py-4">
							<button
								onClick={() => setOpen(open === i ? null : i)}
								className="w-full text-left font-semibold flex justify-between items-center text-lg text-[var(--color-blue-700)] focus:outline-none"
								type="button"
							>
								{item.q}
								<span className="text-xl">{open === i ? "-" : "+"}</span>
							</button>
							{open === i && (
								<div className="pt-2 text-[var(--muted-foreground)] text-base">
									{item.a}
								</div>
							)}
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
