import { accessibleIncomingNodeOptions } from "@/components/nodes/llmNode";
import SmartTextArea from "@/components/smartTextArea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea";
import TitleAndSubtitle from "@/components/ui/titleAndSubtitle";
import api from "@/lib/api";
import flowService from "@/services/flow";
import { useEffect, useState } from "react";
import { Node } from "reactflow";

const LLMSidePanelBody = ({ node, updateNode, incomingNodes, projectID, spaceID }: { node: Node, updateNode: (data: any) => any, incomingNodes: Array<Node>, projectID: string, spaceID: string }) => {
    const nodeId = node.id;
    const data = node.data;
    const [supportedModels, setSupportedModels] = useState<Array<{
        id: string,
        name: string
    }>>([]);
    const [instructions, setInstructions] = useState(data?.config?.instructions || "");
    const [prompt, setPrompt] = useState(data?.config?.prompt || "");

    useEffect(() => {
        updateNode({
            id: nodeId,
            toUpdateValues: {
                data: {
                    config: {
                        prompt: prompt
                    }
                }
            }
        })
    }, [prompt]);

    useEffect(() => {
        updateNode({
            id: nodeId,
            toUpdateValues: {
                data: {
                    config: {
                        instructions
                    }
                }
            }
        })
    }, [instructions]);

    const incomingFilteredNodes = incomingNodes.filter((node) => accessibleIncomingNodeOptions.find((opt) => opt.type === node.type)).map((node) => {
        const allowedNode = accessibleIncomingNodeOptions.find((opt) => opt.type === node.type);
        if (!allowedNode) return null;
        return {
            id: node.id,
            label: node.data.label,
            icon: allowedNode.icon,
            bgColorHash: allowedNode.bgColorHash,
            textColorHash: allowedNode.textColorHash
        }
    }).filter((node) => node !== null);

    useEffect(() => {
        (
            async () => {
                const llmsObj = await flowService.getSupportedLLMs(projectID, spaceID);
                const llms = [];
                for (const llm in llmsObj) {
                    llms.push({
                        id: llm,
                        name: llmsObj[llm].name
                    });
                }
                setSupportedModels(llms);
            }
        )();
    }, []);

    return <div className="w-full flex flex-col gap-2 pl-5 pr-5">
        <TitleAndSubtitle title="Large Language Model" description="Select the LLM you want to use" />
        <Select value={data?.config?.model} defaultValue={data?.config?.model} onValueChange={(value) => updateNode({
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
                setInstructions(e.target.value)
            }}
            value={instructions}
        />
        <TitleAndSubtitle
            title="Prompt"
        />
        {incomingFilteredNodes.length ? <SmartTextArea options={incomingFilteredNodes}
            onChange={(text) => setPrompt(text)}
            value={prompt}
        /> : <SmartTextArea options={[]}
            onChange={(text) => setPrompt(text)}
            value={prompt}
        />}
    </div>
}

export default LLMSidePanelBody;