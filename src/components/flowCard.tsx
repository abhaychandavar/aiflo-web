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
} from "./ui/dialog"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Button } from "./ui/button"
import DeleteModal from "./deleteModal"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Textarea } from "./ui/textarea"

export type FLO_CARD = {
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

const FloCard = ({
  viewMode,
  flow,
  onFlowDeleted,
}: {
  viewMode: "grid" | "list",
  flow: FLO_CARD,
  onFlowDeleted: (id: string) => void,
}) => {
  const router = useRouter()
  const [renaming, setRenaming] = useState(false)
  const [name, setName] = useState(flow.name)
  const [description, setDescription] = useState(flow.description)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const handleDelete = async () => {
    await flowService.deleteFlow(flow.id)
    onFlowDeleted(flow.id)
  }

  const handleNavigateFlow = () => {
    router.push(`/dashboard/flows/${flow.id}`)
  }

  const handleSave = async () => {
    try {
      await flowService.saveFlow({
        id: flow.id,
        name,
        description,
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
                e.preventDefault()
                setIsEditModalOpen(true)
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive" asChild>
            <DeleteModal
              deleteFailedText={`Could not delete flow: ${flow.name}`}
              deleteSuccessText={`Flow ${flow.name} deleted`}
              onDelete={handleDelete}
              title={`Are you sure you want to delete ${flow.name}`}
            >
              <div
                className={cn(
                  "relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive hover:bg-muted"
                )}
              >
                <Trash className="text-destructive" />
                Delete
              </div>
            </DeleteModal>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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
                        flowService.saveFlow({
                          id: flow.id,
                          name,
                        })
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
                    flowService.saveFlow({
                      id: flow.id,
                      description,
                    })
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

      {/* Edit Modal placed outside the dropdown */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogTitle>Edit your flow name and description</DialogTitle>
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
    </>
  )
}

export default FloCard
