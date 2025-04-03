import { useState, useRef, useEffect } from 'react';
import { Form, useLoaderData, useActionData, useNavigation, Link } from 'react-router';
import type { ActionFunctionArgs } from 'react-router';
import type { MDXEditorMethods } from '@mdxeditor/editor';
import dbService from '~/services/db/dbService';

// Import the newly created components
import { PageLayout } from '~/components/PageLayout';
import { MarkdownEditor } from '~/components/MarkdownEditor';
import { SaveBottomBar } from '~/components/SaveBottomBar';
import { FeedbackSidebar } from '~/components/FeedbackSidebar';

export function meta() {
  return [
    { title: "Edit Work History" },
    { name: "description", content: "Manage your work history content." },
  ];
}

// Loader function to get current work history
export async function loader() {
  const workHistory = dbService.getWorkHistory();
  return {
      workHistory: workHistory ?? ''
  };
}

// Action function to save updated work history
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const newWorkHistory = formData.get('workHistoryContent') as string;

  if (typeof newWorkHistory !== 'string') {
    return { success: false, error: 'Invalid content submitted.' };
  }

  // Get current history from DB to compare
  const currentWorkHistory = dbService.getWorkHistory();

  // Check if content has actually changed
  if (newWorkHistory === (currentWorkHistory ?? '')) {
      return { success: true, message: 'No changes detected.' }; // Return success but indicate no change
  }

  try {
    const success = dbService.saveWorkHistory(newWorkHistory);
    if (success) {
      return { success: true, message: 'Work history updated successfully!' };
    }
    return { success: false, error: 'Failed to save work history.' };
  } catch (error) {
    console.error('Error saving work history:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: `Failed to save work history: ${errorMessage}` };
  }
}

// --- Removed Reusable Components (they are now in separate files) ---

export default function EditWorkHistory() {
  const { workHistory: initialWorkHistory } = useLoaderData<{ workHistory: string }>();
  const actionData = useActionData<{ success?: boolean; message?: string; error?: string }>();
  const navigation = useNavigation();
  const editorRef = useRef<MDXEditorMethods | null>(null); // Initialize with null

  const [editorContent, setEditorContent] = useState<string>(initialWorkHistory);
  const [isClient, setIsClient] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const isSubmitting = navigation.state === 'submitting';
  const isLoading = navigation.state === 'loading' && navigation.formData?.get('workHistoryContent') !== undefined;

  // Effect to reset hasChanges on successful save
  useEffect(() => {
      if (actionData?.success && actionData.message) {
          if (actionData.message !== 'No changes detected.') {
             setHasChanges(false);
          }
      }
  }, [actionData]);

  // Effect to update editor content only when initial data changes
  // and we are not in the middle of submitting
  useEffect(() => {
    if (navigation.state !== 'submitting') {
        setEditorContent(initialWorkHistory);
        setHasChanges(false); // Reset changes when loading initial data
    }
}, [initialWorkHistory, navigation.state]); // Added navigation.state dependency


  const handleEditorChange = (markdown: string) => {
    setEditorContent(markdown);
    if (!hasChanges && markdown !== initialWorkHistory) {
        setHasChanges(true);
    }
  };

  const formId = "work-history-form";

  return (
    <PageLayout
        title="Edit Work History"
        subtitle="Edit below. Content is used for AI generation. Use Markdown."
        topRightContent={
            <Link
              to="/dashboard"
              className="px-3 py-1.5 rounded-md text-sm bg-blue-600 hover:bg-blue-700 text-white flex items-center whitespace-nowrap"
            >
              Back to Dashboard
            </Link>
        }
        mainContent={
            <Form method="post" id={formId} className="flex flex-col flex-grow">
                <input type="hidden" name="workHistoryContent" value={editorContent} />
                <MarkdownEditor
                    editorRef={editorRef}
                    markdown={editorContent}
                    onChange={handleEditorChange}
                    isClient={isClient}
                    placeholder="Enter your work history in Markdown format..."
                />
            </Form>
        }
        rightSidebarContent={
            <FeedbackSidebar
                isLoading={isLoading}
                actionData={actionData}
            />
        }
        bottomBarContent={
            <SaveBottomBar
                formId={formId}
                isSubmitting={isSubmitting}
                hasChanges={hasChanges}
                isClient={isClient}
                buttonText="Save Work History"
                savingText="Saving..."
            />
        }
    />
  );
} 