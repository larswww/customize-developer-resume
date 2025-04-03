import type { ReactNode } from 'react';

interface PageLayoutProps {
    title: string;
    subtitle?: string;
    topRightContent?: ReactNode;
    mainContent: ReactNode;
    rightSidebarContent?: ReactNode;
    bottomBarContent: ReactNode;
}

export function PageLayout({
    title,
    subtitle,
    topRightContent,
    mainContent,
    rightSidebarContent,
    bottomBarContent
}: PageLayoutProps) {
    return (
        <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
          {/* Top Bar */}
          <div className="w-full border-b border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-x-4 gap-y-1">
              <div className="flex items-baseline gap-x-2 flex-wrap">
                <h1 className="text-xl font-bold whitespace-nowrap text-gray-900 dark:text-white">{title}</h1>
                {subtitle && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {subtitle}
                  </p>
                )}
              </div>
              {topRightContent}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex flex-grow max-w-7xl w-full mx-auto">
            {/* Left/Main Section */}
            <div className="flex-1 flex flex-col p-4 sm:p-6 bg-white dark:bg-gray-850">
              {mainContent}
            </div>

            {/* Right Sidebar Section */}
            {rightSidebarContent && (
                <div className="w-1/4 hidden md:block">
                    {rightSidebarContent}
                </div>
            )}
          </div>

          {/* Bottom Bar */}
          {bottomBarContent}
        </div>
    );
} 