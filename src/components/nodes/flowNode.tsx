import { Position } from "reactflow";
import NodeComponent from "./node";
import { Share2 } from 'lucide-react';
import { ExtendedNodeProps } from "@/types/node";
import TitleAndSubtitle from "../ui/titleAndSubtitle";
import nodeOptions from "@/config/nodeOptions";

export const accessibleIncomingNodeOptions = [nodeOptions.knowledgeBase, nodeOptions.llm, nodeOptions.start, nodeOptions.textInput];

const FlowNode = (props: ExtendedNodeProps) => {
  const flowNodeBody = (
    <div className="w-full flex flex-col gap-2">
      <TitleAndSubtitle 
        title="Flow Reference" 
        description="Execute another flow as part of this workflow"
      />
      <div className="flex flex-col gap-1 p-2 bg-muted rounded-md">
        <div className="flex items-center gap-2">
          <Share2 className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">{props.data?.config?.flowName}</span>
        </div>
        <span className="text-xs text-muted-foreground pl-6">ID: {props.data?.config?.flowID}</span>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        This node will execute the referenced flow when triggered, allowing you to reuse and compose flows together. The output of the referenced flow will be passed to the next node.
      </p>
    </div>
  );

  return (
    <NodeComponent
      updateData={(data: Record<string, any>) => props?.updateSelf(props.id, {
        data: data
      })}
      onClick={() => {
        props.handleOpenSidePanel?.(true, props.id)
      }}
      handles={[
        {
          position: Position.Left,
          type: "source"
        },
        {
          position: Position.Right,
          type: "target"
        }
      ]}
      id={props.id}
      type={props.type}
      data={props.data || {}}
      selected={props.selected}
      zIndex={props.zIndex}
      isConnectable={props.isConnectable}
      xPos={props.xPos}
      yPos={props.yPos}
      dragging={props.dragging}
      body={flowNodeBody}
    />
  );
}

export default FlowNode; 