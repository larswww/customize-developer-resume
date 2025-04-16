import type React from "react";
import { use, useState, useRef, useEffect } from "react";
import { ArrayRenderer } from "~/components/common/ArrayRenderer";
import type { SimpleConsultantData } from "~/config/templates/simple";

// Helper to ensure URL starts with https://
const ensureHttps = (url: string): string => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  // Handle cases like linkedin.com/in/username
  if (url.includes(".")) {
    // Basic check if it looks like a domain
    return `https://${url}`;
  }
  // Assume it's something like a handle (less likely for portfolio, maybe linkedin)
  // This part might need refinement based on expected input format
  if (url.includes("/")) {
    // Simple check for path like linkedin
    return `https://${url}`;
  }
  // Fallback - might not be a valid URL scenario
  return url;
};

interface SimpleTemplateProps {
  data: SimpleConsultantData;
}

function TextWrap({ text }: { text: string | undefined }) {
    const [value, setValue] = useState(text || '');
    const [edit, setEdit] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const editableRef = useRef<HTMLSpanElement>(null);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && 
                !wrapperRef.current.contains(event.target as Node) && 
                edit) {
                setEdit(false);
                if (editableRef.current) {
                    setValue(editableRef.current.textContent || '');
                }
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [edit]);
    
    // Focus when edit mode is activated
    useEffect(() => {
        if (edit && editableRef.current) {
            editableRef.current.focus();
            
            // Place cursor at end of text
            const range = document.createRange();
            const selection = window.getSelection();
            if (editableRef.current.childNodes.length > 0) {
                const lastNode = editableRef.current.childNodes[editableRef.current.childNodes.length - 1];
                range.setStart(lastNode, lastNode.textContent?.length || 0);
                range.collapse(true);
                selection?.removeAllRanges();
                selection?.addRange(range);
            }
        }
    }, [edit]);
    
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            setEdit(false);
            if (editableRef.current) {
                setValue(editableRef.current.textContent || '');
            }
        }
        e.stopPropagation();
    };
    
    const handleActivate = (e: React.MouseEvent | React.KeyboardEvent) => {
        e.stopPropagation();
        setEdit(true);
    };
    
    // Set content when mounting editable element
    useEffect(() => {
        if (edit && editableRef.current) {
            editableRef.current.textContent = value;
        }
    }, [edit, value]);
    
    return (
        <span className="inline-text" ref={wrapperRef}>
            {edit ? (
                <span
                    ref={editableRef}
                    contentEditable
                    suppressContentEditableWarning
                    className="outline-none break-words whitespace-pre-wrap"
                    onClick={(e) => e.stopPropagation()}
                    onBlur={() => {
                        setEdit(false);
                        if (editableRef.current) {
                            setValue(editableRef.current.textContent || '');
                        }
                    }}
                    onKeyDown={handleKeyDown}
                />
            ) : (
                <span 
                    className="cursor-text"
                    onClick={handleActivate}
                    onKeyDown={handleActivate}

                >
                    {value}
                </span>
            )}
        </span>
    );
}

