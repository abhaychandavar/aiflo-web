import api from "@/lib/api";
import axios from "axios";

class storage {
    static async generateSequentialUploadSignedUrls({
        spaceID,
        count,
        fileName
    }:{
        spaceID: string,
        count: number,
        fileName: string
    }) {
        try {
            const { data } = await api.post(
                `<docProcessor>/api/v1/doc-processor/storage/spaces/${spaceID}/generate/sequential/signed-urls`,
                {
                    count,
                    fileName
                }
            );
            return data;
        }
        catch (err) {
            console.error("[generateSequentialUploadSignedUrls] Could not get signed URLs", err);
            return null;
        }
    }

    static async uploadBlob({ url, data }: { url: string, data: Blob | File }) {
        try {
            const { data: apiData } = await axios.put(url, data, {
                headers: {
                    'Content-Type': data.type || 'application/octet-stream',
                },
                withCredentials: true
            });
        
            return apiData;
        } catch (err) {
            console.error('Error uploading blob:', err);
            throw err;
        }
    }
}

export default storage;