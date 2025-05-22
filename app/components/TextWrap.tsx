import type React from "react";
import { useEffect, useRef, useState } from "react";
import { TEST_IDS } from "~/config/testIds";

interface TextWrapProps {
	text: string | undefined;
	name: string;
	linkClassName?: string;
	label?: string;
	alternativeValue?: string;
}

function parseTextWithLinks(
	text: string,
	linkClassName?: string,
): (string | React.JSX.Element)[] {
	const parts: (string | React.JSX.Element)[] = [];
	let lastIndex = 0;
	const regex = /\[([^\]]+)\]\(([^)]+)\)/g; // Corrected Markdown link regex
	let match: RegExpExecArray | null;

	// biome-ignore lint/suspicious/noAssignInExpressions: Necessary for iterating through regex matches
	while ((match = regex.exec(text)) !== null) {
		if (match.index > lastIndex) {
			parts.push(text.substring(lastIndex, match.index));
		}
		const linkText = match[1];
		const url = match[2];
		parts.push(
			<a
				href={url}
				target="_blank"
				rel="noopener noreferrer"
				key={`${url}-${match.index}`}
				onClick={(e) => e.stopPropagation()} // Prevent TextWrap's edit mode activation
				className={linkClassName} // Minimal styling
			>
				{linkText}
			</a>,
		);
		lastIndex = regex.lastIndex;
	}

	if (lastIndex < text.length) {
		parts.push(text.substring(lastIndex));
	}

	return parts;
}

export function TextWrap({
	text,
	name,
	linkClassName,
	label = "Edit",
	alternativeValue,
}: TextWrapProps) {
	const [value, setValue] = useState(alternativeValue || text || "");
	const [edit, setEdit] = useState(false);
	const wrapperRef = useRef<HTMLDivElement>(null);
	const editableRef = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				wrapperRef.current &&
				!wrapperRef.current.contains(event.target as Node) &&
				edit
			) {
				const newText = editableRef.current?.textContent || ""; // Capture before setEdit
				setValue(newText);
				setEdit(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [edit]);

	useEffect(() => {
		if (edit && editableRef.current) {
			editableRef.current.focus();

			const range = document.createRange();
			const selection = window.getSelection();
			if (editableRef.current.childNodes.length > 0) {
				const lastNode =
					editableRef.current.childNodes[
						editableRef.current.childNodes.length - 1
					];
				range.setStart(lastNode, lastNode.textContent?.length || 0);
				range.collapse(true);
				selection?.removeAllRanges();
				selection?.addRange(range);
			}
		}
	}, [edit]);

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			const newText = editableRef.current?.textContent || "";
			setValue(newText);
			setEdit(false);
		}
		e.stopPropagation();
	};

	const handleActivate = (e: React.MouseEvent | React.KeyboardEvent) => {
		e.stopPropagation();
		setEdit(true);
	};

	// biome-ignore lint/suspicious/noExplicitAny: Deliberate to avoid re-setting textContent on value change during edit
	// biome-ignore lint/correctness/useExhaustiveDependencies: We only want to set initial textContent when entering edit mode
	useEffect(() => {
		if (edit && editableRef.current) {
			editableRef.current.textContent = value;
		}
	}, [edit]);

	return (
		<span className="inline-text" ref={wrapperRef}>
			<input
				type="hidden"
				name={name}
				value={value}
				onChange={(e) => setValue(e.target.value)}
			/>
			{edit ? (
				<span
					key="editable-span"
					data-testid={TEST_IDS.editableElementInResume}
					ref={editableRef}
					contentEditable
					suppressContentEditableWarning
					className="outline-none break-words whitespace-pre-wrap"
					onClick={(e) => e.stopPropagation()}
					onBlur={() => {
						const newText = editableRef.current?.textContent || "";
						setValue(newText);
						setEdit(false);
					}}
					onKeyDown={handleKeyDown}
				/>
			) : (
				<span
					key="display-span"
					data-testid={TEST_IDS.editElementInResume}
					className={`cursor-text ${value ? "" : "text-red-500"}`}
					onClick={handleActivate}
					onKeyDown={handleActivate}
				>
					{value ? parseTextWithLinks(value, linkClassName) : label}
				</span>
			)}
		</span>
	);
}
