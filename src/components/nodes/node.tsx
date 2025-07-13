import React, { useEffect, useRef, useState } from 'react'
import { Handle, Position, NodeProps, HandleType } from 'reactflow'
import { ChevronUp, ChevronDown, EllipsisVertical, Trash, Edit, Notebook, Eraser } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '../ui/dropdown-menu'
import { Separator } from '../ui/separator'
import { Textarea } from '../ui/textarea'

interface NodeComponentProps extends NodeProps {
  body?: React.JSX.Element,
  handles: Array<{
    type: HandleType,
    position: Position,
    color?: string,
    about?: string
  }>,
  className?: string,
  options?: Array<React.JSX.Element>,
  onClick?: () => void,
  updateData: (data: Record<string, any>) => any,
  selectedNodeId?: string,
}

const NodeComponent = ({ data, id, body, handles, className, options, onClick, updateData, selected }: NodeComponentProps) => {
  const [collapsed, setCollapsed] = useState(false)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const [renaming, setRenaming] = useState(false)
  const [label, setLabel] = useState(data.label ?? '')
  const [noteStr, setNoteStr] = useState<string | undefined>(data.note)
  const [editNote, setEditNote] = useState(false)

  // Add wheel event handler
  const handleWheel = (event: React.WheelEvent) => {
    const bodyElement = bodyRef.current
    if (!bodyElement) return

    const { scrollHeight, clientHeight, scrollTop } = bodyElement
    const isScrollable = scrollHeight > clientHeight
    
    if (isScrollable) {
      const isAtTop = scrollTop === 0 && event.deltaY < 0
      const isAtBottom = scrollTop + clientHeight === scrollHeight && event.deltaY > 0
      
      if (!isAtTop && !isAtBottom) {
        event.stopPropagation()
      }
    }
  }

  useEffect(() => {
    if (renaming) return
    if (data.label && label !== data.label) {
      updateData({ label })
    }
  }, [renaming])

  useEffect(() => {
    if (editNote) return
    if (noteStr && noteStr !== data.note) {
      updateData({ note: noteStr })
    }
  }, [editNote])

  const deleteNode = () => {
    const customEvent = new CustomEvent('delete-node', {
      detail: { id },
    })
    window.dispatchEvent(customEvent)
  }

  const handleAddNote = () => setEditNote(true)
  const handleDeleteNote = () => {
    setEditNote(false)
    setNoteStr(undefined)
  }

  return (
    <div className={cn('flex flex-col gap-2', className, 'max-w-sm')} onClick={() => onClick?.()}>
      {(noteStr || editNote) && (
        <div className="absolute bottom-[102%] w-full">
          <div className="relative w-full">
            <Textarea
              autoFocus
              value={noteStr || ''}
              onChange={(e) => setNoteStr(e.target.value)}
              className="border-amber-100 outline-none shadow-none bg-yellow-50 resize-none"
              onBlur={() => setEditNote(false)}
              spellCheck={false}
            />
          </div>
        </div>
      )}

      <div
        className={cn(
          'rounded-md border shadow-md relative transition-all bg-card max-h-[600px]',
          data?.runState?.runStartedAt && data?.runState?.status === 'success' ? 'border-2 border-success' : '',
          data?.runState?.runStartedAt && data?.runState?.status === 'error' ? 'border-2 border-destructive' : '',
          selected ? 'border-primary' : ''
        )}
      >
        {handles.map((h, idx) => (
          <Handle
            key={idx}
            type={h.type}
            position={h.position}
            style={{ zIndex: 1, backgroundColor: h.color || '#007BFF', width: 10, height: 10 }}
            about={h.about}
          />
        ))}

        {/* Toolbar */}
        <div
          ref={toolbarRef}
          className={cn(
            'w-full border-b bg-muted flex items-center justify-between px-2 py-1',
            'rounded-md',
            !collapsed ? 'rounded-b-none' : ''
          )}
        >
          {/* Collapse Button + Label */}
          <div className="flex flex-row gap-x-2 items-center">
            <button onClick={() => setCollapsed((prev) => !prev)} className="text-muted-foreground cursor-pointer">
              {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>

            {renaming ? (
              <input
                className="text-xs font-medium text-muted-foreground truncate border rounded-sm px-1 py-0.5 bg-background"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                onBlur={() => setRenaming(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setRenaming(false)
                }}
                autoFocus
              />
            ) : (
              <div className="text-xs font-medium text-muted-foreground truncate">{label}</div>
            )}
          </div>

          <div className="z-50">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <EllipsisVertical className="text-muted-foreground cursor-pointer h-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onSelect={() => setRenaming(true)}>
                    <Edit />
                    Rename
                  </DropdownMenuItem>
                  {!(noteStr || editNote) ? (
                    <DropdownMenuItem onClick={handleAddNote}>
                      <Notebook />
                      Add note
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={handleDeleteNote}>
                      <Eraser />
                      Delete note
                    </DropdownMenuItem>
                  )}
                  {options}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onSelect={deleteNode}>
                  <Trash className="text-destructive" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Body */}
        {!collapsed && (
          <div 
            ref={bodyRef}
            onWheel={handleWheel}
            className="p-2 flex flex-col items-start overflow-y-auto max-h-[400px] hover:overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
          >
            <div className="text-xs font-medium text-gray-400 text-center">{data.nodeName}</div>
            <p className="text-xs text-muted-foreground">{data.description}</p>
            {body && <Separator className="my-2" />}
            {body}
          </div>
        )}
      </div>
    </div>
  )
}

export default NodeComponent
