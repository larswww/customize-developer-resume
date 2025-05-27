import { Button } from "~/components/ui/button";
import text from "~/text";

export default function HeroSection({
	onShowPrivacy,
}: { onShowPrivacy: () => void }) {
	return (
		<section className="w-full flex justify-center bg-[var(--color-yellow-100)] py-12 md:py-20">
			<div className="flex flex-col md:flex-row items-center justify-between w-full max-w-7xl bg-[var(--background)] rounded-2xl shadow-xl px-0 md:px-0 py-0 gap-0 border border-[var(--color-yellow-200)] overflow-hidden">
				<div className="flex-1 flex flex-col items-center justify-center px-8 py-12 md:py-20 md:px-16">
					<h1 className="text-4xl md:text-5xl font-extrabold mb-3 text-center text-[var(--primary)] drop-shadow-lg leading-tight">
						{text.landing.heroHeadline}
					</h1>
					<p className="text-lg md:text-xl mb-6 text-center text-[var(--primary)] drop-shadow-lg max-w-xl">
						{text.landing.heroSub}
					</p>
					<Button
						variant="default"
						size="lg"
						className="w-full max-w-xs mb-2 bg-[var(--color-blue-700)] hover:bg-[var(--color-blue-800)] text-[var(--background)] shadow-lg"
						type="button"
					>
						{text.landing.ctaGoogle}
					</Button>
					<Button
						variant="outline"
						size="lg"
						className="w-full max-w-xs border-2 border-[var(--color-blue-700)] text-[var(--color-blue-700)] bg-[var(--background)] hover:bg-[var(--color-blue-100)] mb-4 shadow"
						type="button"
					>
						{text.landing.ctaLinkedIn}
					</Button>
					<p className="text-xs text-[var(--primary)] text-center mb-2 drop-shadow-lg">
						{text.landing.trustHook}
					</p>
					<p className="text-xs text-[var(--primary)] text-center drop-shadow-lg">
						By signing up, you agree to our{" "}
						<button
							className="underline hover:text-[var(--color-blue-400)]"
							onClick={onShowPrivacy}
							type="button"
						>
							Privacy Policy
						</button>
					</p>
				</div>
				<div className="flex-1 w-full h-full flex items-stretch">
					<div className="w-full h-full min-h-[240px] md:min-h-[400px] bg-[var(--card)] flex items-center justify-center border-l-2 border-dashed border-[var(--border)] md:rounded-none">
						<span className="text-[var(--muted-foreground)] text-lg md:text-2xl">
							[Resume Editor Screenshot Placeholder 1440×900]
						</span>
					</div>
				</div>
			</div>
		</section>
	);
}
