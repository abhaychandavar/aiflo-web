'use client'

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { timeDiffFromNow } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import moment from "moment";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner"
import projectService from "@/services/project";
import { PROJECT } from "@/components/projectCard";

const formSchema = z.object({
  name: z.string({ message: "Name required." }),
  description: z.string().optional(),
});
type AddProjectSchema = z.infer<typeof formSchema>;

const AddProjectModal = ({
    handleProjectAdded,
    spaceID
}: {
    handleProjectAdded: (projectData: PROJECT) => void,
    spaceID?: string
}) => {
    const [open, setOpen] = useState(false);
    const form = useForm<AddProjectSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
          name: '',
          description: '',
        },
      });
    
    const createProject: SubmitHandler<AddProjectSchema> = async (data) => {
        try {
            if (!spaceID) throw new Error("Space ID is required");
            const { name, description } = data;
            const res = await projectService.createProject(spaceID, { 
                name, 
                description
            });
            handleProjectAdded({
                id: res.id,
                description: res.description || undefined,
                createdAt: timeDiffFromNow(moment(res.createdAt).local().toDate()),
                name: res.name,
                status: res.status,
                user: {
                    id: res.user.id,
                    imageURL: res.user.imageURL || undefined,
                    name: res.user.name
                }
            });
            setOpen(false);

            toast.success("Project created");

            return res;
        }
        catch (err: any) {
            console.debug(err)
            toast.error(err.uiMessage || 'Something went wrong');
        }
    }

    return (
        <Dialog open={open} onOpenChange={(open) => {
            setOpen(open);
        }}>
            <DialogTrigger asChild>
              <Button disabled={spaceID ? false : true}>
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>
                Add details for your new project
              </DialogTitle>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(createProject)} className="space-y-6">
                        <FormField
                            control={form.control} // Pass control from useForm
                            name="name"
                            render={({ field }) => (
                                <FormItem> {/* Use FormItem for better structure with shadcn/ui */}
                                <FormLabel>Name</FormLabel> {/* Use FormLabel */}
                                <FormControl>
                                    <Input
                                        type="text"
                                        placeholder="My project"
                                        {...field}
                                        className="w-full"
                                    />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control} // Pass control from useForm
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Description</FormLabel> {/* Use FormLabel */}
                                <FormControl>
                                    <Textarea
                                        placeholder="You can describe your project here"
                                        {...field}
                                        className="w-full resize-none"
                                    />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant={'secondary'}>Cancel</Button>
                            </DialogClose>
                            <Button>
                                Create project
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
          </Dialog>
    );
}

export default AddProjectModal;