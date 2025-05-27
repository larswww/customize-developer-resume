import { useState } from "react";
import text from "~/text";

function getInitials(name: string) {
	return name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase();
}

export default function TestimonialSection() {
	const [active, setActive] = useState(0);
	const testimonials = text.landing.testimonials;
	return (
		<section className="w-full flex flex-col items-center py-16 bg-[var(--color-yellow-100)]">
			<h2 className="text-3xl font-extrabold mb-10 tracking-tight">
				What developers say
			</h2>
			<div className="flex flex-col items-center">
				<div className="flex items-center gap-6 mb-6">
					<button
						onClick={() =>
							setActive(
								(active - 1 + testimonials.length) % testimonials.length,
							)
						}
						className="p-3 rounded-full bg-[var(--card)] shadow hover:bg-[var(--color-blue-50)] transition"
						type="button"
					>
						←
					</button>
					<div className="bg-[var(--background)] rounded-2xl shadow-xl p-8 flex flex-col items-center max-w-lg border border-[var(--border)]">
						<div className="w-14 h-14 rounded-full bg-[var(--color-blue-100)] flex items-center justify-center text-[var(--color-blue-700)] font-bold mb-3 text-xl">
							{getInitials(testimonials[active].name)}
						</div>
						<p className="text-xl text-center mb-3 font-medium text-[var(--color-blue-900)]">
							“{testimonials[active].quote}”
						</p>
						<span className="text-base text-[var(--muted-foreground)]">
							{testimonials[active].name}, {testimonials[active].role}
						</span>
					</div>
					<button
						onClick={() => setActive((active + 1) % testimonials.length)}
						className="p-3 rounded-full bg-[var(--card)] shadow hover:bg-[var(--color-blue-50)] transition"
						type="button"
					>
						→
					</button>
				</div>
			</div>
		</section>
	);
}
