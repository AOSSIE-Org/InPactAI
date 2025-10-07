// AI API Service
// Handles AI-related API calls to the backend

const AI_API_BASE_URL = 'http://localhost:8000/api/ai';

// Types for AI API responses
export interface AIQueryRequest {
  query: string;
  brand_id?: string;
  context?: Record<string, any>;
}

export interface AIQueryResponse {
  intent: string;
  route?: string;
  parameters: Record<string, any>;
  follow_up_needed: boolean;
  follow_up_question?: string;
  explanation: string;
  original_query: string;
  timestamp: string;
}

// AI API Service Class
class AIApiService {
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${AI_API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`AI API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Process AI Query
  async queryAI(query: string, brandId?: string): Promise<AIQueryResponse> {
    const requestBody: AIQueryRequest = { query };
    if (brandId) {
      requestBody.brand_id = brandId;
    }

    return this.makeRequest<AIQueryResponse>('/query', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
  }

  // Get available routes
  async getAvailableRoutes(): Promise<{ available_routes: string[]; total_routes: number }> {
    return this.makeRequest<{ available_routes: string[]; total_routes: number }>('/routes');
  }

  // Get route info
  async getRouteInfo(routeName: string): Promise<{ route_name: string; info: any }> {
    return this.makeRequest<{ route_name: string; info: any }>(`/route/${routeName}`);
  }

  // Test AI query (for development)
  async testQuery(query: string): Promise<any> {
    return this.makeRequest<any>(`/test?query=${encodeURIComponent(query)}`);
  }
}

// Export singleton instance
export const aiApi = new AIApiService(); 