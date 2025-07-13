"use client"

import { ReactNode, useState, createContext, useContext, useEffect } from "react"
import { Separator } from "./separator";
import { Button } from "./button";
import { X } from "lucide-react";

// Context for sharing state between components
const SidePanelContext = createContext<{
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    title?: ReactNode;
    description?: ReactNode;
    body?: ReactNode;
    setTitle: (title: ReactNode) => void;
    setDescription: (description: ReactNode) => void;
    setBody: (body: ReactNode) => void;
} | null>(null);

const useSidePanel = () => {
    const context = useContext(SidePanelContext);
    if (!context) {
        throw new Error("SidePanel components must be used within SidePanel");
    }
    return context;
};

interface SidePanelProps {
    children: ReactNode;
    open?: boolean;
    onClose?: () => any;
}

const VerticalGroup = ({ children }: { children: ReactNode }) => {
    return <div className="flex flex-col gap-2 pl-5 pr-5">
        {children}
    </div>
}

const SidePanel = ({ children, open, onClose }: SidePanelProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);
    const [title, setTitle] = useState<ReactNode>(null);
    const [description, setDescription] = useState<ReactNode>(null);
    const [body, setBody] = useState<ReactNode>(null);

    useEffect(() => {
        if (open === undefined) return;
        if (open) {
            setShouldRender(true);
            setTimeout(() => setIsOpen(true), 10);
        } else {
            setIsOpen(false);
            setTimeout(() => setShouldRender(false), 300);
        }
    }, [open]);

    const handleClose = () => {
        setIsOpen(false);
        setTimeout(() => {
            setShouldRender(false);
            onClose?.();
        }, 300);
    };

    return (
        <SidePanelContext.Provider value={{
            isOpen,
            setIsOpen: handleClose,
            title,
            description,
            body,
            setTitle,
            setDescription,
            setBody
        }}>
            {children}
            {shouldRender && (
                <>
                    {/* Side panel */}
                    <div className={`absolute right-0 top-0 z-50 h-full w-100 bg-background border-l shadow-lg transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                        }`}>
                        <div className="flex flex-col gap-5 overflow-y-auto h-full">
                            {/* Header */}
                            <div className="flex justify-between items-center p-5">
                                {title}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClose}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            {description ? <Separator /> : <></>}
                            {description ? <VerticalGroup>
                                <h2>Description</h2>
                                {description}
                            </VerticalGroup> : <></>}
                            <Separator className="mb-4" />
                            <div className="">
                                {body}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </SidePanelContext.Provider>
    );
};

const SidePanelTrigger = ({ children }: { children: ReactNode }) => {
    const { setIsOpen } = useSidePanel();

    return (
        <div onClick={() => setIsOpen(true)}>
            {children}
        </div>
    );
};

const SidePanelBody = ({ children }: { children: ReactNode }) => {
    const { setBody } = useSidePanel();

    useEffect(() => {
        setBody(children);
        return () => setBody(null);
    }, [children, setBody]);

    return null;
};

const SidePanelTitle = ({ children }: { children: ReactNode }) => {
    const { setTitle } = useSidePanel();

    useEffect(() => {
        setTitle(<>{children}</>);
        return () => setTitle(null);
    }, [children, setTitle]);

    return null;
};

const SidePanelDescription = ({ children }: { children: ReactNode }) => {
    const { setDescription } = useSidePanel();

    useEffect(() => {
        setDescription(<p className="text-xs text-muted-foreground">{children}</p>);
        return () => setDescription(null);
    }, [children, setDescription]);

    return null;
};

export { SidePanel, SidePanelTrigger, SidePanelBody, SidePanelTitle, SidePanelDescription };
export default SidePanel;