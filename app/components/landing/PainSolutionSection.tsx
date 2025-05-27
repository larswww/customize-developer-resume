import { ResumeIcon } from "~/components/icons";
import text from "~/text";

function Icon({ label }: { label: string }) {
	return (
		<div className="w-12 h-12 bg-[var(--color-blue-100)] rounded-full flex items-center justify-center mb-3 text-[var(--color-blue-700)] text-2xl shadow">
			★
		</div>
	);
}

export default function PainSolutionSection() {
	return (
		<section className="w-full flex flex-col items-center py-16 bg-[var(--background)] relative overflow-hidden">
			<span
				className="pointer-events-none select-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10 z-0"
				aria-hidden="true"
			>
				<ResumeIcon
					size="xl"
					className="w-[320px] h-[320px] md:w-[480px] md:h-[480px]"
				/>
			</span>
			<div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-10 w-full max-w-5xl">
				<div className="flex flex-col items-center bg-[var(--card)] rounded-2xl shadow-lg p-6 border border-[var(--border)]">
					<Icon label="benefit1" />
					<span className="font-semibold text-lg mb-2 text-[var(--color-blue-900)]">
						{text.landing.benefit1}
					</span>
				</div>
				<div className="flex flex-col items-center bg-[var(--card)] rounded-2xl shadow-lg p-6 border border-[var(--border)]">
					<Icon label="benefit2" />
					<span className="font-semibold text-lg mb-2 text-[var(--color-blue-900)]">
						{text.landing.benefit2}
					</span>
				</div>
				<div className="flex flex-col items-center bg-[var(--card)] rounded-2xl shadow-lg p-6 border border-[var(--border)]">
					<Icon label="benefit3" />
					<span className="font-semibold text-lg mb-2 text-[var(--color-blue-900)]">
						{text.landing.benefit3}
					</span>
				</div>
			</div>
		</section>
	);
}
