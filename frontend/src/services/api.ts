// API client for microservices
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''; // Use relative path for production

export interface User {
  userId?: number;
  userName: string;
  email: string;
  userPassword: string;
  role?: 'READER' | 'AUTHOR' | 'ADMIN';
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  isKtCustomer?: boolean;
  registeredAt?: string;
  lastLoginAt?: string;
}

export interface Author {
  authorId?: number;
  authorName: string;
  email: string;
  introduction: string;
  authorPassword: string;
  realName: string;
  authorRegisterStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface Book {
  bookId?: number;
  title: string;
  content: string;
  price?: number;
  pointCost?: number;
  isFree?: boolean;
  authorId: number;
  publishedDate?: string;
  category?: string;
  summary?: string;
  coverImageUrl?: string;
  manuscriptId?: number;
  viewCount?: number;
  totalRating?: number;
  ratingCount?: number;
  isBestseller?: boolean;
  status?: string;
}

export interface Manuscript {
  manuscriptId?: number;
  authorId: number;
  title: string;
  content: string;
  status?: string;
  updatedAt?: string;
  coverImageUrl?: string;
  views?: number;
}

export interface Point {
  pointId?: number;
  userId: number;
  amount: number;
  pointType: 'PURCHASE' | 'USAGE';
  description?: string;
}

export interface Subscription {
  subscriptionId?: number;
  userId: number;
  planType: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  _embedded?: { [key: string]: T[] };
}

// Generic API functions
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return response.json();
}

// User API
export const userAPI = {
  create: async (user: Omit<User, 'userId'>) => {
    const response = await apiRequest<ApiResponse<User>>('/auth/users/register', {
      method: 'POST',
      body: JSON.stringify({
        email: user.email,
        password: user.userPassword,
        userName: user.userName,
        role: user.role || 'READER'
      }),
    });
    
    if (response.success) {
      return response.user || response.data;
    } else {
      throw new Error(response.error || 'Failed to create user');
    }
  },
  
  login: async (email: string, password: string) => {
    const response = await apiRequest<ApiResponse<User>>('/auth/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.success) {
      return response.user || response.data;
    } else {
      throw new Error(response.error || 'Login failed');
    }
  },
  
  getAll: async () => {
    const response = await apiRequest<ApiResponse<User[]>>('/api/users');
    return response._embedded?.users || [];
  },
  
  getById: (id: number) => apiRequest<User>(`/api/users/${id}`),
  
  update: async (id: number, updates: Partial<User>) => {
    const response = await apiRequest<ApiResponse<User>>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    
    if (response.success) {
      return response.user || response.data;
    } else {
      throw new Error(response.error || 'Failed to update user');
    }
  },
  
  promoteToAuthor: async (id: number) => {
    const response = await apiRequest<ApiResponse<User>>(`/api/users/${id}/promote-to-author`, {
      method: 'POST',
    });
    
    if (response.success) {
      return response.user || response.data;
    } else {
      throw new Error(response.error || 'Failed to promote user to author');
    }
  },
  
  updateStatus: async (id: number, status: string) => {
    const response = await apiRequest<ApiResponse<User>>(`/api/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    
    if (response.success) {
      return response.user || response.data;
    } else {
      throw new Error(response.error || 'Failed to update user status');
    }
  },
};

// Author API
export const authorAPI = {
  register: async (author: Omit<Author, 'authorId'>) => {
    const response = await apiRequest<ApiResponse<Author>>('/auth/authors/register', {
      method: 'POST',
      body: JSON.stringify({
        email: author.email,
        password: author.authorPassword,
        authorName: author.authorName,
        realName: author.realName,
        introduction: author.introduction
      }),
    });
    
    if (response.success) {
      return response.author || response.data;
    } else {
      throw new Error(response.error || 'Failed to register author');
    }
  },

  login: async (email: string, password: string) => {
    const response = await apiRequest<ApiResponse<Author>>('/auth/authors/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.success) {
      return response.author || response.data;
    } else {
      throw new Error(response.error || 'Login failed');
    }
  },

  create: async (author: Author) => {
    return await apiRequest<Author>('/authors', {
      method: 'POST',
      body: JSON.stringify(author),
    });
  },
  
  getAll: async () => {
    const response = await apiRequest<any>('/authors');
    return response._embedded?.authors || [];
  },
  
  getById: async (id: number) => {
    const response = await apiRequest<any>(`/public/authors/${id}/name`);
    return response;
  },
  
  update: async (id: number, author: Partial<Author>) => {
    return await apiRequest<Author>(`/authors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(author),
    });
  },
  
  approve: async (id: number) => {
    return await apiRequest<Author>(`/authors/${id}/approve`, {
      method: 'POST',
    });
  },
  
  reject: async (id: number) => {
    return await apiRequest<Author>(`/authors/${id}/reject`, {
      method: 'POST',
    });
  },
};

