interface SaveBottomBarProps {
    formId: string;
    isSubmitting: boolean;
    hasChanges: boolean;
    isClient: boolean;
    buttonText?: string;
    savingText?: string;
}

export function SaveBottomBar({
    formId,
    isSubmitting,
    hasChanges,
    isClient,
    buttonText = 'Save Changes',
    savingText = 'Saving...'
}: SaveBottomBarProps) {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-50 border-t border-gray-200 p-4 flex justify-end shadow-up pr-4 sm:pr-6 dark:bg-gray-950 dark:border-gray-700">
           <button
              type="submit"
              form={formId}
              className="px-6 py-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400 dark:disabled:bg-gray-600 dark:disabled:text-gray-400 flex items-center transition-colors duration-200"
              disabled={isSubmitting || !hasChanges || !isClient}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  {savingText}
                </>
              ) : (
                buttonText
              )}
            </button>
        </div>
    );
} 