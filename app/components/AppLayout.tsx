import { NavLink, Outlet } from "react-router";

const navLinks = [
  { to: "/dashboard", label: "Resume Generator" },
  { to: "/resume-editor", label: "Resume Editor" },
  { to: "/structured-resume", label: "Structured Resume" },
  { to: "/settings/work-history", label: "Work History" },
];

export default function AppLayout() {
  const getLinkClassName = ({ isActive }: { isActive: boolean }) => {
    const baseStyle =
      "px-3 py-2 rounded-md text-sm font-medium text-blue-100 hover:text-white hover:bg-blue-700";
    const activeStyle =
      "px-3 py-2 rounded-md text-sm font-medium text-white bg-blue-900";
    return isActive ? activeStyle : baseStyle;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <nav className="bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 text-white text-lg font-bold">
                AI Resume Tools
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  {navLinks.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      className={getLinkClassName}
                    >
                      {link.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            </div>
             {/* Placeholder for potential right-aligned items like user profile */}
          </div>
        </div>
         {/* Mobile menu, if needed - omitted for brevity */}
      </nav>

      <main className="flex-grow">
        {/* Outlet renders the matched child route component */}
        <Outlet />
      </main>
    </div>
  );
} 