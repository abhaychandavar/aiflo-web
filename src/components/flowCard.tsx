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
import flowService from "@/services/flow"
import { toast } from "sonner"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Button } from "./ui/button"
import DeleteModal from "./deleteModal"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Textarea } from "./ui/textarea"

export type FLOW = {
  id: string,
  name: string,
  createdAt: string,
  status: "UNPUBLISHED" | "PUBLISHED",
  description?: string,
}

const FloCard = ({
  viewMode,
  flow,
  onFlowDeleted,
  projectID,
  spaceID
}: {
  viewMode: "grid" | "list",
  flow: FLOW,
  onFlowDeleted: (id: string) => void,
  projectID: string,
  spaceID: string
}) => {
  const router = useRouter()
  const [renaming, setRenaming] = useState(false)
  const [name, setName] = useState(flow.name)
  const [description, setDescription] = useState(flow.description)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const handleDelete = async () => {
    await flowService.deleteFlow(flow.id, projectID, spaceID)
    onFlowDeleted(flow.id)
  }

  const handleNavigateFlow = () => {
    if (isDeleteModalOpen || isEditDialogOpen) return;
    router.push(`/dashboard/spaces/${spaceID}/projects/${projectID}/logic/${flow.id}`)
  }

  const handleSave = async () => {
    try {
      await flowService.saveFlow(projectID, {
        id: flow.id,
        name,
        description
      }, spaceID)
      setIsEditDialogOpen(false)
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
          {flow.status === "PUBLISHED" ? (
            <CircleCheck className="text-success" size={18} />
          ) : (
            <CircleX className="text-destructive" size={18} />
          )}
        </TooltipTrigger>
        <TooltipContent>
          {flow.status === "PUBLISHED" ? "Published" : "Unpublished"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )

  const optionsEle = (
    <div className="z-50">
      <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <EllipsisVertical className="text-muted-foreground cursor-pointer h-3" />
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuLabel>Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault()
              setIsEditDialogOpen(true)
            }}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault()
            setIsDeleteModalOpen(true)
          }}
          className="text-destructive"
        >
          <div className="relative flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive hover:bg-muted">
            <Trash className="text-destructive" />
            Delete
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    {/* Move dialogs here */}
    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <DialogContent>
        <DialogTitle>Edit your flow name and description</DialogTitle>
        <Label>Name</Label>
        <Input onChange={(e) => setName(e.target.value)} value={name} />
        <Label>Description</Label>
        <Textarea onChange={(e) => setDescription(e.target.value)} value={description} />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <DeleteModal
      title={`Are you sure you want to delete ${flow.name}?`}
      deleteFailedText={`Could not delete flow ${flow.name}`}
      deleteSuccessText={`Flow ${flow.name} deleted`}
      onDelete={handleDelete}
      isOpen={isDeleteModalOpen}
      onOpenChange={setIsDeleteModalOpen}
    />
  </>
    </div>
  )

  return (
    <>
      {viewMode === "grid" ? (
        <Card
          key={flow.id}
          className="cursor-pointer"
          onClick={handleNavigateFlow}
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
              {description || "Flow"}
            </p>
          </CardHeader>
          <CardFooter className="text-xs text-muted-foreground pt-0">
            {flow.createdAt}
          </CardFooter>
        </Card>
      ) : (
        <div
          key={flow.id}
          className="flex items-center justify-between p-4 rounded-lg border cursor-pointer"
          onClick={handleNavigateFlow}
        >
          <div className="flex items-center space-x-4">
            {statusIcon}
            <div>
              <h3 className="font-medium">
                {renaming ? (
                  <Input
                    className="text-xl font-medium text-muted-foreground truncate border rounded-sm px-1 py-0.5 bg-background"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => setRenaming(false)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setRenaming(false)
                        flowService.saveFlow(projectID, {
                          id: flow.id,
                          name,
                        }, spaceID)
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                  />
                ) : (
                  name
                )}
              </h3>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="You can describe your flow here"
                onClick={(e) => e.preventDefault()}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setRenaming(false)
                    flowService.saveFlow(projectID, {
                      id: flow.id,
                      description,
                    }, spaceID)
                  }
                }}
              />
              <p className="text-sm text-muted-foreground">
                {description || "Flow"}
              </p>
            </div>
          </div>
          <div className="flex flex-row items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {flow.createdAt}
            </span>
            {optionsEle}
          </div>
        </div>
      )}
    </>
  )
}

export default FloCard
