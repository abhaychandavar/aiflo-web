"use client"

import {
  CircleCheck,
  CircleX,
  Edit,
  EllipsisVertical,
  Trash,
} from "lucide-react"
import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip"
import { toast } from "sonner"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "./ui/dialog"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Button } from "./ui/button"
import DeleteModal from "./deleteModal"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Textarea } from "./ui/textarea"
import projectService from "@/services/project"

export type PROJECT = {
  id: string,
  name: string,
  user: {
    id: string,
    name?: string,
    imageURL?: string,
  },
  createdAt: string,
  status: "UNPUBLISHED" | "PUBLISHED",
  description?: string,
}

const ProjectCard = ({
  viewMode,
  project,
  onProjectDeleted,
  spaceID
}: {
  viewMode: "grid" | "list",
  project: PROJECT,
  onProjectDeleted: (id: string) => void,
  spaceID: string
}) => {
  const router = useRouter()
  const [name, setName] = useState(project.name)
  const [description, setDescription] = useState(project.description)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const handleDelete = async () => {
    try {
      await projectService.deleteProject(project.id, spaceID)
      onProjectDeleted(project.id)
    } catch (err) {
      console.debug(err)
      toast.error("Could not delete project")
    }
  }

  const handleNavigateProject = () => {
    router.push(`/dashboard/spaces/${spaceID}/projects/${project.id}/logic`)
  }

  const handleSave = async () => {
    try {
      await projectService.saveProject(spaceID, {
        id: project.id,
        name,
        description
      })
      setIsEditModalOpen(false)
      toast.success("Changes saved")
    } catch (err) {
      console.debug(err)
      toast.error("Could not save changes")
    }
  }

  const statusIcon = (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          {project.status === "PUBLISHED" ? (
            <CircleCheck className="text-success" size={18} />
          ) : (
            <CircleX className="text-destructive" size={18} />
          )}
        </TooltipTrigger>
        <TooltipContent>
          {project.status === "PUBLISHED" ? "Published" : "Unpublished"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )

  const optionsEle = (
    <div className="z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <EllipsisVertical className="text-muted-foreground cursor-pointer h-3" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-56"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenuLabel>Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              onSelect={(e) => {
                setIsEditModalOpen(true)
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="text-destructive" 
            onSelect={(e) => {
              setIsDeleteModalOpen(true)
            }}
          >
            <div
              className={cn(
                "relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive hover:bg-muted"
              )}
            >
              <Trash className="text-destructive" />
              Delete
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )

  return (
    <>
      {viewMode === "grid" ? (
        <Card
          key={project.id}
          className="cursor-pointer"
          onClick={handleNavigateProject}
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg font-medium">{name}</CardTitle>
              <div className="flex flex-row items-center gap-2">
                {statusIcon}
                {optionsEle}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {description || "Project"}
            </p>
          </CardHeader>
          <CardFooter className="text-xs text-muted-foreground pt-0">
            {project.createdAt}
          </CardFooter>
        </Card>
      ) : (
        <div
          key={project.id}
          className="flex items-center justify-between p-4 rounded-lg border cursor-pointer"
          onClick={handleNavigateProject}
        >
          <div className="flex items-center space-x-4">
            {statusIcon}
            <div>
              <h3 className="font-medium">{name}</h3>
              <p className="text-sm text-muted-foreground">
                {description || "Project"}
              </p>
            </div>
          </div>
          <div className="flex flex-row items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {project.createdAt}
            </span>
            {optionsEle}
          </div>
        </div>
      )}

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogTitle>Edit your project name and description</DialogTitle>
          <Label>Name</Label>
          <Input onChange={(e) => setName(e.target.value)} value={name} />
          <Label>Description</Label>
          <Textarea
            onChange={(e) => setDescription(e.target.value)}
            value={description}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onOpenChange={() => setIsDeleteModalOpen(false)}
        deleteFailedText={`Could not delete project ${project.name}`}
        deleteSuccessText={`Project ${project.name} deleted`}
        onDelete={handleDelete}
        title={`Are you sure you want to delete ${project.name}?`}
      />
    </>
  )
}

export default ProjectCard;