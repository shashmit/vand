import { API_URL } from "../config";
import { authService } from "./auth";

export interface GaragePro {
  id: string;
  name: string;
  title: string;
  specialty: string;
  rate: string;
  verified: boolean;
  category: string;
  imageUrl?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  website?: string | null;
  location?: string | null;
}

export const garageService = {
  async getPros(category?: string, excludeUserId?: string): Promise<GaragePro[]> {
    const url = new URL(`${API_URL}/garage`);
    if (category && category !== 'ALL') {
      url.searchParams.append('category', category);
    }
    if (excludeUserId) {
      url.searchParams.append('excludeUserId', excludeUserId);
    }
    
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error("Failed to fetch garage pros");
    const data = await response.json();
    return data.data;
  },

  async getProById(id: string): Promise<GaragePro> {
    const response = await fetch(`${API_URL}/garage/${id}`);
    if (!response.ok) throw new Error("Failed to fetch pro details");
    const data = await response.json();
    return data.data;
  },

  async getMyProfile(): Promise<GaragePro | null> {
    const token = await authService.getToken();
    if (!token) throw new Error("No token found");

    const response = await fetch(`${API_URL}/garage/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 404) return null;
    if (!response.ok) throw new Error("Failed to fetch my garage profile");
    
    const data = await response.json();
    return data.data;
  },

  async createProfile(proData: Partial<GaragePro>): Promise<GaragePro> {
    const token = await authService.getToken();
    if (!token) throw new Error("No token found");

    const response = await fetch(`${API_URL}/garage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(proData),
    });

    if (!response.ok) throw new Error("Failed to create garage profile");
    const data = await response.json();
    return data.data;
  },

  async updateProfile(id: string, proData: Partial<GaragePro>): Promise<GaragePro> {
    const token = await authService.getToken();
    if (!token) throw new Error("No token found");

    const response = await fetch(`${API_URL}/garage/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(proData),
    });

    if (!response.ok) throw new Error("Failed to update garage profile");
    const data = await response.json();
    return data.data;
  },
};
