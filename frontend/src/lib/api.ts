// API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// 토큰 관리
const getToken = () => {
  const user = localStorage.getItem('walkingLibraryUser');
  if (user) {
    const userData = JSON.parse(user);
    return userData.token;
  }
  return null;
};

const setAuthData = (authResponse: any) => {
  localStorage.setItem('walkingLibraryUser', JSON.stringify(authResponse));
};

const clearAuthData = () => {
  localStorage.removeItem('walkingLibraryUser');
};

// Generic API client
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    // JWT 토큰이 있으면 Authorization 헤더에 추가
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    console.log('🚀 API Request:', url, options);
    
    try {
      const response = await fetch(url, {
        headers,
        ...options,
      });

      console.log('📡 API Response Status:', response.status, response.statusText);
      console.log('📡 API Response Headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        console.log('❌ Response not OK:', response.status);
        if (response.status === 401) {
          // 토큰이 만료되었거나 유효하지 않은 경우
          clearAuthData();
          window.location.reload();
          throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
        }
        
        // 서버에서 오는 에러 메시지 파싱
        let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
        try {
          const errorText = await response.text();
          console.log('❌ Error Response Text:', errorText);
          if (errorText.startsWith('Error: ')) {
            errorMessage = errorText.replace('Error: ', '');
          } else if (errorText) {
            errorMessage = errorText;
          }
        } catch (e) {
          console.log('❌ Error parsing error response:', e);
          // 에러 메시지 파싱 실패시 기본 메시지 사용
        }
        
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      console.log('✅ API Success:', responseData);
      return responseData;
    } catch (error) {
      console.log('💥 Fetch Error:', error);
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        console.log('💥 Network Error - 이는 CORS 에러일 가능성이 높습니다');
      }
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// 인증 API
export const authApi = {
  signup: (data: {
    userName?: string;
    realName?: string;  // 실명
    penName?: string;   // 필명
    email: string;
    password: string;
    confirmPassword?: string;  // 비밀번호 확인
    isKtCustomer?: boolean;
    role?: string;
  }) => apiClient.post('/auth/signup', data),
  
  login: (data: {
    email: string;
    password: string;
  }) => apiClient.post('/auth/login', data),
  
  getCurrentUser: () => apiClient.get('/users/auth/me'),
  
  logout: () => {
    clearAuthData();
  }
};

// Service-specific API clients
export const userApi = {
  getUsers: () => apiClient.get('/users'),
  getUser: (id: string) => apiClient.get(`/users/${id}`),
  createUser: (data: any) => apiClient.post('/users', data),
  updateUser: (id: string, data: any) => apiClient.put(`/users/${id}`, data),
  deleteUser: (id: string) => apiClient.delete(`/users/${id}`),
};

export const authorApi = {
  getAuthors: () => apiClient.get('/authors'),
  getAuthor: (id: string) => apiClient.get(`/authors/${id}`),
  createAuthor: (data: any) => apiClient.post('/authors', data),
  updateAuthor: (id: string, data: any) => apiClient.put(`/authors/${id}`, data),
  deleteAuthor: (id: string) => apiClient.delete(`/authors/${id}`),
};

export const bookApi = {
  getBooks: () => apiClient.get('/books'),
  getBook: (id: string) => apiClient.get(`/books/${id}`),
  createBook: (data: any) => apiClient.post('/books', data),
  updateBook: (id: string, data: any) => apiClient.put(`/books/${id}`, data),
  deleteBook: (id: string) => apiClient.delete(`/books/${id}`),
  getBestsellerBooks: () => apiClient.get('/books?bestseller=true'),
};

export const pointApi = {
  getPoints: (userId: string) => apiClient.get(`/points?userId=${userId}`),
  chargePoints: (data: any) => apiClient.post('/points', data),
  usePoints: (data: any) => apiClient.post('/points/use', data),
};

export const subscriptionApi = {
  getSubscriptions: (userId: string) => apiClient.get(`/subscriptions?userId=${userId}`),
  createSubscription: (data: any) => apiClient.post('/subscriptions', data),
  cancelSubscription: (id: string) => apiClient.delete(`/subscriptions/${id}`),
};

export const manuscriptApi = {
  getManuscripts: () => apiClient.get('/manuscripts'),
  getManuscript: (id: string) => apiClient.get(`/manuscripts/${id}`),
  createManuscript: (data: any) => apiClient.post('/manuscripts', data),
  updateManuscript: (id: string, data: any) => apiClient.put(`/manuscripts/${id}`, data),
  deleteManuscript: (id: string) => apiClient.delete(`/manuscripts/${id}`),
  publishManuscript: (id: string) => apiClient.post(`/manuscripts/${id}/publish`),
};

export const aiApi = {
  enhanceContent: (data: any) => apiClient.post('/ai/enhance', data),
  generateSuggestions: (data: any) => apiClient.post('/ai/suggestions', data),
};

// 유틸리티 함수들 export
export { getToken, setAuthData, clearAuthData };
