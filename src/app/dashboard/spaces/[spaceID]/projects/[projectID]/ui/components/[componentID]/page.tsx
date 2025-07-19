"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Save, Square, Type, Image as ImageIcon, Box, GripVertical, Download, Upload } from "lucide-react";
import { SaveIndicator } from "@/components/ui/save-indicator";
import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SearchBar } from "@/components/ui/search-bar";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { TopBar } from "@/components/ui/top-bar";
import SidePanel, { SidePanelBody, SidePanelDescription, SidePanelTitle } from "@/components/ui/sidePanel";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { 
  EditorState, 
  UIElement, 
  ElementType as UIElementType,
  ContainerElement,
  InputElement,
  ButtonElement,
  ImageElement 
} from "@/types/editor";

type ElementType = {
  id: string;
  type: UIElementType;
  icon: React.ReactNode;
  label: string;
  description: string;
  defaultProps?: Partial<UIElement>;
}

type ElementGroups = {
  [key: string]: {
    name: string;
    elements: ElementType[];
  }
}

const ELEMENT_GROUPS: ElementGroups = {
  basic: {
    name: "Basic Elements",
    elements: [
      {
        id: 'input',
        type: 'input',
        icon: <Type className="h-4 w-4 text-muted-foreground" />,
        label: 'Input',
        description: 'Text input field for forms',
        defaultProps: {
          props: {
            placeholder: 'Enter text...',
          }
        }
      },
      {
        id: 'button',
        type: 'button',
        icon: <Square className="h-4 w-4 text-muted-foreground" />,
        label: 'Button',
        description: 'Clickable button element',
        defaultProps: {
          props: {
            label: 'Button',
            variant: 'default'
          }
        }
      },
      {
        id: 'image',
        type: 'image',
        icon: <ImageIcon className="h-4 w-4 text-muted-foreground" />,
        label: 'Image',
        description: 'Image display element',
        defaultProps: {
          props: {
            aspectRatio: '16/9'
          }
        }
      },
      {
        id: 'container',
        type: 'container',
        icon: <Box className="h-4 w-4 text-muted-foreground" />,
        label: 'Container',
        description: 'Box that can hold other elements',
        defaultProps: {
          children: []
        }
      }
    ]
  }
};

