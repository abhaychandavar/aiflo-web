import { NodeProps } from "reactflow";

export interface ExtendedNodeProps extends NodeProps {
  updateSelf?: (id: string, data: Record<string, any>) => void;
  handleOpenSidePanel?: (open: boolean, nodeId: string) => void;
  flowID?: string;
}

export interface NodeConfig {
  text?: string;
  flowName?: string;
  flowID?: string;
  pageName?: string;
  route?: string;
  instructions?: string;
  prompt?: string;
  model?: string;
}

export interface NodeData {
  label?: string;
  nodeName?: string;
  description?: string;
  config?: NodeConfig;
  runState?: {
    runStartedAt?: string;
    status?: 'success' | 'error';
    data?: any;
  };
  note?: string;
} 