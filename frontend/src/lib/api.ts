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
    
    console.log('API Request:', url, options);
    
    try {
      const response = await fetch(url, {
        headers,
        ...options,
      });

      console.log('API Response Status:', response.status, response.statusText);
      console.log('API Response Headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        console.log('Response not OK:', response.status);
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
          console.log('Error Response Text:', errorText);
          if (errorText.startsWith('Error: ')) {
            errorMessage = errorText.replace('Error: ', '');
          } else if (errorText) {
            errorMessage = errorText;
          }
        } catch (e) {
          console.log('Error parsing error response:', e);
          // 에러 메시지 파싱 실패시 기본 메시지 사용
        }
        
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      console.log('API Success:', responseData);
      return responseData;
    } catch (error) {
      console.log('Fetch Error:', error);
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        console.log('Network Error - 이는 CORS 에러일 가능성이 높습니다');
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

// OpenAI API 직접 호출을 위한 클라이언트
const OPENAI_API_KEY = import.meta.env.VITE_CHAT_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1';

class OpenAIClient {
  private async callOpenAI(endpoint: string, payload: any) {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API 키가 설정되지 않았습니다.');
    }

    const response = await fetch(`${OPENAI_API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`OpenAI API 오류: ${response.statusText}`);
    }

    return response.json();
  }

  async refineText(originalText: string, options?: {
    genre?: string;
    style?: string;
    targetAudience?: string;
    instructions?: string;
  }) {
    const prompt = `다음 텍스트를 더 매력적이고 읽기 쉽게 다듬어주세요:
${options?.genre ? `장르: ${options.genre}\n` : ''}${options?.style ? `스타일: ${options.style}\n` : ''}${options?.targetAudience ? `대상 독자: ${options.targetAudience}\n` : ''}${options?.instructions ? `추가 지시사항: ${options.instructions}\n` : ''}
원본 텍스트: ${originalText}

다듬어진 텍스트만 응답으로 제공해주세요.`;

    const response = await this.callOpenAI('/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: '당신은 전문적인 텍스트 편집자입니다.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 2000,
      temperature: 0.7
    });

    return response.choices[0]?.message?.content || '텍스트 다듬기에 실패했습니다.';
  }

  async generateCover(options: {
    title: string;
    author?: string;
    genre?: string;
    mood?: string;
    style?: string;
    colorScheme?: string;
    description?: string;
  }) {
    const prompt = `Create a professional book cover design for:
Title: ${options.title}
${options.author ? `Author: ${options.author}\n` : ''}${options.genre ? `Genre: ${options.genre}\n` : ''}${options.mood ? `Mood: ${options.mood}\n` : ''}${options.style ? `Style: ${options.style}\n` : ''}${options.colorScheme ? `Color scheme: ${options.colorScheme}\n` : ''}${options.description ? `Book description: ${options.description}\n` : ''}
The cover should be modern, eye-catching, and suitable for publication.`;

    const response = await this.callOpenAI('/images/generations', {
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard'
    });

    return response.data[0]?.url || '이미지 생성에 실패했습니다.';
  }
}

const openAIClient = new OpenAIClient();

export const aiApi = {
  // 헬스 체크
  healthCheck: () => apiClient.get('/ais/health'),
  
  // 백엔드를 통한 API 호출
  refineText: (data: {
    originalText: string;
    genre?: string;
    style?: string;
    targetAudience?: string;
    instructions?: string;
  }) => apiClient.post('/ais/refine-text', data),
  
  generateCover: (data: {
    title: string;
    author?: string;
    genre?: string;
    mood?: string;
    style?: string;
    colorScheme?: string;
    description?: string;
  }) => apiClient.post('/ais/generate-cover', data),
  
  // 프론트엔드에서 직접 OpenAI API 호출
  refineTextDirect: (originalText: string, options?: {
    genre?: string;
    style?: string;
    targetAudience?: string;
    instructions?: string;
  }) => openAIClient.refineText(originalText, options),
  
  generateCoverDirect: (options: {
    title: string;
    author?: string;
    genre?: string;
    mood?: string;
    style?: string;
    colorScheme?: string;
    description?: string;
  }) => openAIClient.generateCover(options),
  
  // 기존 API (호환성 유지)
  enhanceContent: (data: any) => apiClient.post('/ai/enhance', data),
  generateSuggestions: (data: any) => apiClient.post('/ai/suggestions', data),
};

// 유틸리티 함수들 export
export { getToken, setAuthData, clearAuthData };
