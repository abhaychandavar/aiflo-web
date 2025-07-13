"use client";

import { Position } from "reactflow";
import NodeComponent from "./node";
import { Textarea } from "../ui/textarea";
import { ExtendedNodeProps } from "@/types/node";

const StartNode = (props: ExtendedNodeProps) => {
    const { id, data, updateSelf } = props;

    const handleInputTextChange = (e: any) => {
        updateSelf(id, {
            data: {
                config: {
                    text: e.target.value
                }
            }
        })
    }

    return (
        <NodeComponent
            updateData={(data: Record<string, any>) => props?.updateSelf(props.id, {
                data: data
            })}
            onClick={
                () => {
                    props.handleOpenSidePanel?.(true, props.id);
                }
            }
            handles={[
                {
                    position: Position.Right,
                    type: "target"
                },
                {
                    position: Position.Left,
                    type: "source",
                    color: "#FFD400",
                    about: "inputType"
                }
            ]
            }
            id={props.id}
            type={props.type}
            data={data || {}}
            selected={props.selected} 
            zIndex={props.zIndex} 
            isConnectable={props.isConnectable} 
            xPos={props.xPos} 
            yPos={props.yPos} 
            dragging={props.dragging}
        />
    );
}

export default StartNode;