'use client'

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner"

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  route: z.string()
    .min(1, { message: "Route is required." })
    .refine(
      (route) => {
        // Must start with /
        if (!route.startsWith('/')) return false;
        // Can't have multiple consecutive slashes
        if (route.includes('//')) return false;
        // Can't end with / unless it's the root route
        if (route !== '/' && route.endsWith('/')) return false;
        return true;
      },
      {
        message: "Route must start with / and not end with / (except for root route)"
      }
    ),
});

type AddPageSchema = z.infer<typeof formSchema>;

interface PageData {
  id: string;
  name: string;
  route: string;
  createdAt: string;
}

const AddPageModal = ({
    handlePageAdded,
    projectID,
    spaceID,
    existingPages
}: {
    handlePageAdded: (pageData: PageData) => void,
    projectID: string,
    spaceID: string,
    existingPages: PageData[]
}) => {
    const [open, setOpen] = useState(false);
    const form = useForm<AddPageSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
          name: '',
          route: '/',
        },
    });
    
    const createPage: SubmitHandler<AddPageSchema> = async (data) => {
        try {
            // Check if trying to create a root page when one already exists
            if (data.route === '/' && existingPages.some(page => page.route === '/')) {
                toast.error('Root page (/) already exists');
                return;
            }

            // Check if route already exists
            if (existingPages.some(page => page.route === data.route)) {
                toast.error('A page with this route already exists');
                return;
            }

            // TODO: Implement page creation service
            const mockResponse = {
                id: Math.random().toString(36).substr(2, 9),
                name: data.name,
                route: data.route,
                createdAt: new Date().toISOString()
            };
            
            handlePageAdded(mockResponse);
            setOpen(false);
            form.reset();
            toast.success("Page created");
        }
        catch (err: any) {
            console.debug(err)
            toast.error(err.uiMessage || 'Could not create page');
        }
    }

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) {
                form.reset();
            }
        }}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Page
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>
                Add a new page
              </DialogTitle>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(createPage)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Page Name</FormLabel>
                                <FormControl>
                                    <Input
                                        type="text"
                                        placeholder="Home"
                                        {...field}
                                        className="w-full"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="route"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Route</FormLabel>
                                <FormControl>
                                    <Input
                                        type="text"
                                        placeholder="/"
                                        {...field}
                                        className="w-full"
                                    />
                                </FormControl>
                                <FormDescription>
                                    Use "/" for root page (only one allowed). For dynamic routes, use {"{paramName}"}, e.g., "/users/{"{userId}"}/profile"
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="secondary">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">
                            Create Page
                        </Button>
                    </DialogFooter>
                </form>
              </Form>
            </DialogContent>
        </Dialog>
    );
}

export default AddPageModal; 