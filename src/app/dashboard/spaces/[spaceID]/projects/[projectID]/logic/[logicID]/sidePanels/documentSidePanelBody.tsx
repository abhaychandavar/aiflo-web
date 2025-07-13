import FilePicker from "@/components/ui/filePicker"
import TitleAndSubtitle from "@/components/ui/titleAndSubtitle"
import { useEffect, useState } from "react";
import { HashLoader } from "react-spinners";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Brain, CheckCircle, CircleAlert, Cloud, File, Pen, Trash } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import DeleteConfirmationPopover from "@/components/ui/delete-confirmation-popover";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Node } from "reactflow";
import SmartTextArea from "@/components/smartTextArea";
import { HighlightedText } from "@/components/ui/highlightedRichText";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { accessibleIncomingNodeOptions } from "@/components/nodes/documents";
import { Checkbox } from "@/components/ui/checkbox";
import docService from "@/services/docService";

export type FileUploadedType = {
    id: string,
    fileName: string,
    fileExt: string,
    size: number,
    filePath?: string,
    status: 'uploading' | 'uploaded' | 'errored' | 'successful' | 'indexing',
    error?: string
};

const allowedNodes = accessibleIncomingNodeOptions;

const DocumentSidePanelBody = ({ node, updateNode, onFileSelected, getFileIdentifier, getRemoteFiles, incomingNodes, spaceID }: {
    onFileSelected: (file: File) => Promise<any> | any,
    getFileIdentifier: (file: File) => Promise<any> | any,
    getRemoteFiles: () => Promise<Array<FileUploadedType>> | Array<FileUploadedType>,
    updateNode: (data: any) => any,
    node: Node,
    incomingNodes: Array<Node>,
    spaceID: string
}) => {
    const nodeId = node.id;
    const data = node.data;

    const [files, setFiles] = useState<Array<FileUploadedType>>([]);

    const maxCharsMaxVal = 1000000;
    const maxTopResults = 20;

    const incomingFilteredNodes = incomingNodes.filter((node) => allowedNodes.find((opt) => opt.type === node.type)).map((node) => {
        const allowedNode = allowedNodes.find((opt) => opt.type === node.type);
        if (!allowedNode) return null;
        return {
            id: node.id,
            label: node.data.label,
            icon: allowedNode.icon,
            bgColorHash: allowedNode.bgColorHash,
            textColorHash: allowedNode.textColorHash
        }
    }).filter((node) => node !== null);

    // Common function to handle document selection updates
    const updateDocumentSelection = (docId: string, shouldAdd: boolean) => {
        const currentDocIds = new Set(node.data.config?.docIds || []);
        
        if (shouldAdd) {
            currentDocIds.add(docId);
        } else {
            currentDocIds.delete(docId);
        }

        updateNode({
            id: nodeId,
            toUpdateValues: {
                data: {
                    config: {
                        ...node.data.config,
                        docIds: Array.from(currentDocIds)
                    }
                }
            },
            mergeLeafNodes: false
        });
    };

    const handleDocumentSelection = (docId: string, checked: boolean) => {
        updateDocumentSelection(docId, checked);
    };

    function formatBytes(bytes: number, decimals = 2) {
        if (bytes === 0) return "0 Bytes";

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;

        const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];

        const i = Math.floor(Math.log(bytes) / Math.log(k));
        const size = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

        return `${size} ${sizes[i]}`;
    }

    useEffect(() => {
        let pollTimeoutId: any = null;
        let pollCount = 0;

        const updateFiles = async () => {
            const remoteFiles = await getRemoteFiles();
            const remoteFileIdToData: Record<string, any> = {};
            for (const file of remoteFiles) {
                remoteFileIdToData[file.id] = file;
            }

            let shouldPoll = false;

            setFiles((prev) => {
                let eles = [];

                for (const ele of remoteFiles) {
                    eles.push(ele);
                }

                for (const ele of prev) {
                    if (remoteFileIdToData[ele.id]) {
                        if (ele.status !== remoteFileIdToData[ele.id].status) {
                            shouldPoll = true;
                        }
                        continue;
                    }
                    eles.push(ele);
                }

                return eles;
            });

            return shouldPoll;
        };

        const poll = async () => {
            const shouldContinuePolling = await updateFiles();

            if (shouldContinuePolling) {
                pollCount++;

                // Calculate delay: base 5s + 5s for every 10 polls, max 60s
                const baseDelay = 5000;
                const backoffIncrement = Math.floor(pollCount / 10) * 5000;
                const delay = Math.min(baseDelay + backoffIncrement, 60000);

                pollTimeoutId = setTimeout(poll, delay);
            }
        };

        // Initial load and start polling if needed
        (async () => {
            const shouldStartPolling = await updateFiles();
            if (shouldStartPolling) {
                pollTimeoutId = setTimeout(poll, 5000);
            }
        })();

        // Cleanup function
        return () => {
            if (pollTimeoutId) {
                clearTimeout(pollTimeoutId);
            }
        };
    }, []);

    const handleOnFileSelected = async (file: File) => {
        const id = await getFileIdentifier(file);
        try {
            setFiles((prev) => {
                const eles: Array<FileUploadedType> = [];
                let docFound = false;
                for (const ele of prev) {
                    if (ele.id === id) {
                        eles.push({
                            id,
                            fileExt: file.type,
                            fileName: file.name,
                            status: 'uploading',
                            size: file.size
                        });
                        docFound = true;
                        continue;
                    }
                    eles.push(ele);
                }
                if (!docFound) eles.push({
                    id,
                    fileExt: file.type,
                    fileName: file.name,
                    status: 'uploading',
                    size: file.size
                });
                return eles;
            });
            const processedFile = await onFileSelected(file);
            setFiles((prev) => {
                const eles: Array<FileUploadedType> = [];
                for (const ele of prev) {
                    if (ele.id === id) {
                        eles.push({
                            id: processedFile.key,
                            fileExt: processedFile.fileExt,
                            fileName: processedFile.fileName,
                            status: 'uploaded',
                            filePath: processedFile.path,
                            size: processedFile.size
                        });
                        updateDocumentSelection(processedFile.key, true);
                        continue;
                    }
                    eles.push(ele);
                }
                return eles;
            });
        }
        catch (err: any) {
            setFiles((prev) => {
                const eles: Array<FileUploadedType> = [];
                for (const ele of prev) {
                    if (ele.id === id) {
                        eles.push({
                            ...ele,
                            status: 'errored',
                            error: err?.message || 'Something went wrong'
                        });
                        continue;
                    }
                    eles.push(ele);
                }
                return eles;
            });
        }
    }

    const getFileStatusEle = (file: FileUploadedType) => {
        const status = file.status;
        switch (status) {
            case 'uploading': return <Tooltip>
                <TooltipTrigger asChild>
                    <TableCell><HashLoader size={14} className="text-muted-foreground" /></TableCell>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                    Uploading
                </TooltipContent>
            </Tooltip>;
            case 'indexing': return <Tooltip>
                <TooltipTrigger asChild>
                    <TableCell><HashLoader size={14} className="text-muted-foreground" /></TableCell>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                    Indexing
                </TooltipContent>
            </Tooltip>;
            case 'uploaded': return <Tooltip>
                <TooltipTrigger asChild>
                    <TableCell><Cloud size={14} className="text-success" /></TableCell>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                    Uploaded
                </TooltipContent>
            </Tooltip>;
            case 'successful': return <Tooltip>
                <TooltipTrigger asChild>
                    <TableCell><CheckCircle size={14} className="text-success" /></TableCell>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                    Indexed successfully
                </TooltipContent>
            </Tooltip>;
            case 'errored': return <Tooltip>
                <TooltipTrigger asChild>
                    <TableCell><CircleAlert size={14} className="text-destructive" /></TableCell>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                    {file.error || 'Something went wrong!'}
                </TooltipContent>
            </Tooltip>;
        }
    }

    const filesTable = <Table>
        <TableHeader>
            <TableRow>
                <TableHead className="w-[50px]">Select</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {files.map((file) => (
                <TableRow key={file.id}>
                    <TableCell>
                        <Checkbox 
                            checked={(node.data.config?.docIds || []).includes(file.id)}
                            onCheckedChange={(checked: boolean) => handleDocumentSelection(file.id, checked)}
                            disabled={file.status !== 'successful'}
                        />
                    </TableCell>
                    {
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <TableCell className="font-medium">
                                    {file.fileName.slice(0, 20) + (file.fileName.length > 20 ? '...' : '')}
                                </TableCell>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                                {file.fileName}
                            </TooltipContent>
                        </Tooltip>

                    }
                    <TableCell>{formatBytes(file.size)}</TableCell>
                    {
                        getFileStatusEle(file)
                    }
                    <DeleteConfirmationPopover onDelete={() => { 
                        docService.deleteDocument({
                            spaceID,
                            id: file.id
                        })
                    }} message={`Are you sure you want to delete ${file.fileName}? This can not be undone.`}>
                        <TableCell><Trash size={14} className="text-muted-foreground" /></TableCell>
                    </DeleteConfirmationPopover>

                </TableRow>
            ))}
        </TableBody>
    </Table>

    return <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2 pl-5 pr-5">
            <TitleAndSubtitle title="Upload your document" description="You can upload PDF, Markdown, JPEG, PNG files" />
            <FilePicker onFileSelected={handleOnFileSelected} />
            {files.length ? <div className=" border-2 rounded-sm border-muted">
                {
                    filesTable
                }
            </div> : <></>}
        </div>

        <Separator />
        
        <div className="flex flex-col w-full gap-2 pl-5 pr-5">
            <TitleAndSubtitle title="Indexing mode" />
            <Select value={data?.config?.mode || 'semantic'} defaultValue={data?.config?.mode} onValueChange={(value) => updateNode({
                id: nodeId,
                toUpdateValues: {
                    data: {
                        config: {
                            mode: value
                        }
                    }
                }
            })}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a LLM" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>Indexing mode</SelectLabel>
                        <SelectItem value={'semantic'} key={'semantic'}>Semantic</SelectItem>
                        <SelectItem value={'hybrid'} key={'hybrid'}>Hybrid</SelectItem>
                        <SelectItem value={'keywords'} key={'keywords'}>Keywords</SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>

        <div className="flex flex-col w-full gap-2 pl-5 pr-5">
            <TitleAndSubtitle title="Max characters" />
            <div className="flex justify-between">
                <p className="text-sm">{data.config?.maxCharacters || 15000}</p>
                <p className="text-sm">{maxCharsMaxVal}</p>
            </div>
            <Slider defaultValue={[data.config?.maxCharacters || 15000]} max={maxCharsMaxVal} step={1} onValueChange={(value) => {
                const val = value[0];
                updateNode({
                    id: nodeId,
                    toUpdateValues: {
                        data: {
                            config: {
                                maxCharacters: val
                            }
                        }
                    }
                });
            }} value={[data.config?.maxCharacters || 15000]} />
        </div>

        <div className="flex flex-col w-full gap-2 pl-5 pr-5">
            <TitleAndSubtitle title="Top results" />
            <div className="flex justify-between">
                <p className="text-sm">{data.config?.topResults || 15000}</p>
                <p className="text-sm">{maxTopResults}</p>
            </div>
            <Slider defaultValue={[data.config?.topResults || 10]} max={maxTopResults} step={1} onValueChange={(value) => {
                const val = value[0];
                updateNode({
                    id: nodeId,
                    toUpdateValues: {
                        data: {
                            config: {
                                topResults: val
                            }
                        }
                    }
                });
            }}
                value={[data.config?.topResults || 10]}
            />
        </div>

        <div className="flex flex-col w-full gap-2 pl-5 pr-5">
            <TitleAndSubtitle title="Query" description="You can use this to specify the query for your document. If left empty input query will be used." />
            <HighlightedText className="mt-6">
                <HighlightedText.Content className="text-muted-foreground">
                    Type <span className="font-medium text-muted-foreground">"/"</span> to insert data from connected nodes into your query.
                    <br />
                    <br />
                    <span className="font-semibold text-muted-foreground">Example:</span><br />
                    <span className="text-muted-foreground">
                        To combine two inputs: <br />
                        If you've connected two input nodes, you can reference them like this:
                    </span>
                    <br />
                    <HighlightedText.Code><span className="text-xs text-background">/input1 and /input2</span></HighlightedText.Code>
                    <br />
                    This will insert the data from both nodes into your query.
                </HighlightedText.Content>
            </HighlightedText>
            {incomingFilteredNodes.length ? <SmartTextArea options={incomingFilteredNodes}
                onChange={(text) => updateNode({
                    id: nodeId,
                    toUpdateValues: {
                        data: {
                            config: {
                                query: text
                            }
                        }
                    }
                })}

                value={data?.config?.query}
            /> : <></>}
        </div>

        <Separator />

        <div className="flex justify-between pl-5 pr-5 pb-5">
            <p>Rerank</p>
            <Switch />
        </div>
    </div>
}

export default DocumentSidePanelBody;