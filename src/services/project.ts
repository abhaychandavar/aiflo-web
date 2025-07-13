import api from "@/lib/api";
import { AxiosError } from "axios";

class projectService {
  static saveProject = async (
    spaceID: string, projectData: {
    id: string;
    name?: string;
    description?: string;
  }) => {
    try {
      const { data } = await api.patch(`<flow>/api/v1/spaces/${spaceID}/projects`, projectData);
      return data;
    } catch (err) {
      if (err instanceof AxiosError) {
        throw err.response?.data?.detail;
      }
      throw err;
    }
  };

  static createProject = async (
    spaceID: string, projectData: {
    name?: string;
    description?: string;
  }) => {
    try {
      const { data } = await api.post(`<flow>/api/v1/spaces/${spaceID}/projects`, projectData);
      return data;
    } catch (err) {
      if (err instanceof AxiosError) {
        throw err.response?.data?.detail;
      }
      throw err;
    }
  };

  static getProjects = async (
    page: number,
    minimal: boolean,
    spaceID: string
  ): Promise<
    Array<{
      user: {
        name: string;
        email: string;
        imageURL: string | null;
        isActive: boolean;
        id: string;
      };
      name: "test";
      status: "PUBLISHED" | "UNPUBLISHED";
      createdAt: string;
      updatedAt: string;
      id: string;
      description: string | null;
    }>
  > => {
    try {
      const { data } = await api.get(
        `<flow>/api/v1/spaces/${spaceID}/projects?page=${page}&minimal=${minimal}`
      );
      return data.projects;
    } catch (err) {
      if (err instanceof AxiosError) {
        throw err.response?.data?.detail;
      }
      throw err;
    }
  };

  static deleteProject = async (id: string, spaceID: string) => {
    try {
      await api.delete(`<flow>/api/v1/spaces/${spaceID}/projects/${id}`);
    } catch (err) {
      if (err instanceof AxiosError) {
        throw err.response?.data?.detail;
      }
      throw err;
    }
  };
}

export default projectService;
