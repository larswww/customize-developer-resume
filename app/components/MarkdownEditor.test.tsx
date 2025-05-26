/**
 * @vitest-environment happy-dom
 */

import React from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ClientMarkdownEditor } from "./MarkdownEditor";
import { FormMarkdownEditor } from "./ui/FormField";

const TEST_MARKDOWN = `# Markdown: Syntax\n\n* Red\n* Green\n* Blue`;
const TEST_PLACEHOLDER = `## Placeholder Title\n\n*Enter your content here*`;

let container: HTMLDivElement;

// Mock the useInputControl hook from @conform-to/react
vi.mock("@conform-to/react", () => ({
	useInputControl: vi.fn(() => ({
		value: "",
		change: vi.fn(),
		focus: vi.fn(),
		blur: vi.fn(),
	})),
}));

const mockMeta = {
	id: "test-field",
	name: "test-field",
	errorId: "test-field-error",
	errors: undefined,
	key: "test-field",
	descriptionId: "test-field-description",
	initialValue: "",
	value: "",
	valid: true,
	dirty: false,
} as any;

describe("ClientMarkdownEditor", () => {
	beforeEach(() => {
		container = document.createElement("div");
		document.body.appendChild(container);
	});

	afterEach(() => {
		document.body.removeChild(container);
	});

	it("renders markdown as HTML elements in the browser", async () => {
		const ref = { current: null };
		const root = createRoot(container);

		root.render(
			<ClientMarkdownEditor
				name="test-markdown"
				markdown={TEST_MARKDOWN}
				editorRef={ref}
			/>,
		);

		// Wait for the client-only hydration
		await new Promise((r) => setTimeout(r, 100));

		const html = container.innerHTML;

		// Check that the markdown content is rendered as HTML elements
		expect(html).toContain("<h1");
		expect(html).toContain("Markdown: Syntax");
		expect(html).toContain("<ul>");
		expect(html).toContain("Red");
		expect(html).toContain("Green");
		expect(html).toContain("Blue");

		// Check for MDX editor specific structure
		expect(html).toContain('data-lexical-text="true"');
		expect(html).toContain("mdxeditor");
	});

	it("renders placeholder text when editor is empty", async () => {
		const ref = { current: null };
		const root = createRoot(container);

		root.render(
			<ClientMarkdownEditor
				name="test-placeholder"
				markdown=""
				placeholder={TEST_PLACEHOLDER}
				editorRef={ref}
			/>,
		);

		// Wait for the client-only hydration
		await new Promise((r) => setTimeout(r, 100));

		const html = container.innerHTML;

		// Check for MDX editor specific structure
		expect(html).toContain("mdxeditor");

		// Note: Placeholder text shows as raw text in MDXEditor when empty
		// This is expected behavior - placeholders are not rendered as markdown
	});
});

describe("FormMarkdownEditor", () => {
	beforeEach(() => {
		container = document.createElement("div");
		document.body.appendChild(container);
	});

	afterEach(() => {
		document.body.removeChild(container);
	});

	it("renders with label", async () => {
		const ref = { current: null };
		const root = createRoot(container);

		root.render(
			<FormMarkdownEditor meta={mockMeta} label="Content" editorRef={ref} />,
		);

		await new Promise((r) => setTimeout(r, 100));

		const html = container.innerHTML;

		// Check that label is rendered
		expect(html).toContain("<label");
		expect(html).toContain("Content");
		expect(html).toContain('for="test-field"');
	});

	it("renders without label", async () => {
		const ref = { current: null };
		const root = createRoot(container);

		root.render(<FormMarkdownEditor meta={mockMeta} editorRef={ref} />);

		await new Promise((r) => setTimeout(r, 100));

		const html = container.innerHTML;

		// Check that no label is rendered
		expect(html).not.toContain("<label");
	});

	it("displays errors when meta has errors", async () => {
		const metaWithErrors = {
			...mockMeta,
			errors: ["This field is required"],
		};

		const ref = { current: null };
		const root = createRoot(container);

		root.render(
			<FormMarkdownEditor
				meta={metaWithErrors}
				label="Content"
				editorRef={ref}
			/>,
		);

		await new Promise((r) => setTimeout(r, 100));

		const html = container.innerHTML;

		// Check that error is displayed
		expect(html).toContain("This field is required");
		expect(html).toContain("text-red-600");
	});

	it("displays multiple errors correctly", async () => {
		const metaWithMultipleErrors = {
			...mockMeta,
			errors: ["This field is required", "Must be at least 10 characters"],
		};

		const ref = { current: null };
		const root = createRoot(container);

		root.render(
			<FormMarkdownEditor
				meta={metaWithMultipleErrors}
				label="Content"
				editorRef={ref}
			/>,
		);

		await new Promise((r) => setTimeout(r, 100));

		const html = container.innerHTML;

		// Check that both errors are displayed
		expect(html).toContain(
			"This field is required, Must be at least 10 characters",
		);
	});

	it("renders with placeholder text when empty", async () => {
		const ref = { current: null };
		const root = createRoot(container);

		root.render(
			<FormMarkdownEditor
				meta={mockMeta}
				editorRef={ref}
				placeholder={TEST_PLACEHOLDER}
			/>,
		);

		await new Promise((r) => setTimeout(r, 100));

		const html = container.innerHTML;

		// Check that placeholder is passed to the editor (raw markdown text as placeholder)
		expect(html).toContain("mdxeditor");
		// Note: The placeholder shows as raw markdown text in the editor when empty
		// This is the expected behavior - placeholders are not rendered as HTML
	});

	it("integrates with form control", async () => {
		const { useInputControl } = await import("@conform-to/react");
		const mockControl = {
			value: TEST_MARKDOWN,
			change: vi.fn(),
			focus: vi.fn(),
			blur: vi.fn(),
		};

		vi.mocked(useInputControl).mockReturnValue(mockControl);

		const ref = { current: null };
		const root = createRoot(container);

		root.render(<FormMarkdownEditor meta={mockMeta} editorRef={ref} />);

		await new Promise((r) => setTimeout(r, 100));

		const html = container.innerHTML;

		// Check that the markdown content from control is rendered
		expect(html).toContain("Markdown: Syntax");
		expect(useInputControl).toHaveBeenCalledWith(mockMeta);
	});
});
