import { useState, useRef, useEffect } from 'react';
import { Form, useLoaderData, useActionData, useNavigation, Link } from 'react-router';
import type { ActionFunctionArgs } from 'react-router';
import type { MDXEditorMethods } from '@mdxeditor/editor';
import dbService from '~/services/db/dbService';

// Import the newly created components
import { PageLayout } from '~/components/PageLayout';
import { ClientMarkdownEditor } from '~/components/MarkdownEditor';
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

export default function EditWorkHistory() {
  const { workHistory: initialWorkHistory } = useLoaderData<{ workHistory: string }>();
  const actionData = useActionData<{ success?: boolean; message?: string; error?: string }>();
  const navigation = useNavigation();
  const editorRef = useRef<MDXEditorMethods | null>(null);

  const [hasChanges, setHasChanges] = useState(false);
  const [lastSavedContent, setLastSavedContent] = useState(initialWorkHistory);

  const isSubmitting = navigation.state === 'submitting';
  const isLoading = navigation.state === 'loading' && navigation.formData?.get('workHistoryContent') !== undefined;

  // Effect to reset hasChanges on successful save
  useEffect(() => {
      if (actionData?.success && actionData.message) {
          if (actionData.message !== 'No changes detected.') {
             setHasChanges(false);
             // Update last saved content
             if (editorRef.current) {
                 setLastSavedContent(editorRef.current.getMarkdown());
             }
          }
      }
  }, [actionData]);

  // Update the last saved content when initial data changes
  useEffect(() => {
      if (navigation.state !== 'submitting') {
          setLastSavedContent(initialWorkHistory);
          setHasChanges(false); // Reset changes when loading initial data
      }
  }, [initialWorkHistory, navigation.state]);

  // Handle editor change to track if there are unsaved changes
  const handleEditorChange = (markdown: string) => {
      if (markdown !== lastSavedContent) {
          setHasChanges(true);
      } else {
          setHasChanges(false);
      }
  };

  // Handle form submission - get content directly from the editor ref
  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      if (editorRef.current) {
          const markdown = editorRef.current.getMarkdown();
          const hiddenInput = event.currentTarget.elements.namedItem('workHistoryContent') as HTMLInputElement;
          if (hiddenInput) {
              hiddenInput.value = markdown;
          }
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
            <Form method="post" id={formId} className="flex flex-col flex-grow" onSubmit={handleFormSubmit}>
                <ClientMarkdownEditor
                    name="workHistoryContent"
                    editorRef={editorRef}
                    markdown={initialWorkHistory}
                    onChange={handleEditorChange}
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
                isClient={true}
                buttonText="Save Work History"
                savingText="Saving..."
            />
        }
    />
  );
} 