import type { MDXEditorMethods } from "@mdxeditor/editor";
import {
	BlockTypeSelect,
	CreateLink,
	BoldItalicUnderlineToggles,
	linkDialogPlugin,
	ListsToggle,
	MDXEditor,
	Separator,
	headingsPlugin,
	linkPlugin,
	listsPlugin,
	quotePlugin,
	thematicBreakPlugin,
	toolbarPlugin,
} from "@mdxeditor/editor";
import { useEffect, useState } from "react";
import "@mdxeditor/editor/style.css";

interface MarkdownEditorProps {
	markdown: string;
	name: string;
	onChange?: (markdown: string) => void;
	editorRef: React.RefObject<MDXEditorMethods | null>; // Allow null for initial ref value
	isClient?: boolean;
	placeholder?: string;
}

// Base editor component that requires explicit isClient prop
export function MarkdownEditor({
	markdown,
	onChange,
	editorRef,
	isClient = true,
	placeholder,
}: MarkdownEditorProps) {
	return (
		<div className="flex flex-col flex-grow border rounded-md bg-white border-gray-300 shadow-sm dark:bg-gray-900 dark:border-gray-700 mb-20">
			{isClient ? (
				<MDXEditor
					ref={editorRef}
					markdown={markdown.replace("```markdown", "").replace("```", "")}
					onChange={onChange}
					plugins={[
						headingsPlugin(),
						listsPlugin(),
						quotePlugin(),
						linkPlugin(),
						linkDialogPlugin(),
						thematicBreakPlugin(),
						toolbarPlugin({
							toolbarContents: () => (
								<>
									<BlockTypeSelect />
									<Separator />
									<BoldItalicUnderlineToggles />
									<Separator />
									<ListsToggle />
									<CreateLink />
								</>
							),
						}),
					]}
					contentEditableClassName="flex-grow overflow-y-auto p-4 pb-48 prose prose-sm lg:prose-base max-w-none prose-slate text-gray-800 bg-white dark:prose-invert dark:bg-gray-900 dark:text-gray-200 min-h-[400px]"
					placeholder={placeholder}
				/>
			) : (
				<div className="flex-grow p-6 text-center text-gray-500 flex items-center justify-center dark:text-gray-400">
					Loading Editor...
				</div>
			)}
		</div>
	);
}

export function ClientMarkdownEditor(
	props: Omit<MarkdownEditorProps, "isClient">,
) {
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	const handleChange = (markdown: string) => {
		const jobDescInput = document.getElementById(
			props.name,
		) as HTMLInputElement;
		if (jobDescInput) {
			jobDescInput.value = markdown;
		}
	};

	return (
		<>
			<input
				type="hidden"
				name={props.name}
				id={props.name}
				value={props.markdown}
			/>
			<MarkdownEditor {...props} onChange={handleChange} isClient={isClient} />
		</>
	);
}
