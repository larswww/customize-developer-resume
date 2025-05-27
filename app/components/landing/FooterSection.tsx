import { Button } from "~/components/ui/button";

export default function FooterSection({
	onShowPrivacy,
}: { onShowPrivacy: () => void }) {
	return (
		<footer className="w-full py-6 bg-[var(--color-yellow-50)] flex flex-col md:flex-row items-center justify-center gap-4 text-[var(--muted-foreground)] text-sm mt-auto">
			<button
				className="underline hover:text-[var(--color-blue-700)]"
				onClick={onShowPrivacy}
				type="button"
			>
				Privacy Policy
			</button>
			<span>|</span>
			<a href="/terms" className="underline hover:text-[var(--color-blue-700)]">
				Terms
			</a>
			<span>|</span>
			<a
				href="mailto:support@resume.dev"
				className="underline hover:text-[var(--color-blue-700)]"
			>
				Contact
			</a>
		</footer>
	);
}