// Book API
export const bookAPI = {
  create: async (book: Omit<Book, 'bookId'>) => {
    const response = await apiRequest<ApiResponse<Book>>('/books', {
      method: 'POST',
      body: JSON.stringify(book),
    });
    
    if (response.success) {
      return response.book || response.data;
    } else {
      throw new Error(response.error || 'Failed to create book');
    }
  },
  
  getAll: async () => {
    const response = await apiRequest<ApiResponse<Book[]>>('/books');
    return response._embedded?.books || [];
  },
  
  getById: async (id: number) => {
    const response = await apiRequest<ApiResponse<Book>>(`/books/${id}`);
    if (response.success) {
      return response.book || response.data;
    } else {
      throw new Error(response.error || 'Book not found');
    }
  },
  
  getBestsellers: async () => {
    const response = await apiRequest<ApiResponse<Book[]>>('/books/bestsellers');
    return response._embedded?.books || [];
  },
  
  getNewBooks: async () => {
    const response = await apiRequest<ApiResponse<Book[]>>('/books/new');
    return response._embedded?.books || [];
  },
  
  getByAuthor: async (authorId: number) => {
    const response = await apiRequest<ApiResponse<Book[]>>(`/books/author/${authorId}`);
    return response._embedded?.books || [];
  },
  
  update: async (id: number, book: Partial<Book>) => {
    const response = await apiRequest<ApiResponse<Book>>(`/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(book),
    });
    
    if (response.success) {
      return response.book || response.data;
    } else {
      throw new Error(response.error || 'Failed to update book');
    }
  },
  
  incrementView: async (id: number) => {
    const response = await apiRequest<ApiResponse<Book>>(`/books/${id}/view`, {
      method: 'POST',
    });
    
    if (response.success) {
      return response.book || response.data;
    } else {
      throw new Error(response.error || 'Failed to increment view count');
    }
  },

  addRating: async (id: number, rating: number) => {
    const response = await apiRequest<ApiResponse<Book & { averageRating: number }>>(`/books/${id}/rating`, {
      method: 'POST',
      body: JSON.stringify({ rating }),
    });
    
    if (response.success) {
      return response;
    } else {
      throw new Error(response.error || 'Failed to add rating');
    }
  },

  readBook: async (id: number, userId: number) => {
    const response = await apiRequest<ApiResponse<Book & { pointCost: number; isFree: boolean }>>(`/books/${id}/read`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
    
    if (response.success) {
      return response;
    } else {
      throw new Error(response.error || 'Failed to read book');
    }
  },
};

// Manuscript API
export const manuscriptAPI = {
  create: async (manuscript: Omit<Manuscript, 'manuscriptId'>) => {
    const response = await apiRequest<ApiResponse<Manuscript>>('/manuscripts', {
      method: 'POST',
      body: JSON.stringify(manuscript),
    });
    
    if (response.success) {
      return response.manuscript || response.data;
    } else {
      throw new Error(response.error || 'Failed to create manuscript');
    }
  },
  
  getAll: async () => {
    const response = await apiRequest<ApiResponse<Manuscript[]>>('/manuscripts');
    return response._embedded?.manuscripts || [];
  },
  
  getById: (id: number) => apiRequest<Manuscript>(`/manuscripts/${id}`),
  
  getByAuthor: async (authorId: number) => {
    return await apiRequest<ApiResponse<Manuscript[]>>(`/manuscripts/author/${authorId}`);
  },
  
  getByStatus: async (status: string) => {
    const response = await apiRequest<ApiResponse<Manuscript[]>>(`/manuscripts/status/${status}`);
    return response._embedded?.manuscripts || [];
  },
  
  update: async (id: number, manuscript: Partial<Manuscript>) => {
    const response = await apiRequest<ApiResponse<Manuscript>>(`/manuscripts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(manuscript),
    });
    
    if (response.success) {
      return response.manuscript || response.data;
    } else {
      throw new Error(response.error || 'Failed to update manuscript');
    }
  },
  
  requestPublication: async (id: number) => {
    const response = await apiRequest<ApiResponse<Manuscript>>(`/manuscripts/${id}/request-publication`, {
      method: 'POST',
    });
    
    if (response.success) {
      return response.manuscript || response.data;
    } else {
      throw new Error(response.error || 'Failed to request publication');
    }
  },
};

