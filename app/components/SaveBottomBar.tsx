import React from 'react';
import { LoadingSpinnerIcon } from './Icons';
import { Button } from '~/components/ui/Button';

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
           <Button
              type="submit"
              form={formId}
              variant="primary"
              size="md"
              disabled={isSubmitting || !hasChanges || !isClient}
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400 dark:disabled:bg-gray-600 dark:disabled:text-gray-400"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinnerIcon />
                  {savingText}
                </>
              ) : (
                buttonText
              )}
            </Button>
        </div>
    );
} 