import { useState, useRef, useEffect } from 'react';
import { Form, useLoaderData, useActionData, useNavigation, Link } from 'react-router';
import type { ActionFunctionArgs } from 'react-router';
// Import specific MDXEditor components and plugins
import { 
    MDXEditor, 
    headingsPlugin, 
    listsPlugin, // Added for list functionality
    quotePlugin, // Optional: for blockquotes if desired
    thematicBreakPlugin, // Optional: for horizontal rules
    toolbarPlugin, 
    // Import specific toolbar controls
    BlockTypeSelect, 
    BoldItalicUnderlineToggles, 
    ListsToggle, 
    Separator, // Import Separator for visual spacing
    type MDXEditorMethods 
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';

import dbService from '~/services/db/dbService';

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

// Helper component for feedback messages
interface FeedbackMessageProps {
  type: 'info' | 'success' | 'error';
  children: React.ReactNode;
}

function FeedbackMessage({ type, children }: FeedbackMessageProps) {
  const baseClasses = "mb-4 p-3 border rounded";
  let typeClasses = "";
  let darkTypeClasses = ""; // Added for dark mode

  switch (type) {
    case 'info':
      typeClasses = "bg-blue-50 text-blue-700 border-blue-200";
      darkTypeClasses = "dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700"; // Dark mode info
      break;
    case 'success':
      typeClasses = "bg-green-50 text-green-600 border-green-200";
      darkTypeClasses = "dark:bg-green-900/50 dark:text-green-300 dark:border-green-700"; // Dark mode success
      break;
    case 'error':
      typeClasses = "bg-red-50 text-red-600 border-red-200";
      darkTypeClasses = "dark:bg-red-900/50 dark:text-red-300 dark:border-red-700"; // Dark mode error
      break;
  }

  return (
    <div className={`${baseClasses} ${typeClasses} ${darkTypeClasses}`}>
      {children}
    </div>
  );
}

export default function EditWorkHistory() {
  const { workHistory: initialWorkHistory } = useLoaderData<{ workHistory: string }>();
  const actionData = useActionData<{ success?: boolean; message?: string; error?: string }>();
  const navigation = useNavigation();
  const editorRef = useRef<MDXEditorMethods>(null); 

  const [editorContent, setEditorContent] = useState<string>(initialWorkHistory);
  const [isClient, setIsClient] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const isSubmitting = navigation.state === 'submitting';
  const isLoading = navigation.state === 'loading' && navigation.formData?.get('workHistoryContent') !== undefined;

  // Update editor content if initial data changes
  useEffect(() => {
    // Simplified: Directly update editor content when the initial data loads/changes.
    setEditorContent(initialWorkHistory);
    // We no longer reset hasChanges here. It's reset after successful save.
  }, [initialWorkHistory]); // Only depends on initialWorkHistory, satisfying linter.
  
  // Effect to show feedback and reset hasChanges on successful save
  useEffect(() => {
      if (actionData?.success && actionData.message) {
          // Reset hasChanges *only* if a save actually occurred and succeeded.
          if (actionData.message !== 'No changes detected.') { 
             setHasChanges(false); 
          }
      } else if (actionData?.error) {
      }
  }, [actionData]);

  const handleEditorChange = (markdown: string) => {
    setEditorContent(markdown); 
    if (!hasChanges && markdown !== initialWorkHistory) {
        setHasChanges(true);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl w-full mx-auto p-3 border-b border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-x-4 gap-y-1">
          <div className="flex items-baseline gap-x-2 flex-wrap">
            <h1 className="text-xl font-bold whitespace-nowrap text-gray-900 dark:text-white">Edit Work History</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Edit below. Content is used for AI generation. Use Markdown.
            </p>
          </div>
          <Link 
            to="/dashboard" 
            className="px-3 py-1.5 rounded-md text-sm bg-blue-600 hover:bg-blue-700 text-white flex items-center whitespace-nowrap"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
      
      <div className="flex flex-grow max-w-7xl w-full mx-auto">
        
        <div className="flex-1 flex flex-col p-4 sm:p-6 bg-white dark:bg-gray-850">
          {/* Feedback Messages removed from here */}

          <Form method="post" id="work-history-form" className="flex flex-col flex-grow">
            <input type="hidden" name="workHistoryContent" value={editorContent} />

            <div className="flex flex-col flex-grow border rounded-md overflow-hidden bg-white border-gray-300 shadow-sm dark:bg-gray-900 dark:border-gray-700">
              {isClient ? (
                <MDXEditor
                  ref={editorRef}
                  markdown={editorContent} 
                  onChange={handleEditorChange}
                  plugins={[ 
                      headingsPlugin(),
                      listsPlugin(),
                      quotePlugin(),
                      thematicBreakPlugin(),
                      toolbarPlugin({ 
                        toolbarContents: () => (
                          <> 
                            <BlockTypeSelect />
                            <Separator />
                            <BoldItalicUnderlineToggles />
                            <Separator />
                            <ListsToggle />
                          </>
                        )
                      })
                  ]}
                  contentEditableClassName="flex-grow overflow-y-auto p-4 pb-24 prose prose-sm lg:prose-base max-w-none prose-slate text-gray-800 bg-white dark:prose-invert dark:bg-gray-900 dark:text-gray-200"
                  placeholder="Enter your work history in Markdown format..."
                />
              ) : (
                <div className="flex-grow p-6 text-center text-gray-500 flex items-center justify-center dark:text-gray-400">
                  Loading Editor...
                </div>
              )}
            </div>

          </Form>
        </div>

        <div className="w-1/4 bg-gray-100 p-4 hidden md:block border-l border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          {/* Feedback Messages moved here */}
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

      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-gray-50 border-t border-gray-200 p-4 flex justify-end shadow-up pr-4 sm:pr-6 dark:bg-gray-950 dark:border-gray-700">
         <button 
            type="submit"
            form="work-history-form"
            className="px-6 py-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400 dark:disabled:bg-gray-600 dark:disabled:text-gray-400 flex items-center transition-colors duration-200"
            disabled={isSubmitting || !hasChanges || !isClient}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Saving...
              </>
            ) : (
              'Save Work History'
            )}
          </button>
      </div>

    </div>
  );
} 