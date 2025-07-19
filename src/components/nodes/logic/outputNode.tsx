import { Position } from "reactflow";
import NodeComponent from "../base/node";
import { ExtendedNodeProps } from "../types";
import { useEffect, useState, useMemo, useCallback } from "react";
import { Textarea } from "../../ui/textarea";
import { debounce } from 'lodash';

const OutputNode = (props: ExtendedNodeProps) => {
    const { data } = props;
    return (
        <NodeComponent
            updateData={(data: Record<string, any>) => props?.updateSelf?.(props.id, {
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
                    type: "target",
                    color: "#FFD400"
                }
            ]}
            id={props.id}
            type={props.type}
            data={(data || {})}
            selected={props.selected} 
            zIndex={props.zIndex} 
            isConnectable={props.isConnectable} 
            xPos={props.xPos} 
            yPos={props.yPos} 
            dragging={props.dragging}
        />
    );
}

export default OutputNode;