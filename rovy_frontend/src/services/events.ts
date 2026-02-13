import { API_URL } from "../config";
import { authService } from "./auth";

export interface EventHost {
  id: string;
  name?: string | null;
  username?: string | null;
  avatarUrl?: string | null;
}

export interface EventItem {
  id: string;
  title: string;
  description?: string | null;
  location: string;
  latitude: number;
  longitude: number;
  startDate: string;
  endDate?: string | null;
  imageUrl?: string | null;
  category?: string | null;
  distanceKm?: number;
  host?: EventHost | null;
}

export interface MapPersonItem {
  id: string;
  name: string;
  username?: string | null;
  avatarUrl?: string | null;
  vehicleType?: string | null;
  latitude: number;
  longitude: number;
  distanceKm: number;
}

export interface MapWorkItem {
  id: string;
  name: string;
  title: string;
  specialty: string;
  rate: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
}

export interface MapSafetyItem {
  id: string;
  type: 'alert' | 'traffic' | 'info';
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  distanceKm: number;
}

export interface MapData {
  events: EventItem[];
  people: MapPersonItem[];
  work: MapWorkItem[];
  safety: MapSafetyItem[];
}

export const eventsService = {
  async getMyEvents(): Promise<EventItem[]> {
    const token = await authService.getToken();
    if (!token) throw new Error("No token found");

    const res = await fetch(`${API_URL}/events/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to fetch events");
    const data = await res.json();
    return data.data;
  },

  async getNearby(params: { latitude: number; longitude: number; radiusKm?: number }): Promise<EventItem[]> {
    const token = await authService.getToken();
    if (!token) throw new Error("No token found");

    const url = new URL(`${API_URL}/events/nearby`);
    url.searchParams.set("lat", params.latitude.toString());
    url.searchParams.set("lon", params.longitude.toString());
    if (params.radiusKm) {
      url.searchParams.set("radiusKm", params.radiusKm.toString());
    }

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to fetch nearby events");
    const data = await res.json();
    return data.data;
  },

  async getMapData(params: { latitude: number; longitude: number; radiusKm?: number; include?: string[] }): Promise<MapData> {
    const token = await authService.getToken();
    if (!token) throw new Error("No token found");

    const url = new URL(`${API_URL}/map/nearby`);
    url.searchParams.set("lat", params.latitude.toString());
    url.searchParams.set("lon", params.longitude.toString());
    if (params.radiusKm) {
      url.searchParams.set("radiusKm", params.radiusKm.toString());
    }
    if (params.include?.length) {
      url.searchParams.set("include", params.include.join(","));
    }

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to fetch map data");
    const data = await res.json();
    return data.data;
  },

  async updateLocation(params: { latitude: number; longitude: number }): Promise<void> {
    const token = await authService.getToken();
    if (!token) throw new Error("No token found");

    const res = await fetch(`${API_URL}/map/location`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    });

    if (!res.ok) throw new Error("Failed to update location");
  },

  async createEvent(payload: Omit<EventItem, "id" | "distanceKm" | "host">): Promise<EventItem> {
    const token = await authService.getToken();
    if (!token) throw new Error("No token found");

    const res = await fetch(`${API_URL}/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Failed to create event");
    const data = await res.json();
    return data.data;
  },

  async deleteEvent(id: string): Promise<void> {
    const token = await authService.getToken();
    if (!token) throw new Error("No token found");

    const res = await fetch(`${API_URL}/events/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Failed to delete event");
  },
};
