import { Link } from "react-router";

export function Navigation() {
	return (
		<nav className="bg-blue-600 text-white p-4">
			<div className="max-w-6xl mx-auto flex items-center justify-between">
				<div className="font-bold text-xl">AI Resume Tools</div>
				<ul className="flex space-x-6">
					<li>
						<Link to="/" className="hover:text-blue-200">
							Resume Generator
						</Link>
					</li>
					<li>
						<Link to="/resume-editor" className="hover:text-blue-200">
							Resume Editor
						</Link>
					</li>
					<li>
						<Link to="/structured-resume" className="hover:text-blue-200">
							Structured Resume
						</Link>
					</li>
				</ul>
			</div>
		</nav>
	);
}
