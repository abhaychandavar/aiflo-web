import { Check, Loader2, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface SaveIndicatorProps {
  status: 'saved' | 'saving' | 'unsaved';
  onSave?: () => void;
  className?: string;
}

export function SaveIndicator({ status, onSave, className }: SaveIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {status === 'saved' && (
        <div className="flex items-center gap-2 text-sm">
          <Check className="h-4 w-4 text-green-500" />
          <span className="text-green-500">Saved</span>
        </div>
      )}
      {status === 'saving' && (
        <div className="flex items-center gap-2 text-sm">
          <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
          <span className="text-muted-foreground">Saving...</span>
        </div>
      )}
      {status === 'unsaved' && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={onSave}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          Save
        </Button>
      )}
    </div>
  );
} 