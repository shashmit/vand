import { API_URL } from "../config";
import { authService } from "./auth";

export interface Build {
  id: string;
  name: string;
  model: string;
  imageUrl: string;
  description?: string;
  tags: string[];
  userId: string;
  user: {
    username?: string;
    name?: string;
    avatarUrl?: string;
    bio?: string;
    vehicleType?: string;
  };
}

export const buildService = {
  async getBuilds(excludeUserId?: string): Promise<Build[]> {
    const url = new URL(`${API_URL}/builds`);
    if (excludeUserId) {
      url.searchParams.append('excludeUserId', excludeUserId);
    }
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error("Failed to fetch builds");
    }
    const data = await response.json();
    return data.data;
  },

  async getBuildById(id: string): Promise<Build> {
    const response = await fetch(`${API_URL}/builds/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch build details");
    }
    const data = await response.json();
    return data.data;
  },
  
  async getMyBuilds(): Promise<Build[]> {
    const token = await authService.getToken();
    if (!token) throw new Error("No token found");

    const response = await fetch(`${API_URL}/builds/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch my builds");
    }
    const data = await response.json();
    return data.data;
  },
  
  async createBuild(buildData: Partial<Build>): Promise<Build> {
    const token = await authService.getToken();
    if (!token) throw new Error("No token found");

    const response = await fetch(`${API_URL}/builds`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(buildData),
    });

    if (!response.ok) {
      throw new Error("Failed to create build");
    }
    
    const data = await response.json();
    return data.data;
  }
};
