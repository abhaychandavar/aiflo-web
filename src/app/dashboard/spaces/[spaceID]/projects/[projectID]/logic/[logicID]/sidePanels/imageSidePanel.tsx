import FilePicker from "@/components/ui/filePicker";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import TitleAndSubtitle from "@/components/ui/titleAndSubtitle"

const ImageSidePanelBody = ({ node, updateNode }: { node: any, updateNode: (data: Record<string, any>) => any }) => {
    return <div className="flex flex-col gap-5">
        <div className="pl-5 pr-5">
            <TitleAndSubtitle title="Test image file" description="Select or drop your image file here" />
            <FilePicker onFileSelected={(file: File) => {}}/>
        </div>
        <div className="flex w-full items-center">
            <Separator className="flex-1"/>
            <span className="p-2 text-sm text-muted-foreground">OR</span>
            <Separator className="flex-1"/>
        </div>
        <div className="pl-5 pr-5">
            <TitleAndSubtitle title="Test image URL" description="" />
            <Input type="text"/>
        </div>
    </div>
}

export default ImageSidePanelBody;