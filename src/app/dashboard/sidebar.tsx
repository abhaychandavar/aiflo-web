'use client'

import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

const dummyComponents = [
  { id: 'start', label: 'Input', type: 'start' },
  { id: 'res', label: 'Output', type: 'res' },
  { id: 'api-request', label: 'API Request', type: 'api-request' },
  { id: 'llm', label: 'llm', type: 'llm' },
  { id: 'document', label: 'Document', type: 'document' },
]

export const Sidebar = () => {
  const [search, setSearch] = useState('')

  const filtered = dummyComponents.filter((c) =>
    c.label.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <aside className="w-64 bg-muted p-4 border-r h-full flex flex-col">
      <Input
        placeholder="Search components..."
        className="mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <ScrollArea className="flex-1">
        <div className="space-y-2">
          {filtered.map((comp) => (
            <div
              key={comp.id}
              className={cn(
                'bg-background border rounded-md p-2 cursor-grab hover:bg-accent',
                'drag-item'
              )}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('application/reactflow', JSON.stringify({type: comp.type, id: comp.id}))
                e.dataTransfer.effectAllowed = 'move'
              }}
            >
              {comp.label}
            </div>
          ))}
        </div>
      </ScrollArea>
    </aside>
  )
}
