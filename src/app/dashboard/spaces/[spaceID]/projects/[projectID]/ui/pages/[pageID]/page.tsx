"use client";

import { PageHeader } from "@/components/ui/page-header";
import { ThemeToggle } from "@/components/theme-toggle";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { SaveIndicator } from "@/components/ui/save-indicator";
import { useState } from "react";

export default function PageEditor() {
  const { pageID, projectID, spaceID } = useParams();
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      // TODO: Implement save functionality
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulating API call
      setHasChanges(false);
      setIsSaving(false);
    } catch (error) {
      console.error('Failed to save:', error);
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader 
          title="Page Editor"
          actions={
            <>
              <SaveIndicator 
                status={isSaving ? 'saving' : hasChanges ? 'unsaved' : 'saved'} 
                onSave={handleSave}
              />
              <ThemeToggle />
              <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </>
          }
        />
        
        <div className="flex-1 overflow-hidden p-6">
          <div className="max-w-screen-xl mx-auto">
            {/* Page editor content will go here */}
            <div className="grid grid-cols-12 gap-6">
              {/* Left sidebar - Component Library */}
              <div className="col-span-3 border rounded-lg p-4">
                <h3 className="font-medium mb-4">Components</h3>
                <div className="space-y-2">
                  {/* Component list will go here */}
                  <div className="p-3 border rounded hover:bg-muted cursor-pointer">
                    Text Block
                  </div>
                  <div className="p-3 border rounded hover:bg-muted cursor-pointer">
                    Image
                  </div>
                  <div className="p-3 border rounded hover:bg-muted cursor-pointer">
                    Button
                  </div>
                  <div className="p-3 border rounded hover:bg-muted cursor-pointer">
                    Form
                  </div>
                </div>
              </div>

              {/* Main content - Page Canvas */}
              <div className="col-span-6 border rounded-lg p-4 min-h-[600px]">
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Drag and drop components here
                </div>
              </div>

              {/* Right sidebar - Properties */}
              <div className="col-span-3 border rounded-lg p-4">
                <h3 className="font-medium mb-4">Properties</h3>
                <div className="text-sm text-muted-foreground">
                  Select a component to edit its properties
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 