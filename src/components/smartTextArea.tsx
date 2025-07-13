"use client";

import React, {
    useRef,
    useState,
    useLayoutEffect,
    useEffect,
} from "react";
import { createRoot, Root } from "react-dom/client";

type Option = {
    id: string;
    label: string;
    icon: any;
    bgColorHash: string;
    textColorHash: string
};

export default function SmartTextArea({
    options,
    onChange = (txt) => '',
    value
}: {
    options: Array<Option>;
    onChange?: (text: string) => Promise<any> | any;
    value?: string;
}) {
    const editorRef = useRef<HTMLDivElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const [showPopup, setShowPopup] = useState(false);
    const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
    const reactRoots = useRef<Root[]>([]);
    const isReplacingRef = useRef(false);
    const lastValueRef = useRef<string>('');

    // Helper function to save cursor position
    const saveCursorPosition = () => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 || !editorRef.current) return null;
        
        const range = selection.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(editorRef.current);
        preCaretRange.setEnd(range.startContainer, range.startOffset);
        
        return preCaretRange.toString().length;
    };

    // Helper function to restore cursor position
    const restoreCursorPosition = (position: number) => {
        if (!editorRef.current || position === null) return;
        
        const walker = document.createTreeWalker(
            editorRef.current,
            NodeFilter.SHOW_TEXT,
            null
        );
        
        let currentPosition = 0;
        let textNode = walker.nextNode() as Text;
        
        while (textNode) {
            const nodeLength = textNode.nodeValue?.length || 0;
            
            if (currentPosition + nodeLength >= position) {
                const range = document.createRange();
                const offsetInNode = position - currentPosition;
                range.setStart(textNode, Math.min(offsetInNode, nodeLength));
                range.collapse(true);
                
                const selection = window.getSelection();
                if (selection) {
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
                break;
            }
            
            currentPosition += nodeLength;
            textNode = walker.nextNode() as Text;
        }
    };

    useLayoutEffect(() => {
        if (typeof value === 'string' && value !== lastValueRef.current) {
            // Save cursor position before replacing content
            const cursorPosition = saveCursorPosition();
            
            isReplacingRef.current = true;
            replaceText(value);
            lastValueRef.current = value;
            
            // Restore cursor position after content is replaced
            requestAnimationFrame(() => {
                if (cursorPosition !== null) {
                    restoreCursorPosition(cursorPosition);
                }
                isReplacingRef.current = false;
            });
        }
    }, [value]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "/") {
            e.preventDefault();

            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) return;

            const range = selection.getRangeAt(0);
            if (range.collapsed) {
                const slash = document.createElement("span");
                slash.textContent = "/";

                const span = document.createElement("span");
                span.textContent = "\u200b";
                span.style.display = "inline-block";
                span.style.width = "0";
                span.style.height = "1em";

                range.insertNode(span);
                range.insertNode(slash);

                selection.removeAllRanges();

                const newRange = document.createRange();
                newRange.setStartAfter(span);
                newRange.collapse(true);
                selection.addRange(newRange);

                const rect = span.getBoundingClientRect();
                const containerRect = editorRef.current?.offsetParent?.getBoundingClientRect();
                if (!containerRect) return;

                setPopupPosition({
                    top: rect.top - containerRect.top - 40,
                    left: rect.left - containerRect.left,
                });

                setShowPopup(true);

                setTimeout(() => {
                    span.remove();
                }, 0);
            }
        }

        if (e.key === "Escape") {
            setShowPopup(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const path = e.composedPath?.() || [];
            if (popoverRef.current && !path.includes(popoverRef.current)) {
                setShowPopup(false);
            }
        };

        window.addEventListener("mousedown", handleClickOutside);
        return () => window.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handlePopupItemClick = (id: string) => {
        const option = options.find((opt) => opt.id === id);
        if (!option || !editorRef.current) return;
    
        const target = editorRef.current;
    
        const span = document.createElement("span");
        span.style.display = "inline-block";
        span.contentEditable = "false";
        span.dataset.type = "variable";
        span.dataset.id = option.id;
    
        const root = createRoot(span);
        root.render(
            <span
                className="flex w-fit items-center rounded-md px-2 py-1 gap-2"
                style={{ backgroundColor: option.bgColorHash || undefined, color: option.textColorHash }}
            >
                {option.icon} {option.label}
            </span>
        );
        reactRoots.current.push(root);
    
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) {
            // Fallback: append to end if no selection
            target.appendChild(span);
            const spaceNode = document.createTextNode("\u00A0");
            target.appendChild(spaceNode);
            setShowPopup(false);
            handleOnChange();
            return;
        }
    
        const range = selection.getRangeAt(0);
        
        // Save the current range for insertion
        const insertionRange = range.cloneRange();
        
        // Look for the slash character before the caret
        let slashFound = false;
        let slashRange = null;
        
        // Create a range that goes from the start of the editor to the current caret position
        const searchRange = document.createRange();
        searchRange.setStart(target, 0);
        searchRange.setEnd(range.startContainer, range.startOffset);
        
        // Get the text content up to the caret
        const textBeforeCaret = searchRange.toString();
        
        // Find the last occurrence of '/' in the text before caret
        const lastSlashIndex = textBeforeCaret.lastIndexOf('/');
        
        if (lastSlashIndex !== -1) {
            // Create a tree walker to find the exact text node and position of the slash
            const walker = document.createTreeWalker(
                target,
                NodeFilter.SHOW_TEXT,
                null
            );
            
            let currentPosition = 0;
            let textNode = walker.nextNode() as Text;
            
            while (textNode) {
                const nodeLength = textNode.nodeValue?.length || 0;
                
                if (currentPosition + nodeLength > lastSlashIndex) {
                    // The slash is in this text node
                    const slashPositionInNode = lastSlashIndex - currentPosition;
                    
                    // Create a range for the slash
                    slashRange = document.createRange();
                    slashRange.setStart(textNode, slashPositionInNode);
                    slashRange.setEnd(textNode, slashPositionInNode + 1);
                    slashFound = true;
                    break;
                }
                
                currentPosition += nodeLength;
                textNode = walker.nextNode() as Text;
            }
        }
        
        if (slashFound && slashRange) {
            // Delete the slash
            slashRange.deleteContents();
            
            // Insert the span at the slash position
            slashRange.insertNode(span);
            
            // Add a space after the span
            const spaceNode = document.createTextNode("\u00A0");
            slashRange.setStartAfter(span);
            slashRange.insertNode(spaceNode);
            
            // Position caret after the space
            const newRange = document.createRange();
            newRange.setStartAfter(spaceNode);
            newRange.collapse(true);
            selection.removeAllRanges();
            selection.addRange(newRange);
        } else {
            // No slash found, insert at current caret position
            insertionRange.deleteContents();
            insertionRange.insertNode(span);
            
            const spaceNode = document.createTextNode("\u00A0");
            insertionRange.setStartAfter(span);
            insertionRange.insertNode(spaceNode);
            
            // Position caret after the space
            const newRange = document.createRange();
            newRange.setStartAfter(spaceNode);
            newRange.collapse(true);
            selection.removeAllRanges();
            selection.addRange(newRange);
        }
    
        setShowPopup(false);
        handleOnChange();
    };
    

    const transformNode = (node: Node): string => {
        if (node.nodeType === Node.TEXT_NODE) {
            return node.textContent || "";
        }

        if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement;

            if (el.dataset.type === "variable" && el.dataset.id) {
                return `{${el.dataset.id}}`;
            }

            if (el.tagName === "BR") {
                return "\n";
            }

            const isBlock = ["DIV", "P"].includes(el.tagName);
            const childrenText = Array.from(el.childNodes).map(transformNode).join("");

            return isBlock ? `${childrenText}\n` : childrenText;
        }

        return "";
    };

    const handleCopy = (e: React.ClipboardEvent<HTMLDivElement>) => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        const container = document.createElement("div");
        container.appendChild(range.cloneContents());

        const copiedText = Array.from(container.childNodes).map(transformNode).join("");
        e.preventDefault();
        e.clipboardData.setData("text/plain", copiedText);
    };

    const replaceText = (text: string) => {
        if (!editorRef.current) return;

        // Unmount old react roots
        reactRoots.current.forEach((root) => root.unmount());
        reactRoots.current = [];

        editorRef.current.innerHTML = "";

        const fragment = document.createDocumentFragment();
        const regex = /{([^}]+)}|([^{}]+)/g;
        let match;

        while ((match = regex.exec(text)) !== null) {
            const [fullMatch, id, plainText] = match;

            if (id && options.some(opt => opt.id === id)) {
                const opt = options.find(o => o.id === id);
                if (!opt) continue;

                const span = document.createElement("span");
                span.style.display = "inline-block";
                span.contentEditable = "false";
                span.dataset.type = "variable";
                span.dataset.id = opt.id;

                const root = createRoot(span);
                root.render(
                    <span
                        className="flex w-fit items-center rounded-md px-2 py-1 gap-2"
                        style={{ backgroundColor: opt.bgColorHash || undefined, color: opt.textColorHash }}
                    >
                        {opt.icon} {opt.label}
                    </span>
                );
                reactRoots.current.push(root);

                fragment.appendChild(span);
                fragment.appendChild(document.createTextNode(" "));
            } else if (plainText) {
                const parts = plainText.split(/\n/);
                parts.forEach((part, index) => {
                    if (part) {
                        fragment.appendChild(document.createTextNode(part));
                    }
                    if (index < parts.length - 1) {
                        fragment.appendChild(document.createElement("br"));
                    }
                });
            }
        }

        editorRef.current.appendChild(fragment);
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
        e.preventDefault();
        const text = e.clipboardData.getData("text/plain");
        
        // Get current selection
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;
        
        const range = selection.getRangeAt(0);
        
        // Create fragment for pasted content
        const fragment = document.createDocumentFragment();
        const regex = /{([^}]+)}|([^{}]+)/g;
        let match;

        while ((match = regex.exec(text)) !== null) {
            const [fullMatch, id, plainText] = match;

            if (id && options.some(opt => opt.id === id)) {
                const opt = options.find(o => o.id === id);
                if (!opt) continue;

                const span = document.createElement("span");
                span.style.display = "inline-block";
                span.contentEditable = "false";
                span.dataset.type = "variable";
                span.dataset.id = opt.id;

                const root = createRoot(span);
                root.render(
                    <span
                        className="flex w-fit items-center rounded-md px-2 py-1 gap-2"
                        style={{ backgroundColor: opt.textColorHash || undefined, color: opt.textColorHash }}
                    >
                        {opt.icon} {opt.label}
                    </span>
                );
                reactRoots.current.push(root);
                fragment.appendChild(span);
                fragment.appendChild(document.createTextNode(" "));
            } else if (plainText) {
                const parts = plainText.split(/\n/);
                parts.forEach((part, index) => {
                    if (part) {
                        fragment.appendChild(document.createTextNode(part));
                    }
                    if (index < parts.length - 1) {
                        fragment.appendChild(document.createElement("br"));
                    }
                });
            }
        }

        range.deleteContents();
        range.insertNode(fragment);
        
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);

        handleOnChange();
    };

    const handleCut = (e: React.ClipboardEvent<HTMLDivElement>) => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        const container = document.createElement("div");
        container.appendChild(range.cloneContents());

        const cutText = Array.from(container.childNodes).map(transformNode).join("");
        e.preventDefault();
        e.clipboardData.setData("text/plain", cutText);

        range.deleteContents();

        handleOnChange();
    };

    function getRawText(): string {
        const container = editorRef.current;
        if (!container) return '';
        const text = Array.from(container.childNodes).map(transformNode).join("");
        return text;
    }

    const handleOnChange = () => {
        if (isReplacingRef.current) return;
        const currentText = getRawText();
        lastValueRef.current = currentText;
        onChange(currentText);
    };
    
    return (
        <div className="relative">
            <div
                ref={editorRef}
                contentEditable
                className="min-h-[80px] border border-gray-300 p-4 rounded-md focus:outline-none overflow-y-auto max-h-[150px]"
                onKeyDown={handleKeyDown}
                onCopy={handleCopy}
                onCut={handleCut}
                onPaste={handlePaste}
                onInput={handleOnChange}
                style={{ scrollbarGutter: "stable overlay" }}
            />
            {showPopup && (
                <div
                    ref={popoverRef}
                    className="absolute bg-white border border-gray-300 rounded-md shadow-md p-2 text-sm z-50 flex flex-col gap-2"
                    style={{ top: popupPosition.top, left: popupPosition.left }}
                >
                    {
                    options.map((opt) => (
                        <div
                            key={opt.id}
                            className="flex gap-2 items-center px-2 py-1 cursor-pointer rounded-md"
                            style={{
                                ...(opt.bgColorHash && { backgroundColor: opt.bgColorHash }),
                                ...(opt.textColorHash && { color: opt.textColorHash })
                            }}
                            onClick={() => handlePopupItemClick(opt.id)}
                        >
                            {opt.icon} {opt.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}