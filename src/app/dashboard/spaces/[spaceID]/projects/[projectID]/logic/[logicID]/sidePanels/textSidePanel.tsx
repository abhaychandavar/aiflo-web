import FilePicker from "@/components/ui/filePicker";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import TitleAndSubtitle from "@/components/ui/titleAndSubtitle"
import { useEffect, useState } from "react";

const TextSidePanelBody = ({ node, updateNode }: { node: any, updateNode: (data: Record<string, any>) => any }) => {
    const nodeId = node.id;
    const [text, setText] = useState<string>(node.data?.config?.text);

    useEffect(() => {
        updateNode({
            id: nodeId,
            toUpdateValues: {
                data: {
                    config: {
                        text
                    }
                }
            }
        })
    }, [text]);

    return <div className="flex flex-col gap-5">
        <div className="pl-5 pr-5">
            <TitleAndSubtitle title="Test query" description="You can provide your text query here to test the flow." />
            <Input type="text" onChange={(e) => setText(e.target.value)} value={text}/>
        </div>
    </div>
}

export default TextSidePanelBody;