import { Position } from "reactflow";
import NodeComponent from "../base/node";
import { ExtendedNodeProps } from "../types";
import { useEffect, useState, useMemo, useCallback } from "react";
import { Textarea } from "../../ui/textarea";
import { debounce } from 'lodash';

const TextOutputNode = (props: ExtendedNodeProps) => {
    const { data } = props;
    const [res, setRes] = useState<Record<string, {
        runID: string,
        res: string,
        sl?: number
    }>>({});

    const [debouncedData, setDebouncedData] = useState(data?.runState?.data);

    const debouncedSetData = useMemo(
        () => debounce((newData) => setDebouncedData(newData), 60),
        []
    );

    useEffect(() => {
        debouncedSetData(data?.runState?.data);
        return () => debouncedSetData.cancel();
    }, [data?.runState?.data, debouncedSetData]);

    const processedData = useMemo(() => {
        if (!Array.isArray(debouncedData)) return [];
        
        return debouncedData.filter((eventData: any) => {
            const eventDataKeys = Object.keys(eventData.data || {});
            return eventDataKeys.includes("text") || eventDataKeys.includes("delta");
        });
    }, [debouncedData]);

    const updateResults = useCallback((events: typeof processedData) => {
        if (events.length === 0) return;
        
        setRes(prev => {
            const newState = { ...prev };
            const currentRunID = events[0]?.runID;
            
            // Remove entries from different runIDs (batch cleanup)
            Object.keys(newState).forEach(srcID => {
                if (newState[srcID].runID !== currentRunID) {
                    delete newState[srcID];
                }
            });
            
            events.forEach((eventData: any) => {
                const { source, runID, data: eventDataContent, sl } = eventData;
                if (eventDataContent?.text) {
                    newState[source] = {
                        res: eventDataContent.text,
                        runID,
                        ...(sl !== undefined && { sl })
                    };
                } else if (eventDataContent?.delta) {
                    // Append delta content
                    if (newState[source]?.runID === runID) {
                        newState[source] = {
                            ...newState[source],
                            res: (newState[source].res || '') + eventDataContent.delta
                        };
                    } else {
                        newState[source] = {
                            res: eventDataContent.delta,
                            runID,
                            ...(sl !== undefined && { sl })
                        };
                    }
                }
            });
            
            return newState;
        });
    }, []);

    useEffect(() => {
        if (processedData.length > 0) {
            updateResults(processedData);
        }
    }, [processedData, updateResults]);

    const textOutput = useMemo(() => {
        let output = '';
        if (!res || Object.keys(res).length === 0) return output;
        
        let sources = Object.keys(res);

        sources.sort((src1, src2) => {
            const runID1Data = res[src1];
            const runID2Data = res[src2];
            const sl1 = runID1Data.sl;
            const sl2 = runID2Data.sl;
            if (sl1 && sl2) {
                return sl1 > sl2 ? 1 : -1;
            }
            return src1 > src2 ? 1 : -1;
        });

        sources.forEach((src) => {
            output += `${output ? '\n\n' : ''}SOURCE ID: ${src}\n${res[src].res}`;
        });
        return output;
    }, [res]);

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
                    type: "source",
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
            body={
                <Textarea
                    value={textOutput}
                    readOnly
                />
            }
        />
    );
}

export default TextOutputNode;