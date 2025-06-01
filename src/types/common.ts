export type API_STREAM_EVENT_TYPE = {
    nodeID: string,
        data: {
            id: string,
            dataType: string,
            text?: string,
            delta?: string,
            error?: string,
            errorCode?: string
        },
    nodeType: string,
    eventID: string,
    runID: string,
    source: string
}