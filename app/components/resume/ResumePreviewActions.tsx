import React from "react";
import { DownloadIcon, PrintIcon } from "~/components/Icons";
import { Button } from "~/components/ui/Button";

interface ResumePreviewActionsProps {
  onPrint: () => void;
  onDownloadPdf: () => Promise<void>;
}

export function ResumePreviewActions({ onPrint, onDownloadPdf }: ResumePreviewActionsProps) {
  return (
    <div className="mb-6 bg-white shadow-sm p-5 rounded-lg border border-gray-200">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
        <h2 className="text-lg font-semibold text-gray-800">Generated Resume Preview</h2>
        <div className="flex gap-3">
          <Button
            type="button"
            onClick={onPrint}
            variant="primary"
            size="sm"
            className="shadow-sm flex items-center gap-2"
          >
            <PrintIcon />
            Print
          </Button>
          <Button
            type="button"
            onClick={onDownloadPdf}
            variant="primary"
            size="sm"
            className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 shadow-sm flex items-center gap-2"
          >
            <DownloadIcon />
            Download as PDF
          </Button>
        </div>
      </div>
    </div>
  );
} 