export default function ComponentEditor() {
  const { componentID, projectID, spaceID } = useParams();
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [search, setSearch] = useState("");
  const [editorState, setEditorState] = useState<EditorState>({
    version: "1.0",
    elements: [],
    metadata: {
      name: componentID as string,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  });
  const [selectedElement, setSelectedElement] = useState<UIElement | null>(null);
  const [sidePanel, setSidePanel] = useState<{
    isOpen: boolean;
    element: UIElement | null;
  }>({
    isOpen: false,
    element: null
  });

  const serializeState = useCallback((): string => {
    return JSON.stringify(editorState);
  }, [editorState]);

  const deserializeState = useCallback((serializedState: string) => {
    try {
      const parsed = JSON.parse(serializedState) as EditorState;
      setEditorState(parsed);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to parse editor state:', error);
    }
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const serializedState = serializeState();
      // TODO: Save to backend
      console.log('Saving state:', serializedState);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setHasChanges(false);
      setIsSaving(false);
    } catch (error) {
      console.error('Failed to save:', error);
      setIsSaving(false);
    }
  };

  const handleExport = () => {
    const serializedState = serializeState();
    const blob = new Blob([serializedState], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${componentID}-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        deserializeState(content);
      }
    };
    reader.readAsText(file);
  };

  const createUIElement = (elementType: ElementType, parentId?: string): UIElement => {
    const baseElement = {
      id: `${elementType.type}-${Date.now()}`,
      type: elementType.type,
      parentId,
      ...elementType.defaultProps
    };

    switch (elementType.type) {
      case 'container':
        return {
          ...baseElement,
          type: 'container',
          children: []
        } as ContainerElement;
      case 'input':
        return {
          ...baseElement,
          type: 'input',
          props: {
            placeholder: 'Enter text...',
          }
        } as InputElement;
      case 'button':
        return {
          ...baseElement,
          type: 'button',
          props: {
            label: 'Button',
            variant: 'default'
          }
        } as ButtonElement;
      case 'image':
        return {
          ...baseElement,
          type: 'image',
          props: {
            aspectRatio: '16/9'
          }
        } as ImageElement;
      default:
        throw new Error(`Unknown element type: ${elementType.type}`);
    }
  };

  const handleDrop = (event: React.DragEvent, parentId?: string) => {
    event.preventDefault();
    event.stopPropagation();
    
    const elementData = JSON.parse(event.dataTransfer.getData('application/json')) as ElementType;
    const newElement = createUIElement(elementData, parentId);
    
    setEditorState(prev => {
      const updated = { ...prev };
      
      if (parentId) {
        // Find the parent container and add the new element to its children
        const updateChildren = (elements: UIElement[]): UIElement[] => {
          return elements.map(el => {
            if (el.id === parentId && el.type === 'container') {
              return {
                ...el,
                children: [...el.children, newElement]
              };
            } else if (el.type === 'container') {
              return {
                ...el,
                children: updateChildren(el.children)
              };
            }
            return el;
          });
        };
        
        updated.elements = updateChildren(updated.elements);
      } else {
        // Add to root level
        updated.elements = [...updated.elements, newElement];
      }
      
      updated.metadata = {
        ...updated.metadata,
        updatedAt: new Date().toISOString()
      };
      
      return updated;
    });
    
    setHasChanges(true);
  };

  const renderElement = (element: UIElement): React.ReactNode => {
    switch (element.type) {
      case 'container':
        return (
          <Container
            key={element.id}
            className="flex-1 min-h-[calc(100%-2rem)] p-6 relative"
            onClick={(e) => {
              e.stopPropagation();
              handleElementClick(element);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.dataTransfer.dropEffect = 'move';
            }}
            onDrop={(e) => handleDrop(e, element.id)}
          >
            {element.children.length > 0 ? (
              <div className="flex flex-col h-full gap-6">
                {element.children.map(child => renderElement(child))}
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">
                Drop elements here
              </div>
            )}
          </Container>
        );
      case 'input':
        return (
          <div
            key={element.id}
            className="p-6"
            onClick={(e) => {
              e.stopPropagation();
              handleElementClick(element);
            }}
          >
            <Input 
              placeholder={element.props.placeholder} 
              className="w-full"
              disabled={element.props.disabled}
            />
          </div>
        );
      case 'button':
        return (
          <div
            key={element.id}
            className="p-6"
            onClick={(e) => {
              e.stopPropagation();
              handleElementClick(element);
            }}
          >
            <Button variant={element.props.variant} disabled={element.props.disabled}>
              {element.props.label}
            </Button>
          </div>
        );
      case 'image':
        return (
          <div
            key={element.id}
            className="p-6"
            onClick={(e) => {
              e.stopPropagation();
              handleElementClick(element);
            }}
          >
            <div 
              className="w-full h-full border rounded-md flex items-center justify-center bg-muted"
              style={{ aspectRatio: element.props.aspectRatio }}
            >
              {element.props.src ? (
                <img 
                  src={element.props.src} 
                  alt={element.props.alt || ''} 
                  className="w-full h-full object-cover rounded-md"
                />
              ) : (
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
          </div>
        );
    }
  };

  const handleElementClick = (element: ElementType | UIElement) => {
    if ('props' in element || element.type === 'container') {
      setSidePanel({
        isOpen: true,
        element: element as UIElement
      });
    }
  };

  const filteredGroups = Object.entries(ELEMENT_GROUPS).reduce<ElementGroups>((acc, [key, group]) => {
    const filteredElements = group.elements.filter(
      element => element.label.toLowerCase().includes(search.toLowerCase())
    );
    if (filteredElements.length > 0) {
      acc[key] = {
        ...group,
        elements: filteredElements
      };
    }
    return acc;
  }, {});

  return (
    <div className="flex h-screen">
      {/* Left Sidebar - Elements Panel */}
      <aside className="w-64 bg-background border-r h-full flex flex-col">
        <div className="p-4">
          <SearchBar
            placeholder="Search elements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <ScrollArea className="flex-1">
          <div className="px-4 pb-4">
            <Accordion type="multiple" className="w-full gap-2">
              {Object.entries(filteredGroups).map(([groupId, group]) => (
                <AccordionItem value={groupId} key={groupId}>
                  <AccordionTrigger className="text-sm flex gap-2 hover:bg-muted p-2 m-2 no-underline">
                    <div className="flex gap-2 items-center">
                      {group.name}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pl-2">
                      {group.elements.map((element) => (
                        <div
                          key={element.id}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('application/json', JSON.stringify(element));
                            e.dataTransfer.effectAllowed = 'move';
                          }}
                          onClick={() => handleElementClick(element)}
                          className="bg-background border rounded-md p-2 cursor-pointer hover:bg-accent flex items-center justify-between gap-2 drag-item mb-2"
                        >
                          <div className="flex items-center gap-2">
                            {element.icon}
                            <span className="text-sm">{element.label}</span>
                          </div>
                          <GripVertical size={14} className="text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </ScrollArea>
      </aside>

      <div className="flex-1 flex flex-col">
        <TopBar
          variant="canvas"
          left={<h1>{componentID}</h1>}
          right={
            <>
              <SaveIndicator 
                status={isSaving ? 'saving' : hasChanges ? 'unsaved' : 'saved'} 
                onSave={handleSave}
              />
              <ThemeToggle />
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <label>
                <Button variant="outline" asChild>
                  <div>
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={handleImport}
                    />
                  </div>
                </Button>
              </label>
              <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </>
          }
        />
        
        {/* Main Content - Design Canvas */}
        <div className="flex-1 p-6">
          <Card className="h-full border-2 border-dashed">
            <div 
              className="w-full h-full p-6"
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
              }}
              onDrop={(e) => handleDrop(e)}
            >
              {editorState.elements.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground text-center">
                  <div>
                    <p>Drag and drop elements here</p>
                    <p className="text-sm">Components will be arranged automatically</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col h-full gap-6">
                  {editorState.elements.map(element => renderElement(element))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Side Panel */}
        <SidePanel
          open={sidePanel.isOpen}
          onClose={() => setSidePanel({ isOpen: false, element: null })}
        >
          <SidePanelTitle>
            <div className="flex gap-2">
              <h1>{sidePanel.element?.type}</h1>
              <Badge variant="secondary">{sidePanel.element?.id}</Badge>
            </div>
          </SidePanelTitle>
          <SidePanelBody>
            <div className="p-4">
              {/* Element properties will go here */}
              <p className="text-muted-foreground">Element properties coming soon...</p>
            </div>
          </SidePanelBody>
        </SidePanel>
      </div>
    </div>
  );
} 