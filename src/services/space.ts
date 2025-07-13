import { api } from "@/lib/api";

class spaceService {
    static getSpaces = async () => {
        const { data: spaces } = await api.get(`<auth>/api/v1/auth/spaces`);
        return spaces;
    }
}

export default spaceService;