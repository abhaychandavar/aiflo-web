'use client'

import { FLO_CARD } from "@/components/flowCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { timeDiffFromNow } from "@/lib/utils";
import flowService from "@/services/flow";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import moment from "moment";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner"

const formSchema = z.object({
  name: z.string({ message: "Name required." }),
  description: z.string().optional(), // Or more complex password rules
});
type AddFlowSchema = z.infer<typeof formSchema>; // Or define manually: { email: string; password: string; }

const AddFlowModal = ({
    handleFlowAdded
}: {
    handleFlowAdded: (flowData: FLO_CARD) => void
}) => {
    const [open, setOpen] = useState(false);
    const form = useForm<AddFlowSchema>({
        resolver: zodResolver(formSchema), // Optional: if using Zod
        defaultValues: { // Optional: Set default values
          name: '',
          description: '',
        },
      });
    
    const createFlow: SubmitHandler<AddFlowSchema> = async (data) => {
        try {
            const { name, description } = data;
            const res = await flowService.createFlow(name, description);
            handleFlowAdded({
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

            toast.success("Flow created");

            return res;
        }
        catch (err) {
            console.debug(err)
            toast.error("Could not create the flow");
        }
    }

    return (
        <Dialog open={open} onOpenChange={(open) => {
            setOpen(open);
        }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Flow
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>
                Add details for your new flow
              </DialogTitle>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(createFlow)} className="space-y-6">
                        <FormField
                            control={form.control} // Pass control from useForm
                            name="name"
                            render={({ field }) => (
                                <FormItem> {/* Use FormItem for better structure with shadcn/ui */}
                                <FormLabel>Name</FormLabel> {/* Use FormLabel */}
                                <FormControl>
                                    <Input
                                        type="text"
                                        placeholder="My flow"
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
                                        placeholder="You can describe your flow here"
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
                                Add flow
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
          </Dialog>
    );
}

export default AddFlowModal;