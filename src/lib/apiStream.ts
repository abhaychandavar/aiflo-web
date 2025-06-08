import { getSession } from "next-auth/react";
import { parseAndReturnAPIurl } from "./utils";
import { API_STREAM_EVENT_TYPE } from "@/types/common";

type argsType = {
    url: string,
    onEvent: (data: API_STREAM_EVENT_TYPE) => Promise<void>,
    onDone: () => Promise<void>,
    data?: Record<string, any>,
    config?: {
        headers?: Record<string, string>
    }
}

async function fetchStream(
    args: argsType,
    method: string,
): Promise<void> {
    const { url, onEvent, data, config, onDone } = args;
    const options: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
            ...(config?.headers || {})
        },
        method
    }
    if (data) {
        options.body = JSON.stringify(data)
    }
    const parsedURL = parseAndReturnAPIurl(url);
    const { headers } = options;
    const session = await getSession();

    let authToken: string | undefined;
    if (session) {
        authToken = `Bearer ${(session as any).accessToken}`;

    }
    if (!authToken) throw new Error('Auth token not found');

    const res = await fetch(parsedURL, {
        ...options,
        headers: {
            Authorization: authToken,
            ...(headers || {})
        }
    });

    if (!res.body) {
        throw new Error('No response body');
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
        const { value, done } = await reader.read();
        if (done) {
            await onDone();
            break;
        };

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex;
        while ((newlineIndex = buffer.indexOf('\n\n')) >= 0) {
            const event = buffer.slice(0, newlineIndex).trim();
            buffer = buffer.slice(newlineIndex + 1);
            
            if (event) {
                try {
                    const idDataSplit = event.split('\n');
                    if (idDataSplit.length !== 2) throw new Error("Corrupted event");
                    const [idStr, dataStr] = idDataSplit;

                    if (!idStr.startsWith('id:')) throw new Error("Invalid ID");
                    if (!dataStr.startsWith('data:')) throw new Error("Invalid data");
                    // const id = idStr.slice(3).trim();
                    const eventData = JSON.parse(dataStr.slice(5).trim());
                    onEvent({
                        data: eventData.data,
                        eventID: eventData.eventID,
                        nodeID: eventData.nodeID,
                        nodeType: eventData.nodeType,
                        runID: eventData.runID,
                        source: eventData?.source
                    });
                } catch (err) {
                    console.warn('Failed to parse JSON line:', event, err);
                }
            }
        }
    }
}

const apiStream = {
    post: async (args: argsType) => await fetchStream(args, 'post')
}

export default apiStream;
