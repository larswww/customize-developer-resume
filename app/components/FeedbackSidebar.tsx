import { FeedbackMessage } from './FeedbackMessage';

interface FeedbackSidebarProps {
    isLoading: boolean;
    actionData: { success?: boolean; message?: string; error?: string } | undefined;
}

export function FeedbackSidebar({ isLoading, actionData }: FeedbackSidebarProps) {
    return (
        <div className="w-full bg-gray-100 p-4 border-l border-gray-200 dark:bg-gray-800 dark:border-gray-700 h-full">
            {isLoading && (
                <FeedbackMessage type="info">
                  Loading saved content...
                </FeedbackMessage>
            )}
            {actionData?.success === false && actionData.error && (
              <FeedbackMessage type="error">
                Error: {actionData.error}
              </FeedbackMessage>
            )}
            {actionData?.success === true && actionData.message && (
              <FeedbackMessage type="success">
                {actionData.message}
              </FeedbackMessage>
            )}
            {/* <p className="text-gray-500 text-sm dark:text-gray-400">Future chat/comments area</p> */}
        </div>
    );
} 