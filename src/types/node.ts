import { NodeProps } from "reactflow";

export interface ExtendedNodeProps extends NodeProps {
    flowID: string,
    updateSelf: (id: string, data: Record<string, any>) => void,
    runState?: {
        isRunning: boolean
    },
    handleOpenSidePanel?: (isOpen: boolean, id: string) => void
}

export type NodeRes = {
    type: string,
    data: Record<string, any>
}