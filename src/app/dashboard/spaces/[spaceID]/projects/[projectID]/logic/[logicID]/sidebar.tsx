"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import flowService from "@/services/flow";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { getIcon } from "@/lib/getIcon";
import { GripVertical, ChevronDown, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type GroupedResponse = Record<
  string,
  {
    name: string;
    nodes: Array<{
      id: string;
      label: string;
      type: string;
      parent?: string;
    }>;
  }
>;

export const Sidebar = ({
  projectID,
  spaceID
}: {
  projectID: string,
  spaceID: string
}) => {
  const [search, setSearch] = useState("");
  const [groupedNodes, setGroupedNodes] = useState<GroupedResponse>({});
  const [expandedParentIds, setExpandedParentIds] = useState<Record<string, boolean>>({});
  const router = useRouter()
  
  const toggleExpand = (id: string) => {
    setExpandedParentIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  useEffect(() => {
    (async () => {
      const data: GroupedResponse = await flowService.getNodesLayout(projectID, spaceID);
      setGroupedNodes(data);
    })();
  }, []);

  return (
    <aside className="w-64 bg-background p-4 border-r h-full flex flex-col">
      <div className="flex gap-2">
      <Button variant={'outline'} size={'icon'} onClick={() => router.back()}><ChevronLeft size={14}/></Button>
      <Input
        placeholder="Search nodes..."
        className="mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      </div>
      <ScrollArea className="flex-1 pr-2">
        <Accordion type="multiple" className="w-full gap-2">
          {Object.entries(groupedNodes).map(([groupId, group]) => {
            const GroupIcon = getIcon(groupId);

            const filteredItems = group.nodes.filter((node) =>
              node.label.toLowerCase().includes(search.toLowerCase())
            );

            if (filteredItems.length === 0) return null;

            return (
              <AccordionItem value={groupId} key={groupId}>
                <AccordionTrigger className="text-sm flex gap-2 hover:bg-muted p-2 m-2 no-underline">
                  <div className="flex gap-2 items-center">
                    <GroupIcon className="text-muted-foreground" size={14} />
                    {group.name}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-2">
                    {filteredItems
                      .filter((comp) => !comp.parent)
                      .map((parent) => {
                        const NodeIcon = getIcon(parent.id);
                        const children = filteredItems.filter(
                          (child) => child.parent === parent.id
                        );
                        const isExpanded = expandedParentIds[parent.id];

                        return (
                          <div key={parent.id} className="mb-2">
                            <div
                              className={cn(
                                "bg-background border rounded-md p-2 cursor-pointer hover:bg-accent flex items-center justify-between gap-2 drag-item"
                              )}
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData(
                                  "application/reactflow",
                                  JSON.stringify({ type: parent.type, id: parent.id })
                                );
                                e.dataTransfer.effectAllowed = "move";

                                const node = e.currentTarget;
                                const clone = node.cloneNode(true) as HTMLElement;
                                clone.style.position = "absolute";
                                clone.style.top = "-9999px";
                                clone.style.left = "-9999px";
                                clone.style.borderRadius = "0.375rem";
                                clone.style.boxShadow = "0 0 4px rgba(0, 0, 0, 0.1)";
                                clone.style.background = getComputedStyle(node).backgroundColor;
                                document.body.appendChild(clone);
                                e.dataTransfer.setDragImage(clone, 10, 10);
                                setTimeout(() => document.body.removeChild(clone), 0);
                              }}
                            >
                              <div className="flex items-center gap-2">
                                {children.length > 0 && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleExpand(parent.id);
                                    }}
                                    className="focus:outline-none text-muted-foreground"
                                  >
                                    {isExpanded ? (
                                      <ChevronDown size={14} />
                                    ) : (
                                      <ChevronRight size={14} />
                                    )}
                                  </button>
                                )}
                                <NodeIcon className="w-4 h-4 text-muted-foreground" />
                                {parent.label}
                              </div>
                              <GripVertical size={14} className="text-muted-foreground" />
                            </div>

                            {/* Expandable Children */}
                            {isExpanded && children.length > 0 && (
                              <div className="relative ml-4 pl-4 mt-1 transition-all">
                                <div className="absolute left-2 top-0 bottom-0 w-px bg-muted" />
                                {children.map((child) => {
                                  const ChildIcon = getIcon(child.id);
                                  return (
                                    <div
                                      key={child.id}
                                      className="relative flex items-center justify-between gap-2 mt-1 p-2 pl-4 pr-2 bg-muted border rounded-md cursor-grab hover:bg-accent drag-item"
                                      draggable
                                      onDragStart={(e) => {
                                        e.dataTransfer.setData(
                                          "application/reactflow",
                                          JSON.stringify({ type: child.type, id: child.id })
                                        );
                                        e.dataTransfer.effectAllowed = "move";

                                        const node = e.currentTarget;
                                        const clone = node.cloneNode(true) as HTMLElement;
                                        clone.style.position = "absolute";
                                        clone.style.top = "-9999px";
                                        clone.style.left = "-9999px";
                                        clone.style.borderRadius = "0.375rem";
                                        clone.style.boxShadow = "0 0 4px rgba(0, 0, 0, 0.1)";
                                        clone.style.background = getComputedStyle(node).backgroundColor;
                                        document.body.appendChild(clone);
                                        e.dataTransfer.setDragImage(clone, 10, 10);
                                        setTimeout(() => document.body.removeChild(clone), 0);
                                      }}
                                    >
                                      <div className="absolute left-0 top-1/2 h-px w-4 bg-muted/50 -translate-y-1/2" />
                                      <div className="flex items-center gap-2">
                                        <ChildIcon className="w-4 h-4 text-muted-foreground" />
                                        {child.label}
                                      </div>
                                      <GripVertical size={14} className="text-muted-foreground" />
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </ScrollArea>
    </aside>
  );
};
