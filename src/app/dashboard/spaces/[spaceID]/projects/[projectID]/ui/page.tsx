"use client";

import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/ui/search-bar";
import { ThemeToggle } from "@/components/theme-toggle";
import { PageHeader } from "@/components/ui/page-header";
import AddPageModal from "./addPageModal";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";

interface PageData {
  id: string;
  name: string;
  route: string;
  createdAt: string;
}

interface RouteGroup {
  basePath: string;
  pages: PageData[];
}

interface ComponentData {
  id: string;
  name: string;
  type: string;
  createdAt: string;
}

export default function UIPage() {
  const { projectID, spaceID } = useParams();
  const router = useRouter();
  const [pages, setPages] = useState<PageData[]>([]);
  const [components, setComponents] = useState<ComponentData[]>([]);

  const handlePageAdded = (pageData: PageData) => {
    setPages((prev) => [pageData, ...prev]);
  };

  const handlePageClick = (pageId: string) => {
    router.push(`/dashboard/spaces/${spaceID}/projects/${projectID}/ui/pages/${pageId}`);
  };

  const handleComponentClick = (componentId: string) => {
    router.push(`/dashboard/spaces/${spaceID}/projects/${projectID}/ui/components/${componentId}`);
  };

  const handleAddComponent = () => {
    // TODO: Implement component creation
    const mockComponent: ComponentData = {
      id: Math.random().toString(36).substr(2, 9),
      name: "New Component",
      type: "Custom",
      createdAt: new Date().toISOString()
    };
    setComponents(prev => [mockComponent, ...prev]);
  };

  // Find root page
  const rootPage = pages.find(page => page.route === "/");

  // Group non-root pages by their base route
  const groupedRoutes = pages
    .filter(page => page.route !== "/")
    .reduce((groups: RouteGroup[], page) => {
      // Get the base path (first segment of the route)
      const basePath = page.route.split("/")[1] || "";
      const baseRoute = `/${basePath}`;
      
      const existingGroup = groups.find(g => g.basePath === baseRoute);
      if (existingGroup) {
        existingGroup.pages.push(page);
      } else {
        groups.push({
          basePath: baseRoute,
          pages: [page]
        });
      }
      return groups;
    }, [])
    .sort((a, b) => a.basePath.localeCompare(b.basePath));

  return (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader 
          title="UI Builder"
          actions={
            <>
              <ThemeToggle />
            </>
          }
        />
        
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="pages" className="h-full flex flex-col">
            <div className="px-6 border-b">
              <TabsList>
                <TabsTrigger value="pages">Pages</TabsTrigger>
                <TabsTrigger value="components">Components</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="pages" className="flex-1 overflow-hidden">
              <div className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div className="max-w-xl flex-1">
                    <SearchBar placeholder="Search pages..." />
                  </div>
                  <AddPageModal
                    spaceID={spaceID as string}
                    projectID={projectID as string}
                    handlePageAdded={handlePageAdded}
                    existingPages={pages}
                  />
                </div>
                
                <ScrollArea className="flex-1">
                  <div className="pr-4 space-y-4">
                    {pages.length === 0 ? (
                      <Card className="p-8 text-center text-muted-foreground">
                        No pages created yet. Click "Add Page" to create your first page.
                      </Card>
                    ) : (
                      <>
                        {/* Root Page */}
                        {rootPage && (
                          <Card 
                            className="p-4 border-primary/50 hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => handlePageClick(rootPage.id)}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-medium">{rootPage.name}</h3>
                                  <Badge variant="secondary">Root</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {rootPage.route}
                                </p>
                              </div>
                              <Badge variant="outline" className="ml-2">
                                {new Date(rootPage.createdAt).toLocaleDateString()}
                              </Badge>
                            </div>
                          </Card>
                        )}

                        {/* Other Routes */}
                        {groupedRoutes.length > 0 && (
                          <div className="rounded-lg border bg-card">
                            <Accordion type="multiple">
                              {groupedRoutes.map((group, idx) => (
                                <AccordionItem
                                  key={group.basePath}
                                  value={group.basePath}
                                >
                                  <AccordionTrigger className="px-4 hover:no-underline">
                                    <div className="flex items-center gap-3">
                                      <span className="font-semibold">
                                        {group.basePath}
                                      </span>
                                      <Badge variant="secondary">
                                        {group.pages.length}
                                      </Badge>
                                    </div>
                                  </AccordionTrigger>
                                  <AccordionContent className="px-4">
                                    <div className="space-y-3">
                                      {group.pages.map((page) => (
                                        <Card
                                          key={page.id}
                                          className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                                          onClick={() => handlePageClick(page.id)}
                                        >
                                          <div className="flex items-start justify-between">
                                            <div>
                                              <h3 className="font-medium">{page.name}</h3>
                                              <p className="text-sm text-muted-foreground mt-1">
                                                {page.route}
                                              </p>
                                            </div>
                                            <Badge variant="outline" className="ml-2">
                                              {new Date(page.createdAt).toLocaleDateString()}
                                            </Badge>
                                          </div>
                                        </Card>
                                      ))}
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              ))}
                            </Accordion>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="components" className="flex-1 overflow-hidden">
              <div className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div className="max-w-xl flex-1">
                    <SearchBar placeholder="Search components..." />
                  </div>
                  <Button onClick={handleAddComponent}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Component
                  </Button>
                </div>

                <ScrollArea className="flex-1">
                  <div className="pr-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {components.length === 0 ? (
                      <Card className="p-8 text-center text-muted-foreground col-span-full">
                        No components created yet. Click "New Component" to create your first component.
                      </Card>
                    ) : (
                      components.map(component => (
                        <Card 
                          key={component.id} 
                          className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => handleComponentClick(component.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium">{component.name}</h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                {component.type}
                              </p>
                            </div>
                            <Badge variant="outline" className="ml-2">
                              {new Date(component.createdAt).toLocaleDateString()}
                            </Badge>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 