import { useEffect, useState } from "react";
import { Search, Grid, List, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import moment from "moment";
import { timeDiffFromNow } from "@/lib/utils";
import projectService from "@/services/project";
import AddProjectModal from "./addProjectModal";
import ProjectCard, { PROJECT } from "@/components/projectCard";
import Sidebar from "../../components/sidebar";
import spaceService from "@/services/space";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SPACE } from "@/types/common";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Dashboard() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("Last Viewed");
  const [projects, setProjects] = useState<Array<PROJECT>>([]);
  const [page, setPage] = useState(1);
  const [spaces, setSpaces] = useState<Array<SPACE>>([]);
  const [spaceID, setSpaceID] = useState<string>();

  let currentPage = 0;
  async function initSpaces() {
    const spaces = await spaceService.getSpaces();
    setSpaces(spaces);
    setSpaceID(spaces[0].id);
  }

  const getProjects = async (page: number) => {
    if (!spaceID) return [];
    const res = await projectService.getProjects(page, true, spaceID);
    return res;
  };

  const handleOnProjectDeleted = (id: string) => {
    setProjects(projects.filter((f) => f.id !== id));
  };

  const router = useRouter()

  useEffect(() => {
    initSpaces();
  }, []);

  useEffect(() => {
    if (!spaceID) return;
    if (page < currentPage) return;
    getProjects(page).then((res) => {
      const projectList: Array<PROJECT> = res.map((f: Record<string, any>) => ({
        id: f.id,
        createdAt: timeDiffFromNow(moment(f.createdAt).local().toDate()),
        name: f.name,
        status: f.status,
        user: {
          id: f.user.id,
          imageURL: f.user.imageURL,
          name: f.user.name,
        },
        description: f.description,
      }));
      if (page <= currentPage) return;
      currentPage = page;
      setProjects((prev) => [...prev, ...projectList]);
    });
  }, [page, spaceID]);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar>
        {spaces.length && (
          <Select
            onValueChange={(spaceID: string) => {
              const space = spaces.find((s) => s.id === spaceID);
              if (!space) return;
              setSpaceID(space.id);
            }}
            value={spaceID}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select space" />
            </SelectTrigger>
            <SelectContent>
              {spaces.map((space) => (
                <SelectItem key={space.id} value={space.id}>
                  {space.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Button variant={'outline'} onClick={() => {
            router.push(`/dashboard/spaces/${spaceID}/knowledge-base`)
          }}>Knowledge base <ChevronRight className="text-muted-foreground" size={14}/></Button>
      </Sidebar>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-border px-6 py-4 flex items-center justify-between">
          <h1>My Projects</h1>
          <div className="flex gap-5 items-center">
            <ThemeToggle />
            <AddProjectModal
              spaceID={spaceID}
              handleProjectAdded={(data: PROJECT) =>
                setProjects((prev) => [data, ...prev])
              }
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
            {spaceID && projects.map((project) => (
              <ProjectCard
                onProjectDeleted={handleOnProjectDeleted}
                viewMode={viewMode}
                project={project}
                key={project.id}
                spaceID={spaceID}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
