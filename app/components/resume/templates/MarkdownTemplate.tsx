import type { MDXEditorMethods } from "@mdxeditor/editor";
import type { FC, MutableRefObject } from "react";
import { ClientMarkdownEditor } from "~/components/MarkdownEditor";
import type { MarkdownData } from "~/config/schemas/markdown";
import type { ResumeTemplateProps } from "./types";

const MarkdownTemplate: FC<ResumeTemplateProps<MarkdownData>> = ({ data }) => {
	return (
		<div className="w-full h-full bg-white">
			<ClientMarkdownEditor
				editorRef={
					undefined as unknown as MutableRefObject<MDXEditorMethods | null>
				}
				markdown={data.content}
				name="content"
			/>
		</div>
	);
};

export default MarkdownTemplate;
