"use client";

import { NodeProps, Position } from "reactflow";
import NodeComponent from "./node";
import { Textarea } from "../ui/textarea";
import { useEffect, useState } from "react";
import nodeService from "@/services/node";
import { ExtendedNodeProps } from "@/types/node";
import { useDebounce } from "@/hooks/useDebounce";

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
            body={
                <Textarea onChange={handleInputTextChange} value={data.config?.text} />
            }
        />
    );
}

export default StartNode;