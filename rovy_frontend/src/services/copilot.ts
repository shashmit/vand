import { API_URL } from '../config';
import { authService } from './auth';

export interface CoPilotProfile {
  id: string;
  isActive: boolean;
  identity: string;
  seeking: string;
  relationshipStyle: string;
  seatBeltRule: boolean;
  tagline: string;
  photos: string[];
  rigPhotos: string[];
  prompts: { question: string; answer: string }[];
  userId: string;
}

export const copilotService = {
  getProfile: async () => {
    const token = await authService.getToken();
    const res = await fetch(`${API_URL}/copilot/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
  },

  updateProfile: async (data: Partial<CoPilotProfile>) => {
    const token = await authService.getToken();
    const res = await fetch(`${API_URL}/copilot`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  },

  getFeed: async () => {
    const token = await authService.getToken();
    const res = await fetch(`${API_URL}/copilot/feed`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch feed');
    return res.json();
  },
  
  getDetail: async (id: string) => {
    const token = await authService.getToken();
    const res = await fetch(`${API_URL}/copilot/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch detail');
    return res.json();
  },

  swipe: async (targetId: string, action: 'LIKE' | 'PASS') => {
    const token = await authService.getToken();
    const res = await fetch(`${API_URL}/copilot/swipe`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ targetId, action }),
    });
    if (!res.ok) throw new Error('Failed to swipe');
    return res.json();
  },

  message: async (targetId: string, content: string) => {
    const token = await authService.getToken();
    const res = await fetch(`${API_URL}/copilot/message`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ targetId, content }),
    });
    if (!res.ok) throw new Error('Failed to send message');
    return res.json();
  },

  getMatches: async () => {
    const token = await authService.getToken();
    const res = await fetch(`${API_URL}/copilot/matches`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch matches');
    return res.json();
  },

  getMessages: async (userId: string) => {
    const token = await authService.getToken();
    const res = await fetch(`${API_URL}/copilot/messages/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch messages');
    return res.json();
  },

  getInbox: async () => {
    const token = await authService.getToken();
    const res = await fetch(`${API_URL}/copilot/inbox`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch inbox');
    return res.json();
  },

  getChats: async () => {
    const token = await authService.getToken();
    const res = await fetch(`${API_URL}/copilot/chats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch chats');
    return res.json();
  },

  uploadImage: async (uri: string, folder?: string) => {
    const token = await authService.getToken();
    
    const formData = new FormData();
    const filename = uri.split('/').pop() || 'photo.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;

    // @ts-ignore: React Native FormData expects this structure
    formData.append('file', {
      uri,
      name: filename,
      type,
    });
    if (folder) {
      formData.append('folder', folder);
    }

    const res = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json',
      },
      body: formData,
    });

    if (!res.ok) {
        const error = await res.text();
        console.error("Upload failed", error);
        throw new Error('Upload failed');
    }
    return res.json();
  },

  uploadPhoto: async (uri: string) => {
    return copilotService.uploadImage(uri, "copilot");
  }
};
