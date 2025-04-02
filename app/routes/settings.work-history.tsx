import { useState, useRef, useEffect } from 'react';
import { Form, useLoaderData, useActionData, useNavigation, Link } from 'react-router';
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
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

  // Update editor content and reset hasChanges if initial data changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (initialWorkHistory !== editorContent) {
       setEditorContent(initialWorkHistory);
       setHasChanges(false); 
    }
  }, [initialWorkHistory,]);
  
  // Effect to show feedback and reset hasChanges on successful save
  useEffect(() => {
      if (actionData?.success && actionData.message) {
          alert(actionData.message);
          if (actionData.message !== 'No changes detected.') { // Only reset if actual save occurred
             setHasChanges(false); 
          }
      } else if (actionData?.error) {
          alert(`Error: ${actionData.error}`);
      }
  }, [actionData]);

  const handleEditorChange = (markdown: string) => {
    setEditorContent(markdown); 
    if (!hasChanges && markdown !== initialWorkHistory) {
        setHasChanges(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Work History</h1>
         <Link 
            to="/dashboard" 
            className="px-3 py-1.5 border rounded hover:bg-gray-50"
          >
            Back to Dashboard
          </Link>
      </div>
      
      <p className="mb-4 text-gray-600">
        Edit your work history below. This content will be used by the AI to generate tailored resumes. Use Markdown format.
      </p>

      {isLoading && (
          <div className="mb-4 p-3 border rounded bg-blue-50 text-blue-700">
            Loading saved content...
          </div>
      )}
      {actionData?.success === false && actionData.error && (
        <div className="mb-4 p-3 border border-red-200 rounded bg-red-50 text-red-600">
          Error: {actionData.error}
        </div>
      )}
       {actionData?.success === true && actionData.message && (
        <div className="mb-4 p-3 border border-green-200 rounded bg-green-50 text-green-600">
          {actionData.message}
        </div>
      )}

      <Form method="post">
        <input type="hidden" name="workHistoryContent" value={editorContent} />

        <div className="mb-4 border rounded-md overflow-hidden prose prose-sm max-w-none dark:prose-invert min-h-[200px]">
          {isClient ? (
            <MDXEditor
               ref={editorRef}
               markdown={editorContent} 
               onChange={handleEditorChange} 
               // Use specific plugins
               plugins={[ 
                  headingsPlugin(),
                  listsPlugin(),
                  quotePlugin(),
                  thematicBreakPlugin(),
                  // Configure toolbar with specific controls
                  toolbarPlugin({ 
                    toolbarContents: () => ( // Return JSX directly
                      <> 
                        <BlockTypeSelect />
                        <Separator />
                        <BoldItalicUnderlineToggles />
                        <Separator />
                        <ListsToggle />
                        {/* Add other controls like UndoRedo, LinkDialog, etc. if needed */}
                      </>
                    )
                  })
               ]}
               contentEditableClassName="min-h-96"
               placeholder="Enter your work history in Markdown format..."
            />
          ) : (
            <div className="p-4 text-center text-gray-500">Loading Editor...</div>
          )}
        </div>

        <div className="flex justify-end">
          <button 
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center"
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
      </Form>
    </div>
  );
} 