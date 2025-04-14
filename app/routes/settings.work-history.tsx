import { useRef } from 'react';
import { Form, useLoaderData, useActionData, useNavigation, Link } from 'react-router';
import type { ActionFunctionArgs } from 'react-router';
import type { MDXEditorMethods } from '@mdxeditor/editor';

import dbService from '~/services/db/dbService.server';
import { serverLogger } from '~/utils/logger.server';
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

export async function loader() {
  const workHistory = dbService.getWorkHistory();
  return {
      workHistory: workHistory ?? ''
  };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const newWorkHistory = formData.get('workHistoryContent') as string;

  if (typeof newWorkHistory !== 'string') {
    return { success: false, error: 'Invalid content submitted.' };
  }

  const currentWorkHistory = dbService.getWorkHistory();

  if (newWorkHistory === (currentWorkHistory ?? '')) {
      return { success: true, message: 'No changes detected.' };
  }

  try {
    const success = dbService.saveWorkHistory(newWorkHistory);
    if (success) {
      return { success: true, message: 'Work history updated successfully!' };
    }
    return { success: false, error: 'Failed to save work history.' };
  } catch (error) {
    serverLogger.error('Error saving work history:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: `Failed to save work history: ${errorMessage}` };
  }
}

export default function EditWorkHistory() {
  const { workHistory: initialWorkHistory } = useLoaderData<{ workHistory: string }>();
  const actionData = useActionData<{ success?: boolean; message?: string; error?: string }>();
  const navigation = useNavigation();
  const editorRef = useRef<MDXEditorMethods | null>(null);

  const isSubmitting = navigation.state === 'submitting';
  const isLoading = navigation.state === 'loading' && navigation.formData?.get('workHistoryContent') !== undefined;


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
                <ClientMarkdownEditor
                    name="workHistoryContent"
                    editorRef={editorRef}
                    markdown={initialWorkHistory}
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
                buttonText="Save Work History"
                savingText="Saving..."
            />
        }
    />
  );
}