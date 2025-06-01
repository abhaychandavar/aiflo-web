import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea";
import TitleAndSubtitle from "@/components/ui/titleAndSubtitle";

const supportedModels = [{
    id: "gpt-3.5-turbo-0125",
    name: "GPT-3.5 Turbo"
},
{
    id: "gemini",
    name: "Gemini"
},
{
    id: "anthropic",
    name: "Anthropic"
}];

const LLMSidePanelBody = ({ nodeId, data, updateNode }: { data: any, nodeId: string, updateNode: (data: any) => any }) => {
    return <div className="w-full flex flex-col gap-2">
        <TitleAndSubtitle title="Large Language Model" description="Select the LLM you want to use" />
        <Select value={data?.config?.model || "gpt-4-1"} defaultValue={data?.config?.model || "gpt-4-1"} onValueChange={(value) => updateNode({
            id: nodeId,
            toUpdateValues: {
                data: {
                    config: {
                        model: value
                    }
                }
            }
        })}>
            <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a LLM" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>AI Models</SelectLabel>
                    {
                        supportedModels.map((model) => <SelectItem value={model.id} key={model.id}>{model.name}</SelectItem>)
                    }
                </SelectGroup>
            </SelectContent>
        </Select>
        <TitleAndSubtitle
            title="Instructions"
            description="Instruct AI how you'd like it to respond. You can include personality, tone etc."
        />
        <Textarea
            onChange={(e) => {
                updateNode({
                    id: nodeId,
                    toUpdateValues: {
                        data: {
                            config: {
                                instructions: e.target.value
                            }
                        }
                    }
                })
            }}
            value={data?.config?.instructions}
        />
        <TitleAndSubtitle
            title="Prompt"
        />
        <Textarea
            onChange={(e) => {
                updateNode({
                    id: nodeId,
                    toUpdateValues: {
                        data: {
                            config: {
                                prompt: e.target.value
                            }
                        }
                    }
                })
            }}
            value={data?.config?.prompt}
        />
    </div>
}

export default LLMSidePanelBody;