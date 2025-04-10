import type React from 'react';
import type { ConsultantOnePagerData } from '../../../config/templates/consultantOnePager';

interface ConsultantOnePagerTemplateProps {
  data: ConsultantOnePagerData;
}

const ConsultantOnePagerTemplate: React.FC<ConsultantOnePagerTemplateProps> = ({ data }) => {
  const {
    contactInfo,
    title,
    subtitle,
    expertise,
    highlights,
    profileText,
    companyName = "McKinsey & Company",
    language = "English"
  } = data;

  const whatsappLink = "https://wa.me/31612345678";
  const calendarLink = "https://calendly.com/yourname/meeting";
  const emailAddress = "lars@productworks.nl";
  const githubLink = "https://github.com/larsww";

  const textMap = {
    scheduleIntro: {
      English: "Schedule Intro",
      Swedish: "Boka introduktion",
      Dutch: "Introductie plannen"
    },
    disclaimer: {
      start: {
        English: "Made for ",
        Swedish: "Skapat för ",
        Dutch: "Gemaakt voor " 
      },
      middle: {
        English: " with my own application. I personally verify all information is correct. ",
        Swedish: " med min egen applikation. All information är verifierad av mig. ",
        Dutch: " met eigen applicatie. Informatie is geverifieerd door mij. " 
      },
      end: {
        English: "View source code 👉",
        Swedish: "Se källkoden här 👉",
        Dutch: "Source code hier bekijken 👉"
      }
    }
  };

  return (
    <div className="font-sans text-gray-800 w-full h-full flex flex-col relative overflow-hidden">
      {/* Blue background for header */}
      <header className="relative z-10 bg-[#1e3a8a] text-white p-6 pb-8">
        <div className="max-w-5xl mx-auto">
          {/* Top row with company and name */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-light">{companyName}</h2>
            </div>
            <div className="text-right">
              <h1 className="text-4xl font-semibold text-white">{"Lars Wöldern"}</h1>
            </div>
          </div>

          {/* Main content row */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="flex-1 pr-6">
              <p className="text-xl text-blue-100 mb-6 max-w-3xl leading-relaxed text-justify">{subtitle || "Consultant subtitle"}</p>

              {/* Key bullet points */}
              <ul className="space-y-4 text-blue-50 max-w-3xl">
                {highlights && highlights.slice(0, 3).map((highlight, index) => (
                  <li key={`top-highlight-${index}`} className="flex items-start">
                    <span className="text-blue-300 mr-3 text-lg ml-2">•</span>
                    <span className="font-light text-lg text-justify">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Profile image */}
            <div className="flex-shrink-0 mt-2">
              <img
                src={contactInfo.imageUrl || "/placeholder-profile.jpg"}
                alt={contactInfo.name || "Profile"}
                className="w-48 h-auto rounded-lg border border-white shadow-sm object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Button section outside blue area */}
      <div className="bg-white py-4 shadow-md print:py-2">
        <div className="max-w-5xl mx-auto flex flex-wrap gap-2 px-4 justify-between print:flex-nowrap">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-2 bg-[#25D366] text-white rounded-md hover:bg-opacity-90 transition-colors text-sm print:text-xs"
          >
            <svg className="w-5 h-5 mr-1.5 print:w-4 print:h-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            WhatsApp
          </a>
          <a
            href={calendarLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-2 bg-[#333333] text-white rounded-md hover:bg-opacity-90 transition-colors text-sm print:text-xs"
          >
            <svg className="w-5 h-5 mr-1.5 print:w-4 print:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            {textMap.scheduleIntro[language]}
          </a>
          <a
            href={`mailto:${emailAddress}`}
            className="inline-flex items-center px-3 py-2 bg-[#0055AA] text-white rounded-md hover:bg-opacity-90 transition-colors text-sm print:text-xs"
          >
            <svg className="w-5 h-5 mr-1.5 print:w-4 print:h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
            {emailAddress}
          </a>
          <a
            href={githubLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-2 bg-[#24292e] text-white rounded-md hover:bg-opacity-90 transition-colors text-sm print:text-xs"
          >
            <svg className="w-5 h-5 mr-1.5 print:w-4 print:h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            GitHub
          </a>
        </div>
      </div>

      <main className="flex-1 bg-gray-50 p-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Profile text */}
          <section className="bg-white rounded-lg p-6 shadow-sm mb-6">
            <h2 className="text-2xl font-light text-gray-800 mb-4">{title || "Consultant Profile"}</h2>
            <p className="text-base text-gray-600 leading-relaxed text-justify">{profileText}</p>

            {/* Expertise tags */}
            {expertise && expertise.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {expertise.map((skill, index) => (
                  <span
                    key={`expertise-${index}`}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* Additional highlights - if there are more than shown in the header */}
          {highlights && highlights.length > 3 && (
            <section className="bg-white rounded-lg p-6 shadow-sm mt-4">
              <h2 className="text-2xl font-light text-gray-800 mb-4">Additional Highlights</h2>
              <ul className="space-y-2">
                {highlights.slice(3).map((highlight, index) => (
                  <li key={`additional-highlight-${index}`} className="flex items-start">
                    <span className="text-blue-500 mr-2 text-lg">•</span>
                    <span className="text-gray-700">{highlight}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </main>

      {/* Disclaimer footer */}
      <footer className="bg-gray-100 py-3 border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-6 flex justify-center">
          {textMap.disclaimer.start[language]}
            <span className="font-medium mx-1">{companyName}</span>

          <a
            href={githubLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors flex items-center"
            style={{
              textDecoration: 'underline',
              textUnderlineOffset: '2px'
            }}
          >

            {textMap.disclaimer.end[language]}
          </a>
        </div>
      </footer>
    </div>
  );
};

export default ConsultantOnePagerTemplate;
