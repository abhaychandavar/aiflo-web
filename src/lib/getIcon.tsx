// lib/getLucideIcon.ts
import {
    Package,
    Terminal,
    Brain,
    Database,
    FolderInput,
    FolderOutput,
    Book,
    CircleUser,
    Code,
    MessageSquare,
    Settings,
    FileText,
    Cpu,
    LayoutDashboard,
    Pen,
    Text,
    Image,
  } from 'lucide-react'
  
  // Map string IDs to Lucide icon components
  const iconMap: Record<string, React.ElementType> = {
    // Group icons
    input: FolderInput,
    output: FolderOutput,
    dev: Code,
    llm: Brain,
    knowledgeBase: Book,
  
    // Node icons
    start: Pen,
    res: MessageSquare,
    'api-request': Terminal,
    'knowledge-base': Database,
    text: Text,
    image: Image,
  
    // Fallback
    default: Package,
  }
  
  export function getIcon(id: string): React.ElementType {
    return iconMap[id] || iconMap['default']
  }
  