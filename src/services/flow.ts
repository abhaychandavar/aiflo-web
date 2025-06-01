import api from "@/lib/api";

class flowService {
    static saveFlow = async (flowRecord: {
        flow?: Record<string, any>,
        id: string,
        name?: string,
        description?: string
    }) => {
        const { data } = await api.post('<flow>/api/v1/flows', flowRecord);
        return data;
    }

    static getFlows = async (page: number, minimal: boolean): Promise<Array<{
        user: {
            name: string,
            email: string,
            imageURL: string | null,
            isActive: boolean,
            id: string
        },
        name: "test",
        status: 'PUBLISHED' | 'UNPUBLISHED',
        createdAt: string,
        updatedAt: string,
        id: string,
        description: string | null,
    }>> => {
        const { data } = await api.get(`<flow>/api/v1/flows?page=${page}&minimal=${minimal}`);
        return data.flows;
    }

    static createFlow = async (name: string, description?: string): Promise<
    {
        user: {
            name: string,
            email: string,
            imageURL: string | null,
            isActive: boolean,
            id: string
        },
        name: "test",
        status: 'PUBLISHED' | 'UNPUBLISHED',
        createdAt: string,
        updatedAt: string,
        id: string,
        description: string | null,
    }
    > => {
        const { data } = await api.post('<flow>/api/v1/flows', {
            name,
            description
        });
        return data;
    }

    static deleteFlow = async (id: string) => {
        await api.delete(`<flow>/api/v1/flows/${id}`);
    }

    static getFlow = async (id: string) => {
        const { data } = await api.get(`<flow>/api/v1/flows/${id}`);
        return data;
    }
}

export default flowService;