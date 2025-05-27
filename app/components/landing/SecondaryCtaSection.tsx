import { Button } from "~/components/ui/button";
import text from "~/text";

export default function SecondaryCtaSection() {
	return (
		<section className="w-full flex flex-col items-center py-16 bg-[var(--color-yellow-100)]">
			<div className="bg-[var(--card)] rounded-2xl shadow-lg p-10 flex flex-col items-center w-full max-w-xl border border-[var(--border)]">
				<h2 className="text-2xl md:text-3xl font-extrabold mb-6 text-center text-[var(--color-blue-900)]">
					{text.landing.secondaryCta}
				</h2>
				<Button
					variant="default"
					size="lg"
					className="w-full max-w-xs bg-[var(--color-blue-700)] hover:bg-[var(--color-blue-800)] text-[var(--background)] shadow-lg"
					type="button"
				>
					{text.landing.ctaGoogle}
				</Button>
			</div>
		</section>
	);
}
