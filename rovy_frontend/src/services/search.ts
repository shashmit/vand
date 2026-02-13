import { API_URL } from "../config";

export interface SearchResult {
  id: string;
  type: "user" | "build" | "garage";
  title: string;
  subtitle: string;
  image: string;
}

export const searchService = {
  async search(query: string): Promise<SearchResult[]> {
    if (!query.trim()) return [];
    
    const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error("Search failed");
    }
    
    const data = await response.json();
    return data.data;
  }
};
