import type React from "react";
import { useState, useEffect, useRef } from "react";
interface TextWrapProps {
    text: string | undefined;
    name: string;
}

export function TextWrap({ text, name }: TextWrapProps) {
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
    
    useEffect(() => {
        if (edit && editableRef.current) {
            editableRef.current.focus();
            
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
    
    useEffect(() => {
        if (edit && editableRef.current) {
            editableRef.current.textContent = value;
        }
    }, [edit, value]);
    
    return (
        <span className="inline-text" ref={wrapperRef}>
            <input type="hidden" name={name} value={value} onChange={(e) => setValue(e.target.value)} />
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