import api from "@/lib/api";
import { AxiosError } from "axios";

class flowService {
  static saveFlow = async (
    projectID: string,
    flowRecord: {
      flow?: Record<string, any>;
      id: string;
      name?: string;
      description?: string;
    },
    spaceID: string
  ) => {
    try {
      const { data } = await api.patch(
        `<flow>/api/v1/spaces/${spaceID}/projects/${projectID}/flows`,
        flowRecord
      );
      return data;
    } catch (err) {
      if (err instanceof AxiosError) {
        throw err.response?.data?.detail;
      }
      throw err;
    }
  };

  static getFlows = async (
    projectID: string,
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
        `<flow>/api/v1/spaces/${spaceID}/projects/${projectID}/flows?page=${page}&minimal=${minimal}`
      );
      return data.flows;
    } catch (err) {
      if (err instanceof AxiosError) {
        throw err.response?.data?.detail;
      }
      throw err;
    }
  };

  static createFlow = async (
    projectID: string,
    name: string,
    spaceID: string,
    description?: string,
  ): Promise<{
    name: string;
    status: "PUBLISHED" | "UNPUBLISHED";
    createdAt: string;
    updatedAt: string;
    id: string;
    description: string | null;
  }> => {
    try {
      const { data } = await api.post(
        `<flow>/api/v1/spaces/${spaceID}/projects/${projectID}/flows`,
        {
          name,
          description,
        }
      );
      return data;
    } catch (err) {
      if (err instanceof AxiosError) {
        throw err.response?.data?.detail;
      }
      throw err;
    }
  };

  static deleteFlow = async (id: string, projectID: string, spaceID: string) => {
    try {
      await api.delete(`<flow>/api/v1/spaces/${spaceID}/projects/${projectID}/flows/${id}`);
    } catch (err) {
      if (err instanceof AxiosError) {
        throw err.response?.data?.detail;
      }
      throw err;
    }
  };

  static getFlow = async (id: string, projectID: string, spaceID: string) => {
    try {
      const { data } = await api.get(
        `<flow>/api/v1/spaces/${spaceID}/projects/${projectID}/flows/${id}`
      );
      return data;
    } catch (err) {
      if (err instanceof AxiosError) {
        throw err.response?.data?.detail;
      }
      throw err;
    }
  };

  static getSupportedLLMs = async (projectID: string, spaceID: string) => {
    try {
      const { data } = await api.get(
        `<flow>/api/v1/spaces/${spaceID}/projects/${projectID}/flows/llms/models`
      );
      return data;
    } catch (err) {
      if (err instanceof AxiosError) {
        throw err.response?.data?.detail;
      }
      throw err;
    }
  };

  static getNodesLayout = async (projectID: string, spaceID: string) => {
    try {
      const { data } = await api.get(
        `<flow>/api/v1/spaces/${spaceID}/projects/${projectID}/flows/nodes/layout`
      );
      return data;
    } catch (err) {
      if (err instanceof AxiosError) {
        throw err.response?.data?.detail;
      }
      throw err;
    }
  };
}

export default flowService;
