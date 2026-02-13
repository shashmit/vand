import { API_URL } from '../config';
import { authService } from './auth';

export interface WeatherData {
  temperature: string;
  condition: string;
  location: string;
  alert?: string;
}

export interface NewsItem {
  id: string;
  type: 'alert' | 'traffic' | 'info';
  title: string;
  description: string;
  timestamp: string;
}

export interface CaravanMember {
  id: string;
  name: string;
  avatarUrl: string;
  distance: string;
}

export interface EventItem {
  id: string;
  title: string;
  location: string;
  distance: string;
  date: string;
  imageUrl?: string;
  isPinned?: boolean;
}

export interface FeedData {
  weather: WeatherData;
  news: NewsItem[];
  caravans: CaravanMember[];
  travelers: CaravanMember[];
  nearbyEvents: EventItem[];
}

export const feedService = {
  getFeed: async (): Promise<FeedData> => {
    const token = await authService.getToken();
    const res = await fetch(`${API_URL}/feed`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!res.ok) {
        throw new Error('Failed to fetch feed');
    }
    
    const body = await res.json();
    return body.data ?? body;
  },

  pinEvent: async (id: string) => {
    const token = await authService.getToken();
    await fetch(`${API_URL}/feed/events/${id}/pin`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
    });
  },
  
  unpinEvent: async (id: string) => {
    const token = await authService.getToken();
    await fetch(`${API_URL}/feed/events/${id}/pin`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
    });
  }
};
