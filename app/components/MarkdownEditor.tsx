import type { MDXEditorMethods } from "@mdxeditor/editor";
import {
	BlockTypeSelect,
	BoldItalicUnderlineToggles,
	CreateLink,
	ListsToggle,
	MDXEditor,
	Separator,
	headingsPlugin,
	linkDialogPlugin,
	linkPlugin,
	listsPlugin,
	quotePlugin,
	thematicBreakPlugin,
	toolbarPlugin,
} from "@mdxeditor/editor";
import { useEffect, useState } from "react";
import { TEST_IDS } from "~/config/testIds";
import "@mdxeditor/editor/style.css";
import {
	Button,
	applyBlockType$,
	applyFormat$,
	applyListType$,
	currentBlockType$,
	currentFormat$,
	currentListType$,
	useCellValue,
	usePublisher,
} from "@mdxeditor/editor";
import {
	Bold,
	Heading1,
	Heading2,
	Heading3,
	Italic,
	List,
	ListOrdered,
	Quote,
	Type,
	Underline,
} from "lucide-react";
import { ClientOnly } from "~/utils/clientOnly";

interface MarkdownEditorProps {
	markdown: string;
	name: string;
	onChange?: (markdown: string) => void;
	editorRef: React.RefObject<MDXEditorMethods | null>; // Allow null for initial ref value
	isClient?: boolean;
	placeholder?: string;
}

type ToolbarAction =
	| {
			type: "format";
			label: string;
			icon: React.ComponentType<{ size?: number }>;
			value: string;
	  }
	| {
			type: "list";
			label: string;
			icon: React.ComponentType<{ size?: number }>;
			value: string;
	  }
	| {
			type: "blockType";
			label: string;
			icon: React.ComponentType<{ size?: number }>;
			value: string;
	  }
	| { type: "custom"; label: string; custom: React.ReactNode }
	| { type: "separator"; key: string };

function CustomToolbar() {
	const applyFormat = usePublisher(applyFormat$);
	const applyListType = usePublisher(applyListType$);
	const applyBlockType = usePublisher(applyBlockType$);
	const currentFormat = useCellValue(currentFormat$);
	const currentListType = useCellValue(currentListType$);
	const currentBlockType = useCellValue(currentBlockType$);

	const toolbarActions: ToolbarAction[] = [
		{ type: "blockType", label: "Body", icon: Type, value: "paragraph" },
		{ type: "blockType", label: "Title", icon: Heading1, value: "h1" },
		{ type: "blockType", label: "Heading", icon: Heading2, value: "h2" },
		{ type: "blockType", label: "Subheading", icon: Heading3, value: "h3" },
		{ type: "blockType", label: "Quote", icon: Quote, value: "quote" },
		{ type: "separator", key: "sep-1" },
		{ type: "format", label: "Bold", icon: Bold, value: "bold" },
		{ type: "format", label: "Italic", icon: Italic, value: "italic" },
		{ type: "format", label: "Underline", icon: Underline, value: "underline" },
		{ type: "separator", key: "sep-2" },
		{ type: "list", label: "Bulleted List", icon: List, value: "bullet" },
		{
			type: "list",
			label: "Numbered List",
			icon: ListOrdered,
			value: "number",
		},
		{ type: "separator", key: "sep-3" },
		{ type: "custom", label: "Link", custom: <CreateLink /> },
	];

	function handleToolbarAction(type: ToolbarAction["type"], value?: string) {
		if (type === "format" && value) {
			applyFormat(value as any);
		}
		if (type === "list" && value) {
			applyListType(value as any);
		}
		if (type === "blockType" && value) {
			applyBlockType(value as any);
		}
	}

	function isActionActive(action: ToolbarAction): boolean {
		if (action.type === "format" && currentFormat) {
			// Check if the format is active by checking the bitmask
			return Boolean(currentFormat & (1 << getFormatBit(action.value)));
		}
		if (action.type === "list") {
			return currentListType === action.value;
		}
		if (action.type === "blockType") {
			return currentBlockType === action.value;
		}
		return false;
	}

	function getFormatBit(format: string): number {
		switch (format) {
			case "bold":
				return 0;
			case "italic":
				return 1;
			case "underline":
				return 2;
			default:
				return -1;
		}
	}

	return (
		<>
			{toolbarActions.map((action) => {
				if (action.type === "separator") {
					return <Separator key={action.key} />;
				}
				if (action.type === "custom") {
					return <span key={action.label}>{action.custom}</span>;
				}

				const isActive = isActionActive(action);

				return (
					<Button
						key={action.label}
						onClick={() => handleToolbarAction(action.type, action.value)}
						title={action.label}
						aria-label={action.label}
						data-testid={`toolbar-btn-${action.label.replace(/\s+/g, "-").toLowerCase()}`}
						style={{
							backgroundColor: isActive ? "var(--accentBg)" : "transparent",
							color: isActive ? "var(--accentText)" : "var(--baseText)",
						}}
					>
						<action.icon size={18} />
					</Button>
				);
			})}
		</>
	);
}

export function ClientMarkdownEditor(
	props: Omit<MarkdownEditorProps, "isClient">,
) {
	useEffect(() => {
		if (props.editorRef?.current && typeof props.markdown === "string") {
			if (props.editorRef.current.getMarkdown() !== props.markdown) {
				props.editorRef.current.setMarkdown(props.markdown);
			}
		}
	}, [props.markdown, props.editorRef]);

	const handleChange = (markdown: string) => {
		const jobDescInput = document.getElementById(
			props.name,
		) as HTMLInputElement;
		if (jobDescInput) {
			jobDescInput.value = markdown;
		}
	};

	return (
		<ClientOnly fallback={<div>Loading Editor...</div>}>
			{() => (
				<>
					<input
						type="hidden"
						name={props.name}
						id={props.name}
						value={props.markdown}
					/>
					<MDXEditor
						ref={props.editorRef}
						className="mdxeditor-theme w-full min-w-0"
						markdown={props.markdown}
						onChange={handleChange}
						plugins={[
							headingsPlugin(),
							listsPlugin(),
							quotePlugin(),
							linkPlugin(),
							linkDialogPlugin(),
							thematicBreakPlugin(),
							toolbarPlugin({
								toolbarContents: () => <CustomToolbar />,
							}),
						]}
						contentEditableClassName="prose"
						placeholder={props.placeholder}
					/>
				</>
			)}
		</ClientOnly>
	);
}
