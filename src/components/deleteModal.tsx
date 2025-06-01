import { Trash } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTitle, DialogTrigger } from "./ui/dialog";
import { DropdownMenuItem } from "./ui/dropdown-menu";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { ReactNode, useState } from "react";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";

const formSchema = z.object({
    confirmationText: z
      .string()
      .refine((val) => val === "DELETE", {
        message: 'You must type "DELETE" to confirm.',
      })
      .transform((val) => val as string),
  });
type DeleteFormSchema = z.infer<typeof formSchema>; // Or define manually: { email: string; password: string; }

const DeleteModal = ({ title, deleteFailedText, deleteSuccessText, onDelete, children }: { title: string, deleteFailedText: string, deleteSuccessText: string, onDelete: () => Promise<void>, children: ReactNode }) => {
    const [open, setOpen] = useState(false);

    const form = useForm<DeleteFormSchema>({
        resolver: zodResolver(formSchema), // Optional: if using Zod
        defaultValues: { // Optional: Set default values
            confirmationText: '',
        },
    });

    const handleDelete = async (confirmationText: string) => {
        try {
            if (confirmationText !== 'DELETE') throw new Error('Delete confirmation text does not match');
            await onDelete();
            toast.success(deleteSuccessText || 'Deletion successful');
            setOpen(false);
        }
        catch (err) {
            toast.error(deleteFailedText || 'Something went wrong');
        }
    }

    const onSubmit: SubmitHandler<DeleteFormSchema> = async (data) => {
        await handleDelete(data.confirmationText);
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => setOpen(isOpen)}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>
                    {title}
                </DialogTitle>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control} // Pass control from useForm
                            name="confirmationText"
                            render={({ field }) => (
                                <FormItem> {/* Use FormItem for better structure with shadcn/ui */}
                                    <FormLabel>Type "DELETE" below to confirm deletion</FormLabel> {/* Use FormLabel */}
                                    <FormControl>
                                        <Input
                                            type="text"
                                            placeholder="DELETE"
                                            {...field}
                                            className="w-full"
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
                            <Button variant={'destructive'}>Delete</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

export default DeleteModal;