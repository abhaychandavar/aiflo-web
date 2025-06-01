import { X } from 'lucide-react';
import React from 'react';
import {
    BaseEdge,
    EdgeLabelRenderer,
    getSmoothStepPath,
    useReactFlow,
    type EdgeProps,
} from 'reactflow';
import { Button } from './ui/button';

export default function ButtonEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    selected,
    data = {}
}: EdgeProps) {
    const [edgePath, labelX, labelY] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const { setEdges } = useReactFlow();

    const onEdgeClick = () => {
        setEdges((edges) => edges.filter((edge) => edge.id !== id));
    };

    const edgeStyle = {
        stroke: selected ? '#000000' : '#808080',
        ...style,
    };

    return (
        <>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={edgeStyle} interactionWidth={24} />
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                        pointerEvents: 'all',
                        zIndex: 10,
                    }}
                    className="nodrag nopan"
                >
                    {data.showDeleteButton ? <Button
                        onClick={onEdgeClick}
                        variant={'destructive'}
                        size={'xs'}
                    >
                        <X className='text-white' />
                    </Button> : <></>}
                </div>
            </EdgeLabelRenderer>
        </>
    );
}
