import React from "react";
import { DownloadIcon, PrintIcon } from "~/components/icons";
import { Button } from "~/components/ui/button";
import text from "~/text";

interface ResumePreviewActionsProps {
	onPrint: () => void;
	onDownloadPdf: () => Promise<void>;
}

export function ResumePreviewActions({
	onPrint,
	onDownloadPdf,
}: ResumePreviewActionsProps) {
	return (
		<div className="flex gap-3">
			<Button type="submit" name="actionType" value="save">
				{text.resume.saveChanges}
			</Button>
			<Button
				type="button"
				onClick={onPrint}
				variant="default"
				size="sm"
				className="shadow-sm flex items-center gap-2"
			>
				<PrintIcon />
				{text.resume.printButton}
			</Button>
			<Button
				type="button"
				onClick={onDownloadPdf}
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
