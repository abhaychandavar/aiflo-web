import { Trash } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { TableCell } from "./table";
import { Button } from "./button";
import { ReactNode, useEffect, useState } from "react";

function DeleteConfirmationPopover({onDelete, message, children}: {onDelete: () => Promise<any> | any, message: string, children: ReactNode}) {
    const [isOpen, setIsOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    function setOpen(open: boolean) {
        setIsOpen(open);
    }

    async function handleDelete() {
        try {
            setIsProcessing(true);
            await onDelete();
            setIsOpen(false);
        }
        catch (err) {
            console.debug("Deletion failed", err)
        }
        finally {
            setIsProcessing(false);
        }
    }

    return (
        <Popover open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
            <PopoverTrigger asChild>
                {children}
            </PopoverTrigger>
            <PopoverContent>
                <div className="p-2 flex flex-col gap-2">
                    <h1>Delete confirmation</h1>
                    <p className="max-w-md text-muted-foreground">{message}</p>
                    <div className="flex gap-2 justify-end">
                        <Button variant={'secondary'} onClick={() => setOpen(false)}>Cancel</Button>
                        <Button variant={'destructive'} disabled={isProcessing} onClick={handleDelete}>Delete</Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}

export default DeleteConfirmationPopover;