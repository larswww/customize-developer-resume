import type React from 'react';
import type { OnePagerData } from '~/config/templates/onepager';

// Helper to ensure URL starts with https://
const ensureHttps = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://${url}`;
};

interface OnePagerTemplateProps {
  data: OnePagerData;
}

const OnePagerTemplate: React.FC<OnePagerTemplateProps> = ({ data }) => {
  const { contactInfo, title, subtitle, tableData, highlights } = data;

  return (
    <div className="p-6 font-sans bg-white text-gray-800 max-w-5xl mx-auto" style={{ aspectRatio: '16/9' }}>
      {/* Header with image and contact info */}
      <header className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-blue-700">{title || contactInfo.name}</h1>
          <p className="text-xl text-gray-600">{contactInfo.title}</p>
          
          <div className="mt-2 text-sm flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span>📍</span> {contactInfo.location}
            </div>
            <div className="flex items-center gap-2">
              <span>📞</span> {contactInfo.phone}
            </div>
            <div className="flex items-center gap-2">
              <span>✉️</span> 
              <a href={`mailto:${contactInfo.email}`} className="text-blue-600 hover:underline">
                {contactInfo.email}
              </a>
            </div>
            {contactInfo.linkedin && (
              <div className="flex items-center gap-2">
                <span>🔗</span>
                <a 
                  href={ensureHttps(contactInfo.linkedin)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  LinkedIn
                </a>
              </div>
            )}
          </div>
        </div>
        
        {/* Person image */}
        <div className="w-32 h-32 overflow-hidden rounded-full border-4 border-blue-100">
          {contactInfo.imageUrl ? (
            <img 
              src={contactInfo.imageUrl} 
              alt={contactInfo.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-blue-50 flex items-center justify-center text-blue-300 text-4xl">
              {contactInfo.name.charAt(0)}
            </div>
          )}
        </div>
      </header>

      {/* Subtitle/Introduction */}
      {subtitle && (
        <section className="mb-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-gray-700">{subtitle}</p>
        </section>
      )}
      
      {/* Table */}
      {tableData && tableData.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-blue-700 border-b pb-1">Key Experience</h2>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {tableData[0].map((header, index) => (
                    <th 
                      key={`table-header-${header.toLowerCase().replace(/\s+/g, '-')}-${index}`}
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tableData.slice(1).map((row, rowIndex) => (
                  <tr key={`table-row-${rowIndex}-${row[0]?.toLowerCase().replace(/\s+/g, '-')}`} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {row.map((cell, cellIndex) => (
                      <td 
                        key={`table-cell-${rowIndex}-${cellIndex}-${String(cell).substring(0, 10).toLowerCase().replace(/\s+/g, '-')}`}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      
      {/* Highlights/Bullet Points */}
      {highlights && highlights.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-3 text-blue-700 border-b pb-1">Highlights</h2>
          <div className="grid grid-cols-2 gap-4">
            {highlights.map((highlight, index) => (
              <div key={`highlight-${index}-${highlight.substring(0, 15).toLowerCase().replace(/\s+/g, '-')}`} className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">•</span>
                <p className="text-sm">{highlight}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default OnePagerTemplate; 