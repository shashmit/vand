import { Platform } from "react-native";

const getApiUrl = () => {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  if (!apiUrl) {
    // Fallback if env is missing (development safety)
    return Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000";
  }

  if (Platform.OS === "android" && apiUrl.includes("localhost")) {
    return apiUrl.replace("localhost", "10.0.2.2");
  }

  return apiUrl;
};

export const API_URL = getApiUrl();
export const TOKEN_KEY = process.env.EXPO_PUBLIC_AUTH_TOKEN_KEY || "rovy_auth_token";
