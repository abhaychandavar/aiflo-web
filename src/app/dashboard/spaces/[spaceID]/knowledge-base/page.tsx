'use client';

import { useEffect, useState } from "react";
import { FileUploadedType } from "../projects/[projectID]/logic/[logicID]/sidePanels/documentSidePanelBody";
import docService from "@/services/docService";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getFileStatusFromRemoteFile } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, CheckCircle2, FileText, Loader2, Plus, Search, Upload, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function KnowledgeBase() {
    const [documents, setDocuments] = useState<FileUploadedType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const { spaceID: spaceIDRaw } = useParams();
    const spaceID = spaceIDRaw as string;
    const router = useRouter();
    
    async function getRemoteFiles() {
        try {
            setIsLoading(true);
            const files = await docService.getFiles({
                spaceID
            });
            const docs = files.map((file: Record<string, any>) => ({
                id: file.key,
                fileName: file.fileName,
                fileExt: file.fileExt,
                size: file.size,
                filePath: file.path,
                status: getFileStatusFromRemoteFile(file) as 'uploading' | 'uploaded' | 'errored' | 'successful' | 'indexing'
            }));
            setDocuments(docs);
        } catch (error) {
            console.error('Failed to fetch documents:', error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        getRemoteFiles();
    }, []);

    const filteredDocuments = documents.filter(doc => 
        doc.fileName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'successful':
                return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case 'errored':
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'uploading':
                return <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />;
            case 'uploaded':
                return <Upload className="h-4 w-4 text-blue-500" />;
            default:
                return <FileText className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'successful':
                return 'Successfully processed';
            case 'errored':
                return 'Error processing file';
            case 'uploading':
                return 'File is being uploaded';
            case 'uploaded':
                return 'File uploaded, waiting for processing';
            default:
                return 'Unknown status';
        }
    };

    return (
        <div className="flex flex-col h-screen w-full p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => router.back()}
                        className="hover:bg-muted"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Knowledge Base</h1>
                        <p className="text-muted-foreground">Manage and search through your documents</p>
                    </div>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Document
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Document</DialogTitle>
                            <DialogDescription>
                                Upload a document to your knowledge base
                            </DialogDescription>
                        </DialogHeader>
                        {/* Add upload form here */}
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search documents..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Documents Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
                    {[1, 2, 3].map((n) => (
                        <Card key={n} className="h-[200px]">
                            <div className="h-full bg-muted/10" />
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto">
                    {filteredDocuments.map((doc) => (
                        <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-center space-x-2">
                                    <FileText className="h-5 w-5 text-muted-foreground" />
                                    <CardTitle className="text-lg truncate">
                                        {doc.fileName}
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-muted-foreground">
                                        {(doc.size / 1024).toFixed(2)} KB
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        •
                                    </span>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <div className="flex items-center space-x-1">
                                                    {getStatusIcon(doc.status)}
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                {getStatusText(doc.status)}
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button variant="outline" className="w-full">
                                    View Document
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
