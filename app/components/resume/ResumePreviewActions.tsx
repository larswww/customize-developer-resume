import { SaveIcon } from "lucide-react";
import { useCallback } from "react";
import { DownloadIcon, PrintIcon } from "~/components/icons";
import { Button } from "~/components/ui/button";
import text from "~/text";
import { downloadResumeAsPdf } from "~/utils/pdf.client";
import { printResumeElement } from "~/utils/print.client";

export function ResumePreviewActions() {
	const handlePrintClick = useCallback(() => {
		printResumeElement("printable-resume", console.error);
	}, []);

	const handleDownloadPdfClick = async () => {
		await downloadResumeAsPdf({
			elementId: "printable-resume",
			onError: console.error,
		});
	};
	return (
		<div className="flex gap-3">
			<Button
				type="submit"
				name="actionType"
				value="save"
				variant="default"
				size="sm"
				form={"resume-form"}
			>
				<SaveIcon />
				{text.resume.saveChanges}
			</Button>
			<Button
				type="button"
				onClick={handlePrintClick}
				variant="default"
				size="sm"
				className="shadow-sm flex items-center gap-2"
			>
				<PrintIcon />
				{text.resume.printButton}
			</Button>
			<Button
				type="button"
				onClick={handleDownloadPdfClick}
				variant="default"
				size="sm"
				className="shadow-sm flex items-center gap-2"
			>
				<DownloadIcon />
				{text.resume.downloadButton}
			</Button>
		</div>
	);
}
