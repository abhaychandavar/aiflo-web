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
import { CheckCircle, CircleAlert, Cloud, Trash } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import DeleteConfirmationPopover from "@/components/ui/delete-confirmation-popover";

export type FileUploadedType = {
    id: string,
    fileName: string,
    fileExt: string,
    size: number,
    filePath?: string,
    status: 'uploading' | 'uploaded' | 'errored' | 'successful' | 'indexing',
    error?: string
};

const DocumentSidePanelBody = ({ onFileSelected, getFileIdentifier, getRemoteFiles }: { 
    onFileSelected: (file: File) => Promise<any> | any,
    getFileIdentifier: (file: File) => Promise<any> | any,
    getRemoteFiles: () => Promise<Array<FileUploadedType>> | Array<FileUploadedType>
 }) => {
    const [files, setFiles] = useState<Array<FileUploadedType>>([]);

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
        (async () => {
            const remoteFiles = await getRemoteFiles();
            const remoteFileIdToData: Record<string, FileUploadedType> = {};
            for (const file of remoteFiles) {
                remoteFileIdToData[file.id] = file;
            }
            setFiles((prev) => {
                let eles: Array<FileUploadedType> = [];
                for (const ele of remoteFiles) {
                    eles.push(ele);
                }
                for (const ele of prev) {
                    if (remoteFileIdToData[ele.id]) {
                        for (let i = 0; i < eles.length; i += 1) {
                            const rfEle = eles[i];
                            if (rfEle.id === ele.id) {
                                eles[i] = ele
                            }
                        }
                        continue;
                    }
                    eles.push(ele);
                }
                return eles;
            });
        })();
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
                            id: processedFile.refID,
                            fileExt: processedFile.fileExt,
                            fileName: processedFile.fileName,
                            status: 'uploaded',
                            filePath: processedFile.path,
                            size: processedFile.size
                        });
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
                <TableHead>Name</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.map((file) => (
                <TableRow key={file.id}>
                  <TableCell className="font-medium">{file.fileName.slice(0,20) + (file.fileName.length > 20 ? '...' : '')}</TableCell>
                  <TableCell>{formatBytes(file.size)}</TableCell>
                    {
                        getFileStatusEle(file)
                    }
                    <DeleteConfirmationPopover onDelete={() => {}} message={`Are you sure you want to delete ${file.fileName}? This can not be undone.`}>
                        <TableCell><Trash size={14} className="text-muted-foreground"/></TableCell>
                    </DeleteConfirmationPopover>
                  
                </TableRow>
              ))}
            </TableBody>
          </Table>

    return <div className="flex flex-col gap-2">
        <TitleAndSubtitle title="Upload your document" description="You can upload PDF, Markdown, JPEG, PNG files"/>
        <FilePicker onFileSelected={handleOnFileSelected} />
        { files.length ? <div className=" border-2 rounded-sm border-muted">
            {
               filesTable 
            }
        </div> : <></>}
    </div>
}

export default DocumentSidePanelBody;