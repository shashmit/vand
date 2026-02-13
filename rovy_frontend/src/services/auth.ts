import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { API_URL, TOKEN_KEY } from "../config";
import { AuthResponse, OnboardingData, Profile } from "../types/auth";

export const authService = {
  async saveToken(token: string) {
    if (Platform.OS === "web") {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    }
  },

  async getToken() {
    if (Platform.OS === "web") {
      return localStorage.getItem(TOKEN_KEY);
    } else {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    }
  },

  async deleteToken() {
    if (Platform.OS === "web") {
      localStorage.removeItem(TOKEN_KEY);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to login");
    }

    const data = await response.json();
    await this.saveToken(data.data.session.access_token);
    return data;
  },

  async signup(email: string, password: string, inviteCode: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, inviteCode }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to sign up");
    }

    const data = await response.json();
    await this.saveToken(data.data.session.access_token);
    return data;
  },

  async completeOnboarding(data: OnboardingData): Promise<Profile> {
    const token = await this.getToken();
    if (!token) throw new Error("No token found");

    const response = await fetch(`${API_URL}/profiles/onboarding/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to complete onboarding");
    }

    const resData = await response.json();
    return resData.data;
  },

  async getProfile(): Promise<Profile & { email: string }> {
    const token = await this.getToken();
    if (!token) throw new Error("No token found");

    const response = await fetch(`${API_URL}/profiles/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch profile");
    }

    const data = await response.json();
    return data.data;
  },
};
