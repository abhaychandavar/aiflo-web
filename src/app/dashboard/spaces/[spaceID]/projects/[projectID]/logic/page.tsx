"use client";

import { useEffect, useState } from "react";
import { Search, Grid, List, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import moment from "moment";
import { timeDiffFromNow } from "@/lib/utils";
import AddFlowModal from "./addFlowModal";
import FloCard, { FLOW } from "@/components/flowCard";
import { useParams } from "next/navigation";
import flowService from "@/services/flow";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Dashboard() {
  const { projectID } = useParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("Last Viewed");
  const [flows, setFlows] = useState<Array<FLOW>>([]);
  const [page, setPage] = useState(1);
  let currentPage = 0;
  const { spaceID: spaceIDRaw } = useParams();
  const spaceID = spaceIDRaw as string;
  
  const getFlows = async (page: number) => {
    const res = await flowService.getFlows(projectID as string, page, true, spaceID);
    return res;
  };

  const handleOnFlowDeleted = (id: string) => {
    setFlows(flows.filter((f) => f.id !== id));
  };

  useEffect(() => {
    if (page < currentPage) return;
    getFlows(page).then((res) => {
      const flowList: Array<FLOW> = res.map((f: Record<string, any>) => ({
        id: f.id,
        createdAt: timeDiffFromNow(moment(f.createdAt).local().toDate()),
        name: f.name,
        status: f.status,
        description: f.description,
      }));
      if (page <= currentPage) return;
      currentPage = page;
      setFlows((prev) => [...prev, ...flowList]);
    });
  }, [page]);

  return (
    <div className="flex h-screen">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-border px-6 py-4 flex items-center justify-between">
          <h1>My Flows</h1>
          <div className="flex gap-5 items-center">
            <ThemeToggle />
            <AddFlowModal
              spaceID={spaceID}
              handleFlowAdded={(data: FLOW) =>
                setFlows((prev) => [data, ...prev])
              }
              projectID={projectID as string}
            />
          </div>
        </header>

        {/* Search and Options */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input placeholder="Search" className="pl-10" />
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {sortBy}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortBy("Last Viewed")}>
                  Last Viewed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("Name")}>
                  Name
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("Date Created")}>
                  Date Created
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  All
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>All</DropdownMenuItem>
                <DropdownMenuItem>Forms</DropdownMenuItem>
                <DropdownMenuItem>Workflows</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex border rounded-md overflow-hidden">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                className="h-9 w-9 rounded-none"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon"
                className="h-9 w-9 rounded-none"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-5 ">
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {flows.map((flow) => (
              <FloCard
                spaceID={spaceID}
                onFlowDeleted={handleOnFlowDeleted}
                viewMode={viewMode}
                flow={flow}
                key={flow.id}
                projectID={projectID as string}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