const SimpleTemplate: React.FC<SimpleTemplateProps> = ({ data }) => {
  const { contactInfo, summary, employmentHistory, education } = data;

  return (
    <div className="p-8 font-sans text-sm bg-white">
      <header className="mb-6 text-center pb-2">
        <h1 className="text-3xl font-bold text-gray-800">
          <TextWrap text={contactInfo.name} />
        </h1>
        <p className="text-lg text-gray-600 mt-1"><TextWrap text={contactInfo.title} /></p>
        <div className="text-xs text-gray-500 mt-2 space-x-2 flex flex-wrap justify-center items-center gap-x-3 gap-y-1">
          <span><TextWrap text={contactInfo.location}/></span>
          <span className="text-gray-300">&bull;</span>
          <span><TextWrap text={contactInfo.phone} /></span>
          <span className="text-gray-300">&bull;</span>
          <a
            href={`mailto:${contactInfo.email}`}
            className="text-blue-600 hover:underline"
          >
            <TextWrap text={contactInfo.email} />
          </a>
          {contactInfo.linkedin && (
            <>
              <span className="text-gray-300">&bull;</span>
              <a
                href={ensureHttps(contactInfo.linkedin)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                <TextWrap text="LinkedIn" />
              </a>
            </>
          )}
          {contactInfo.portfolio && (
            <>
              <span className="text-gray-300">&bull;</span>
              <a
                href={ensureHttps(contactInfo.portfolio)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                <TextWrap text="Portfolio" />
              </a>
            </>
          )}
        </div>
      </header>

      {summary && (
        <section className="mb-6 text-base text-gray-700 pb-2 text-center italic">
          <p><TextWrap text={summary} /></p>
        </section>
      )}

      {employmentHistory && employmentHistory.length > 0 && (
		
        <section className="mb-4">
          <h2 className="text-xl font-semibold border-b pb-1 mb-4 text-gray-800">
            <TextWrap text="Experience" />
          </h2>

		  <ArrayRenderer
			items={employmentHistory}
			getKey={(employment) => employment.employer}
			renderItem={(employment, empIndex) => (
				<div
				  key={`emp-${employment.employer}-${empIndex}`}
				  className="mb-6 pb-3 border-b border-gray-100 last:border-b-0"
				>
				  <h3 className="text-lg">
					<span className="font-normal text-gray-600">
					  <TextWrap text={employment.title} />
					</span>
					<span className="text-gray-800 font-semibold">
					  {" "}
					  at <TextWrap text={employment.employer} />
					</span>
				  </h3>
				  <p className="text-xs text-gray-500 mb-3">
					<TextWrap text={employment.dates} /> | <TextWrap text={employment.location} />
				  </p>
	
				  {employment.projects && employment.projects.length > 0 && (
					<div className="mt-1 space-y-4">
					  <ArrayRenderer
                        items={employment.projects}
                        getKey={(project, projectIndex) => `${project.client}-${projectIndex}`}
                        renderItem={(project, projectIndex) => (
                          <div
                            key={`p-${empIndex}-${project.client}-${projectIndex}`}
                            className="pb-2 last:pb-0"
                          >
                            <div className="flex items-baseline justify-between flex-wrap mb-1.5">
                              <h4 className="font-normal text-sm mr-4">
                                <span className="text-gray-700 font-medium mr-1.5">
                                  <TextWrap text={project.client} />
                                </span>
                              </h4>
      
                              {project.skillsUsed &&
                                project.skillsUsed.length > 0 && (
                                  <ul className="flex flex-wrap gap-x-1.5 gap-y-1 text-xs">
                                    <ArrayRenderer
                                      items={project.skillsUsed}
                                      getKey={(skill, skillIndex) => `${skill}-${skillIndex}`}
                                      renderItem={(skill, skillIndex) => (
                                        <li
                                          key={`p${empIndex}-${projectIndex}-s${skillIndex}-${skill}`}
                                          className="bg-gray-100 text-gray-600 px-1.5 py-0 rounded-sm border border-gray-200 text-xs"
                                        >
                                          <TextWrap text={skill} />
                                        </li>
                                      )}
                                    />
                                  </ul>
                                )}
                            </div>
      
                            {project.description &&
                              project.description.length > 0 && (
                                <ul className="list-disc list-inside text-sm mt-1 ml-4 space-y-1 text-gray-700">
                                  <ArrayRenderer
                                    items={project.description}
                                    getKey={(desc, descIndex) => `${desc.slice(0, 10)}-${descIndex}`}
                                    renderItem={(desc, descIndex) => (
                                      <li
                                        key={`p${empIndex}-d${projectIndex}-${descIndex}-${desc.slice(
                                          0,
                                          10
                                        )}`}
                                      >
                                        <TextWrap text={desc} />
                                      </li>
                                    )}
                                  />
                                </ul>
                              )}
                          </div>
                        )}
                      />
					</div>
				  )}
				</div>
			  )}
		  />
        </section>
      )}

      {education && education.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xl font-semibold border-b pb-1 mb-3 text-gray-800">
            <TextWrap text="Education" />
          </h2>
          <ArrayRenderer
            items={education}
            getKey={(edu, eduIndex) => `${edu.institution}-${edu.degree}-${eduIndex}`}
            renderItem={(edu, eduIndex) => (
              <div
                key={`edu-${edu.institution}-${edu.degree}-${eduIndex}`}
                className="mb-2 last:mb-0"
              >
                <h3 className="font-semibold text-base text-gray-800">
                  <TextWrap text={edu.degree} />
                </h3>
                <p className="text-xs text-gray-500">
                  {" "}
                  <TextWrap text={edu.institution} /> | <TextWrap text={edu.dates} /> | <TextWrap text={edu.location} />
                </p>
              </div>
            )}
          />
        </section>
      )}
    </div>
  );
};

export default SimpleTemplate;