// Point API
export const pointAPI = {
  create: (point: Point) => apiRequest<Point>('/points', {
    method: 'POST',
    body: JSON.stringify(point),
  }),
  
  getByUser: (userId: number) => apiRequest<{_embedded: {points: Point[]}}>(`/points?userId=${userId}`),
  
  getTotalByUser: (userId: number) => apiRequest<number>(`/points/user/${userId}/total`),

  purchase: async (userId: number, amount: number) => {
    const response = await apiRequest<ApiResponse<any>>('/points/purchase', {
      method: 'POST',
      body: JSON.stringify({ userId, amount }),
    });
    
    if (response.success) {
      return response;
    } else {
      throw new Error(response.error || 'Failed to purchase points');
    }
  },

  getBalance: async (userId: number) => {
    const response = await apiRequest<ApiResponse<{ pointBalance: number }>>(`/points/user/${userId}/balance`);
    
    if (response.success) {
      return response;
    } else {
      throw new Error(response.error || 'Failed to get point balance');
    }
  },
};

// Subscription API
export const subscriptionAPI = {
  create: (subscription: Subscription) => apiRequest<Subscription>('/subscriptions', {
    method: 'POST',
    body: JSON.stringify(subscription),
  }),
  
  getByUser: (userId: number) => apiRequest<{_embedded: {subscriptions: Subscription[]}}>(`/subscriptions?userId=${userId}`),
  
  getActiveByUser: (userId: number) => apiRequest<Subscription>(`/subscriptions/user/${userId}/active`),
};

// AI API
export const aiAPI = {
  polishText: async (title: string, content: string) => {
    const response = await apiRequest<{
      success: boolean;
      polishedTitle: string;
      polishedContent: string;
      error?: string;
    }>('/ai/polish', {
      method: 'POST',
      body: JSON.stringify({ title, content }),
    });
    
    if (response.success) {
      return {
        success: true,
        polishedTitle: response.polishedTitle,
        polishedContent: response.polishedContent,
      };
    } else {
      throw new Error(response.error || 'Failed to polish text');
    }
  },
  
  generateCover: async (title: string) => {
    const response = await apiRequest<{
      success: boolean;
      coverImageUrl: string;
      coverEmoji: string;
      error?: string;
    }>('/ai/cover', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
    
    if (response.success) {
      return {
        success: true,
        coverImageUrl: response.coverImageUrl,
        coverEmoji: response.coverEmoji,
      };
    } else {
      throw new Error(response.error || 'Failed to generate cover');
    }
  },
  
  generateSummary: async (content: string) => {
    const response = await apiRequest<{
      success: boolean;
      summary: string;
      error?: string;
    }>('/ai/summary', {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
    
    if (response.success) {
      return {
        success: true,
        summary: response.summary,
      };
    } else {
      throw new Error(response.error || 'Failed to generate summary');
    }
  },
};