import React from "react";
import { DownloadIcon, PrintIcon } from "~/components/Icons";
import { Button } from "~/components/ui/Button";
import text from "~/text";

interface ResumePreviewActionsProps {
  onPrint: () => void;
  onDownloadPdf: () => Promise<void>;
}

export function ResumePreviewActions({ onPrint, onDownloadPdf }: ResumePreviewActionsProps) {
  return (

        <div className="flex gap-3">
          <Button
            type="button"
            onClick={onPrint}
            variant="primary"
            size="sm"
            className="shadow-sm flex items-center gap-2"
          >
            <PrintIcon />
            {text.resume.printButton}
          </Button>
          <Button
            type="button"
            onClick={onDownloadPdf}
            variant="primary"
            size="sm"
            className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 shadow-sm flex items-center gap-2"
          >
            <DownloadIcon />
            {text.resume.downloadButton}
          </Button>
        </div>
  );
} 