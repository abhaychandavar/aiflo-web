import { api } from "@/lib/api";
import apiStream from "@/lib/apiStream";
import { API_STREAM_EVENT_TYPE } from "@/types/common";

class nodeService {
    static saveData = async (flowID: string, nodeID: string, data: Record<string, any>) => {
        const { data: nodeData } = await api.post(`<flow>/api/v1/flows/${flowID}/nodes/${nodeID}/config`, {
            data
        });
        return nodeData;
    }

    static runFlow = async (flowID: string, body: {
        nodes: any,
        edges: any,
        viewport: any
    }, onEvent: (data: API_STREAM_EVENT_TYPE) => Promise<void>, onDone: () => Promise<void>) => {
        await apiStream.post({ url: `<flow>/api/v1/flows/${flowID}/run`, onEvent, data: body, onDone });
    }
}

export default nodeService;