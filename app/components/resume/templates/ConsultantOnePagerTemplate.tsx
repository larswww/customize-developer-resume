import type React from 'react';
import type { ConsultantOnePagerData } from '../../../config/templates/consultantOnePager';
import { WhatsAppIcon, CalendarIcon, EmailIcon, GitHubIcon } from '../../../components/Icons';

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
        English: " with my own application. All information is verified. ",
        Swedish: " med min egen applikation. All information är verifierad av mig. ",
        Dutch: " met eigen applicatie. Informatie is geverifieerd door mij. " 
      },
      end: {
        English: " open source ",
        Swedish: " open source ",
        Dutch: " open source "
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
                {highlights?.slice(0, 3).map((highlight, index) => (
                  <li key={`top-highlight-${highlight.substring(0, 10)}-${index}`} className="flex items-start">
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
            <WhatsAppIcon size="sm" className="mr-1.5 print:w-4 print:h-4" />
            WhatsApp
          </a>
          <a
            href={calendarLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-2 bg-[#333333] text-white rounded-md hover:bg-opacity-90 transition-colors text-sm print:text-xs"
          >
            <CalendarIcon size="sm" className="mr-1.5 print:w-4 print:h-4" />
            {textMap.scheduleIntro[language]}
          </a>
          <a
            href={`mailto:${emailAddress}`}
            className="inline-flex items-center px-3 py-2 bg-[#0055AA] text-white rounded-md hover:bg-opacity-90 transition-colors text-sm print:text-xs"
          >
            <EmailIcon size="sm" className="mr-1.5 print:w-4 print:h-4" />
            {emailAddress}
          </a>
          <a
            href={githubLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-2 bg-[#24292e] text-white rounded-md hover:bg-opacity-90 transition-colors text-sm print:text-xs"
          >
            <GitHubIcon size="sm" className="mr-1.5 print:w-4 print:h-4" />
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
                {expertise.map((skill) => (
                  <span
                    key={`expertise-${skill}`}
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
                {highlights?.slice(3).map((highlight, index) => (
                  <li key={`additional-highlight-${highlight.substring(0, 10)}-${index}`} className="flex items-start">
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
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-center">
          {textMap.disclaimer.start[language]}
            <span className="font-medium mx-1">{companyName}</span>
            {textMap.disclaimer.middle[language]}
          <a
            href={githubLink}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 font-medium text-blue-600 hover:text-blue-800 transition-colors"
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
