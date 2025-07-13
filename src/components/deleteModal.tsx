import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { ReactNode, useEffect, useState } from "react";
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
type DeleteFormSchema = z.infer<typeof formSchema>;

const DeleteModal = ({ title, deleteFailedText, deleteSuccessText, onDelete, children, isOpen = false, onOpenChange }: { title: string, deleteFailedText: string, deleteSuccessText: string, onDelete: () => Promise<void>, children?: ReactNode, isOpen?: boolean, onOpenChange?: (open: boolean) => any }) => {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (isOpen === undefined) return;
        setOpen(isOpen);
    }, [isOpen]);

    const form = useForm<DeleteFormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            confirmationText: '',
        },
    });
    
    const handleDelete = async (confirmationText: string) => {
        try {
            if (confirmationText !== 'DELETE') throw new Error('Delete confirmation text does not match');
            await onDelete();
            toast.success(deleteSuccessText || 'Deletion successful');
            setOpen(false);
            form.reset(); // Reset form after successful deletion
        }
        catch (err) {
            toast.error(deleteFailedText || 'Something went wrong');
        }
    }

    const onSubmit: SubmitHandler<DeleteFormSchema> = async (data) => {
        await handleDelete(data.confirmationText);
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {setOpen(isOpen); onOpenChange?.(isOpen)}}>
            {children ? <DialogTrigger asChild>
                {children}
            </DialogTrigger> : <></>}
            <DialogContent>
                <DialogTitle>
                    {title}
                </DialogTitle>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="confirmationText"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type "DELETE" below to confirm deletion</FormLabel>
                                    <FormControl>
                                        <Input
                                            autoFocus
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
                                <Button variant={'secondary'} type="button">Cancel</Button>
                            </DialogClose>
                            <Button variant={'destructive'} type="submit">Delete</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

export default DeleteModal;