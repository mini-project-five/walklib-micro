// API client for microservices
const API_BASE_URL = '/'; // Gateway URL

export interface User {
  userId?: number;
  userName: string;
  email: string;
  userPassword: string;
  userType: 'reader' | 'author';
  coins?: number;
  isSubscribed?: boolean;
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
  price: number;
  authorId: number;
  publishedDate?: string;
  category?: string;
}

export interface Manuscript {
  manuscriptId?: number;
  authorId: number;
  title: string;
  content: string;
  status?: string;
  updatedAt?: string;
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
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// User API
export const userAPI = {
  create: (user: User) => apiRequest<User>('users', {
    method: 'POST',
    body: JSON.stringify(user),
  }),
  
  getAll: () => apiRequest<{_embedded: {users: User[]}}>('users'),
  
  getById: (id: number) => apiRequest<User>(`users/${id}`),
  
  update: (id: number, user: Partial<User>) => apiRequest<User>(`users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(user),
  }),
};

// Author API
export const authorAPI = {
  create: (author: Author) => apiRequest<Author>('authors', {
    method: 'POST',
    body: JSON.stringify(author),
  }),
  
  getAll: () => apiRequest<Author[] | {_embedded: {authors: Author[]}}>('authors'),
  
  getById: (id: number) => apiRequest<Author>(`authors/${id}`),
  
  update: (id: number, author: Partial<Author>) => apiRequest<Author>(`authors/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(author),
  }),
};

// Book API
export const bookAPI = {
  create: (book: Book) => apiRequest<Book>('books', {
    method: 'POST',
    body: JSON.stringify(book),
  }),
  
  getAll: () => apiRequest<{_embedded: {books: Book[]}}>('books'),
  
  getById: (id: number) => apiRequest<Book>(`books/${id}`),
  
  update: (id: number, book: Partial<Book>) => apiRequest<Book>(`books/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(book),
  }),
};

// Manuscript API
export const manuscriptAPI = {
  create: (manuscript: Manuscript) => apiRequest<Manuscript>('manuscripts', {
    method: 'POST',
    body: JSON.stringify(manuscript),
  }),
  
  getAll: () => apiRequest<{_embedded: {manuscripts: Manuscript[]}}>('manuscripts'),
  
  getById: (id: number) => apiRequest<Manuscript>(`manuscripts/${id}`),
  
  getByAuthor: (authorId: number) => apiRequest<{_embedded: {manuscripts: Manuscript[]}}>(`manuscripts?authorId=${authorId}`),
  
  update: (id: number, manuscript: Partial<Manuscript>) => apiRequest<Manuscript>(`manuscripts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(manuscript),
  }),
};

// Point API
export const pointAPI = {
  create: (point: Point) => apiRequest<Point>('points', {
    method: 'POST',
    body: JSON.stringify(point),
  }),
  
  getByUser: (userId: number) => apiRequest<{_embedded: {points: Point[]}}>(`points?userId=${userId}`),
  
  getTotalByUser: (userId: number) => apiRequest<number>(`points/user/${userId}/total`),
};

// Subscription API
export const subscriptionAPI = {
  create: (subscription: Subscription) => apiRequest<Subscription>('subscriptions', {
    method: 'POST',
    body: JSON.stringify(subscription),
  }),
  
  getByUser: (userId: number) => apiRequest<{_embedded: {subscriptions: Subscription[]}}>(`subscriptions?userId=${userId}`),
  
  getActiveByUser: (userId: number) => apiRequest<Subscription>(`subscriptions/user/${userId}/active`),
};

// AI API
export const aiAPI = {
  polishText: (title: string, content: string) => apiRequest<{
    success: boolean;
    polishedTitle: string;
    polishedContent: string;
  }>('ai/polish', {
    method: 'POST',
    body: JSON.stringify({ title, content }),
  }),
  
  generateCover: (title: string) => apiRequest<{
    success: boolean;
    coverImageUrl: string;
    coverEmoji: string;
  }>('ai/cover', {
    method: 'POST',
    body: JSON.stringify({ title }),
  }),
  
  generateSummary: (content: string) => apiRequest<{
    success: boolean;
    summary: string;
  }>('ai/summary', {
    method: 'POST',
    body: JSON.stringify({ content }),
  }),
};