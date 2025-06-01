import { Position } from "reactflow";
import NodeComponent from "./node";
import { Input } from "../ui/input";
import { ExtendedNodeProps } from "@/types/node";
import SidePanel, { SidePanelBody } from "../ui/sidePanel";
import { Label } from "@radix-ui/react-dropdown-menu";
import { useState } from "react";

const Document = (props: ExtendedNodeProps) => {
    return (
        <NodeComponent
            updateData={(data: Record<string, any>) => props?.updateSelf(props.id, {
                data: data
            })}
            onClick={
                () => {props.handleOpenSidePanel?.(true, props.id)}
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
            data={{
                label: "Document",
                nodeName: "Document",
                ...(props.data || {})
            }} 
            selected={props.selected} 
            zIndex={props.zIndex} 
            isConnectable={props.isConnectable} 
            xPos={props.xPos} 
            yPos={props.yPos} 
            dragging={props.dragging}
        />
    );
}

export default Document;