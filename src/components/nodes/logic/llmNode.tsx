import { Position } from "reactflow";
import NodeComponent from "../base/node";
import { SelectContent, SelectGroup, SelectItem, SelectLabel, SelectValue, Select, SelectTrigger } from "../../ui/select";
import { Textarea } from "../../ui/textarea";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DropdownMenuItem } from "../../ui/dropdown-menu";
import { Settings } from "lucide-react";
import { ExtendedNodeProps } from "../types";
import TitleAndSubtitle from "../../ui/titleAndSubtitle";
import nodeOptions from "@/config/nodeOptions";

export const accessibleIncomingNodeOptions = [nodeOptions.knowledgeBase, nodeOptions.llm, nodeOptions.start, nodeOptions.textInput];

const LLMNode = (props: ExtendedNodeProps) => {

    const [supportedModels, setSupportedModels] = useState([
        {
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
        }
    ]);

    useEffect(() => {
        // To do: get supported models
    }, []);

    const onTextAreaClick = useCallback((event: { stopPropagation: () => void; }) => {
        event.stopPropagation();
    }, []);

    const handleInstructionsChange = (event: any) => {
        props.updateSelf?.(props.id, {
            data: {
                config: {
                    instructions: event.target.value
                }
            }
            
        });
    }

    const handlePromptChange = (event: any) => {
        props.updateSelf?.(props.id, {
            data: {
                config: {
                    prompt: event.target.value
                }
            }
            
        });
    }

    const handleModelSelect = (value: string) => {
        props.updateSelf?.(props.id, {
            data: {
                config: {
                    model: value
                }
            }
            
        });
    }

    const selectLLMEle = useMemo(() => <Select disabled value={props.data?.config?.model} defaultValue={props.data?.config?.model || "gpt-4-1"} onValueChange={handleModelSelect}>
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
    </Select>, [props.data?.config?.model]);

    const llmNodeBody = <div className="w-full flex flex-col gap-2 blur-[0.2]">
        <TitleAndSubtitle title="Large Language Model" description="Select the LLM you want to use"/>
        {
            selectLLMEle
        }
        <TitleAndSubtitle 
            title="Instructions" 
            description="Instruct AI how you'd like it to respond. You can include personality, tone etc."
        />
        <Textarea 
            disabled
            className="resize-none"
            onClick={onTextAreaClick}
            onMouseDown={onTextAreaClick}
            onChange={handleInstructionsChange}
            value={props.data?.config?.instructions || `Use only the provided context to answer. Follow these rules:
* Cite using [^#] immediately after the relevant phrase (no space before it).
* Do not invent citations or include info not in context.
* End with a <citations> block listing all citations used.
* Match citations exactly from the <available_citations> section although you may include additional important citation details (e.g., links) from the context if available
Example: "Photosynthesis is the process by which green plants convert sunlight into energy[^1].
<citations> [^1] Page 1 </citations>"`}
        />
        <TitleAndSubtitle 
            title="Prompt"
        />
        <Textarea 
            disabled
            className="resize-none"
            onClick={onTextAreaClick}
            onMouseDown={onTextAreaClick}
            onChange={handlePromptChange}
            value={props.data?.config?.prompt}
        />
    </div>
    return (
        <NodeComponent
            updateData={(data: Record<string, any>) => props?.updateSelf?.(props.id, {
                data: data
            })}
            onClick={
                () => {
                    props.handleOpenSidePanel?.(true, props.id)
                }
            }
            handles={[
                {
                    position: Position.Left,
                    type: "source"
                },
                {
                    position: Position.Right,
                    type: "target"
                }
            ]
            }
            id={props.id}
            type={props.type}
            data={props.data || {}} 
            selected={props.selected} 
            zIndex={props.zIndex} 
            isConnectable={props.isConnectable} 
            xPos={props.xPos} 
            yPos={props.yPos} 
            dragging={props.dragging}
            body={
                llmNodeBody
            }
            options={
                [
                    <DropdownMenuItem>
                        <Settings />
                        Settings
                    </DropdownMenuItem>
                ]
            }
        />
    );
}

export default LLMNode;