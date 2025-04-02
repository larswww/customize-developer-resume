import { Link } from "react-router";

export function meta() {
	return [
		{ title: "AI Resume Generator" },
		{ name: "description", content: "Welcome to the AI Resume Generator" },
	];
}

export default function Index() {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen p-4">
			<h1 className="text-4xl font-bold mb-4">AI Resume Generator</h1>
			<p className="text-lg mb-8 text-center max-w-md">
				Create tailored resumes quickly using AI. Manage your job applications and generate content effortlessly.
			</p>
			<Link 
				to="/dashboard" 
				className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
			>
				Go to Dashboard
			</Link>
		</div>
	);
}
