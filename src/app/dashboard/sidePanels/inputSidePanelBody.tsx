import { Textarea } from "@/components/ui/textarea";
import TitleAndSubtitle from "@/components/ui/titleAndSubtitle"

const InputSidePanelBody = ({ node, updateNode }: { node: any, updateNode: (data: Record<string, any>) => any }) => {
    return <div className="flex flex-col gap-2">
        <TitleAndSubtitle title="Input" description="Your query" />
        <Textarea value={node.data?.config?.text} onChange={(e) => updateNode({
            id: node.id,
            toUpdateValues: {
                data: {
                    config: {
                        text: e.target.value
                    }
                }
            }
        })} />
    </div>
}

export default InputSidePanelBody;