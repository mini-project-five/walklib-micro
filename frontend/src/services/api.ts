// API client for microservices
const API_BASE_URLS = {
  user: '',  // 프록시를 통해 /users로 요청
  author: '', // 프록시를 통해 /authors로 요청 
  book: '',  // 프록시를 통해 /books로 요청
  manuscript: '', // 프록시를 통해 /manuscripts로 요청
  point: '', // 프록시를 통해 /points로 요청
  subscription: '', // 프록시를 통해 /subscriptions로 요청
  ai: '', // 프록시를 통해 /ai로 요청
  gateway: 'http://localhost:8080'
};

export interface User {
  userId?: number;
  userName: string;
  email: string;
  userPassword: string;
  userType: 'reader' | 'author';
  // coins?: number; // 포인트는 별도 서비스에서 관리
  isSubscribed?: boolean;
  isKtCustomer?: boolean;
  ktAuthRequested?: boolean;
  ktAuthApproved?: boolean;
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
  authorId: number;
  status?: string;
  coverImage?: string;
  viewCount?: number;
  isBestseller?: boolean;
  createdAt?: string;
  publishedAt?: string;
}

export interface Manuscript {
  manuscriptId?: number;
  authorId: number;
  title: string;
  content: string;
  status?: 'DRAFT' | 'PUBLISHED';
  coverImage?: string;
  viewCount?: number; // 조회수 (기본값 0)
  updatedAt?: string;
}

export interface Point {
  pointId?: number;
  userId: number;
  pointBalance: number;
  amount: number;
  pointType: 'SIGNUP' | 'KT_SIGNUP' | 'CHARGE' | 'USAGE';
  description?: string;
  createdAt?: string;
}

export interface Subscription {
  subscriptionId?: number;
  userId: number;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
  planType: string;
  monthlyFee?: number;
  startDate: string;
  endDate: string;
  isActive?: boolean;
  createdAt?: string;
}

// Generic API functions
async function apiRequest<T>(baseUrl: string, endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${baseUrl}/${endpoint}`;
  
  // 요청 로그 출력
  console.log('=== API REQUEST ===');
  console.log('URL:', url);
  console.log('Method:', options.method || 'GET');
  console.log('Headers:', {
    'Content-Type': 'application/json',
    ...options.headers,
  });
  if (options.body) {
    console.log('Body:', options.body);
    console.log('Parsed Body:', JSON.parse(options.body as string));
  }
  console.log('==================');
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  // 응답 로그 출력
  console.log('=== API RESPONSE ===');
  console.log('Status:', response.status, response.statusText);
  console.log('URL:', url);
  
  if (!response.ok) {
    console.log('Error Response:', response);
    console.log('===================');
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  console.log('Response Data:', result);
  console.log('===================');
  
  return result;
}

// User API
export const userAPI = {
  create: (user: User) => apiRequest<User>(API_BASE_URLS.user, 'users', {
    method: 'POST',
    body: JSON.stringify(user),
  }),
  
  getAll: () => apiRequest<{_embedded: {users: User[]}}>(API_BASE_URLS.user, 'users'),
  
  getById: (id: number) => apiRequest<User>(API_BASE_URLS.user, `users/${id}`),
  
  update: (id: number, user: Partial<User>) => apiRequest<User>(API_BASE_URLS.user, `users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(user),
  }),

  // 독자 로그인 API
  login: async (email: string, password: string) => {
    console.log('💻 User Login API 호출:', { email });
    try {
      const response = await apiRequest<User[] | {_embedded?: {users: User[]}, users?: User[]}>(API_BASE_URLS.user, 'users');
      console.log('📋 모든 사용자 조회 결과:', response);
      
      // 응답이 배열인지 객체인지 확인
      let userList: User[] = [];
      if (Array.isArray(response)) {
        userList = response;
      } else if (response._embedded?.users) {
        userList = response._embedded.users;
      } else if (response.users) {
        userList = response.users;
      }
      
      console.log('📝 파싱된 사용자 목록:', userList);
      console.log('🔍 찾는 조건:', { email, password, userType: 'reader' });
      
      const user = userList.find(u => {
        console.log('👤 비교 중인 사용자:', {
          storedEmail: u.email,
          storedPassword: u.userPassword,
          storedType: u.userType
        });
        return u.email === email && u.userPassword === password && u.userType === 'reader';
      });
      
      if (user) {
        console.log('✅ 독자 로그인 성공:', user);
        return user;
      } else {
        console.log('❌ 독자 로그인 실패: 사용자를 찾을 수 없음');
        throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
      }
    } catch (error) {
      console.error('❌ 독자 로그인 오류:', error);
      throw error;
    }
  },

  // 독자 회원가입 API
  register: async (userData: {
    name: string, 
    email: string, 
    password: string, 
    isKtCustomer?: boolean,
    ktAuthRequested?: boolean,
    ktAuthApproved?: boolean
  }) => {
    console.log('📝 User Register API 호출:', userData);
    try {
      const newUser: User = {
        userName: userData.name,
        email: userData.email,
        userPassword: userData.password,
        userType: 'reader',
        // coins: 0, // 포인트는 별도 서비스에서 관리
        isSubscribed: false,
        ktAuthRequested: userData.ktAuthRequested || false,
        ktAuthApproved: userData.ktAuthApproved || false
      };
      
      // 1. 사용자 생성
      const createdUser = await apiRequest<User>(API_BASE_URLS.user, 'users', {
        method: 'POST',
        body: JSON.stringify(newUser),
      });
      
      console.log('✅ 독자 회원가입 성공:', createdUser);
      
      // 2. 기본 신규 가입 포인트 지급 (1,000P)
      if (createdUser.userId) {
        try {
          const pointResult = await pointAPI.giveSignupPoints(createdUser.userId, false); // 기본 포인트만
          console.log('✅ 기본 신규 가입 포인트 지급 성공:', pointResult);
        } catch (pointError) {
          console.warn('⚠️ 포인트 지급 실패:', pointError);
          // 포인트 지급 실패해도 회원가입은 성공으로 처리
        }
        
        // 3. KT 인증 요청이 있다면 처리
        if (userData.ktAuthRequested) {
          try {
            await apiRequest(API_BASE_URLS.user, `users/${createdUser.userId}/kt-auth-request`, {
              method: 'POST'
            });
            console.log('✅ KT 인증 요청 처리 완료');
          } catch (ktError) {
            console.warn('⚠️ KT 인증 요청 처리 실패:', ktError);
          }
        }
      }
      
      return createdUser;
    } catch (error) {
      console.error('❌ 독자 회원가입 오류:', error);
      throw error;
    }
  },

  // KT 인증 관련 API들
  requestKtAuth: async (userId: number) => {
    return await apiRequest(API_BASE_URLS.user, `users/${userId}/kt-auth-request`, {
      method: 'POST'
    });
  },
  
  approveKtAuth: async (userId: number) => {
    return await apiRequest(API_BASE_URLS.user, `users/${userId}/kt-auth-approve`, {
      method: 'POST'
    });
  },
  
  rejectKtAuth: async (userId: number) => {
    return await apiRequest(API_BASE_URLS.user, `users/${userId}/kt-auth-reject`, {
      method: 'POST'
    });
  },
  
  getKtAuthPendingUsers: async () => {
    return await apiRequest<User[]>(API_BASE_URLS.user, 'users/kt-auth-pending', {
      method: 'GET'
    });
  },
};

// Author API
export const authorAPI = {
  create: (author: Author) => apiRequest<Author>(API_BASE_URLS.author, 'authors', {
    method: 'POST',
    body: JSON.stringify(author),
  }),
  
  getAll: () => apiRequest<Author[] | {_embedded: {authors: Author[]}}>(API_BASE_URLS.author, 'authors'),
  
  getById: (id: number) => apiRequest<Author>(API_BASE_URLS.author, `authors/${id}`),
  
  update: (id: number, author: Partial<Author>) => apiRequest<Author>(API_BASE_URLS.author, `authors/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(author),
  }),

  // 작가 로그인 API
  login: async (email: string, password: string) => {
    console.log('💻 Author Login API 호출:', { email });
    try {
      const response = await apiRequest<Author[] | {_embedded?: {authors: Author[]}, authors?: Author[]}>(API_BASE_URLS.author, 'authors');
      console.log('📋 모든 작가 조회 결과:', response);
      
      // 응답이 배열인지 객체인지 확인
      let authorList: Author[] = [];
      if (Array.isArray(response)) {
        authorList = response;
      } else if (response._embedded?.authors) {
        authorList = response._embedded.authors;
      } else if (response.authors) {
        authorList = response.authors;
      }
      
      console.log('📝 파싱된 작가 목록:', authorList);
      console.log('🔍 찾는 조건:', { email, password });
      
      const author = authorList.find(a => {
        console.log('👤 비교 중인 작가:', {
          storedEmail: a.email,
          storedPassword: a.authorPassword
        });
        return a.email === email && a.authorPassword === password;
      });
      
      if (author) {
        console.log('✅ 작가 로그인 성공:', author);
        return author;
      } else {
        console.log('❌ 작가 로그인 실패: 작가를 찾을 수 없음');
        throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
      }
    } catch (error) {
      console.error('❌ 작가 로그인 오류:', error);
      throw error;
    }
  },

  // 작가 회원가입 API
  register: async (authorData: {authorName: string, email: string, authorPassword: string, introduction: string, realName: string}) => {
    console.log('📝 Author Register API 호출:', authorData);
    try {
      const newAuthor: Author = {
        authorName: authorData.authorName,
        email: authorData.email,
        authorPassword: authorData.authorPassword,
        introduction: authorData.introduction,
        realName: authorData.realName,
        authorRegisterStatus: 'PENDING'
      };
      
      const result = await apiRequest<Author>(API_BASE_URLS.author, 'authors', {
        method: 'POST',
        body: JSON.stringify(newAuthor),
      });
      
      console.log('✅ 작가 회원가입 성공:', result);
      return result;
    } catch (error) {
      console.error('❌ 작가 회원가입 오류:', error);
      throw error;
    }
  },
};

// Book API
export const bookAPI = {
  create: (book: Book) => apiRequest<Book>(API_BASE_URLS.book, 'books', {
    method: 'POST',
    body: JSON.stringify(book),
  }),
  
  getAll: () => apiRequest<Book[]>(API_BASE_URLS.book, 'books'),
  
  getById: (id: number) => apiRequest<Book>(API_BASE_URLS.book, `books/${id}`),
  
  getByAuthor: (authorId: number) => apiRequest<Book[]>(API_BASE_URLS.book, `books/author/${authorId}`),
  
  // 출간된 책만 조회
  getPublished: () => apiRequest<Book[]>(API_BASE_URLS.book, 'books/published'),
  
  // 작가별 출간된 책 조회
  getPublishedByAuthor: (authorId: number) => apiRequest<Book[]>(API_BASE_URLS.book, `books/author/${authorId}/published`),
  
  update: (id: number, book: Partial<Book>) => apiRequest<Book>(API_BASE_URLS.book, `books/${id}`, {
    method: 'PUT',
    body: JSON.stringify(book),
  }),
  
  publish: (id: number) => apiRequest<Book>(API_BASE_URLS.book, `books/${id}/publish`, {
    method: 'PATCH',
  }),
  
  // 조회수 증가
  incrementView: (id: number) => apiRequest<Book>(API_BASE_URLS.book, `books/${id}/view`, {
    method: 'PATCH',
  }),
  
  delete: (id: number) => apiRequest<void>(API_BASE_URLS.book, `books/${id}`, {
    method: 'DELETE',
  }),
};

// Manuscript API (진짜 원고 관리)
export const manuscriptAPI = {
  create: (manuscript: Manuscript) => apiRequest<Manuscript>(API_BASE_URLS.manuscript, 'manuscripts', {
    method: 'POST',
    body: JSON.stringify(manuscript),
  }),
  
  getAll: () => apiRequest<Manuscript[]>(API_BASE_URLS.manuscript, 'manuscripts'),
  
  getById: (id: number) => apiRequest<Manuscript>(API_BASE_URLS.manuscript, `manuscripts/${id}`),
  
  getByAuthor: (authorId: number) => apiRequest<Manuscript[]>(API_BASE_URLS.manuscript, `manuscripts/author/${authorId}`),
  
  update: (id: number, manuscript: Partial<Manuscript>) => apiRequest<Manuscript>(API_BASE_URLS.manuscript, `manuscripts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(manuscript),
  }),
  
  // 원고를 Book으로 출간
  publish: async (manuscriptId: number) => {
    console.log('=== MANUSCRIPT PUBLISH PROCESS START ===');
    console.log('Publishing manuscript ID:', manuscriptId);
    
    try {
      // 1. 원고 조회
      console.log('Step 1: Fetching manuscript...');
      const manuscript = await apiRequest<Manuscript>(API_BASE_URLS.manuscript, `manuscripts/${manuscriptId}`);
      console.log('Manuscript fetched:', manuscript);
      
      // 2. Book으로 변환하여 생성
      console.log('Step 2: Creating book from manuscript...');
      const book: Book = {
        title: manuscript.title,
        content: manuscript.content,
        authorId: manuscript.authorId,
        status: 'DRAFT',
        coverImage: manuscript.coverImage,
      };
      console.log('Book data to create:', book);
      
      const createdBook = await bookAPI.create(book);
      console.log('Book created:', createdBook);
      
      // 3. 즉시 출간
      console.log('Step 3: Publishing book...');
      const publishedBook = await bookAPI.publish(createdBook.bookId!);
      console.log('Book published:', publishedBook);
      
      // 4. 원고 상태를 PUBLISHED로 업데이트
      console.log('Step 4: Updating manuscript status to PUBLISHED...');
      const updatedManuscript = await apiRequest<Manuscript>(API_BASE_URLS.manuscript, `manuscripts/${manuscriptId}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...manuscript,
          status: 'PUBLISHED'
        }),
      });
      console.log('Manuscript status updated:', updatedManuscript);
      
      console.log('=== MANUSCRIPT PUBLISH PROCESS COMPLETE ===');
      
      return publishedBook;
    } catch (error) {
      console.error('=== MANUSCRIPT PUBLISH PROCESS FAILED ===');
      console.error('Error at manuscript ID:', manuscriptId);
      console.error('Error details:', error);
      console.log('=== MANUSCRIPT PUBLISH PROCESS FAILED ===');
      throw error;
    }
  },
  
  delete: (id: number) => apiRequest<void>(API_BASE_URLS.manuscript, `manuscripts/${id}`, {
    method: 'DELETE',
  }),

  // 조회수 증가 (독자가 도서를 클릭할 때)
  incrementView: async (id: number) => {
    console.log('📈 manuscripts 조회수 증가 API 호출:', id);
    try {
      const result = await apiRequest<Manuscript>(API_BASE_URLS.manuscript, `manuscripts/${id}/view`, {
        method: 'PATCH',
      });
      console.log('✅ manuscripts 조회수 증가 성공:', result);
      return result;
    } catch (error) {
      console.error('❌ manuscripts 조회수 증가 실패:', error);
      throw error;
    }
  },
};

// Point API
export const pointAPI = {
  // 사용자 포인트 잔액 조회
  getBalance: (userId: number) => apiRequest<number>(API_BASE_URLS.point, `points/user/${userId}/balance`),
  
  // 사용자 포인트 내역 조회
  getByUser: (userId: number) => apiRequest<Point[]>(API_BASE_URLS.point, `points/user/${userId}`),
  
  // 신규 가입 포인트 지급
  giveSignupPoints: (userId: number, isKtCustomer: boolean = false) => apiRequest<Point>(API_BASE_URLS.point, 'points/signup', {
    method: 'POST',
    body: JSON.stringify({ userId, ktCustomer: isKtCustomer }),
  }),
  
  // 포인트 사용 (도서 구매)
  usePoints: (userId: number, amount: number, description?: string) => apiRequest<Point>(API_BASE_URLS.point, 'points/use', {
    method: 'POST',
    body: JSON.stringify({ userId, amount, description }),
  }),
  
  // 포인트 충전
  chargePoints: (userId: number, amount: number) => apiRequest<Point>(API_BASE_URLS.point, 'points/charge', {
    method: 'POST',
    body: JSON.stringify({ userId, amount }),
  }),
  
  // KT 인증 승인 후 보너스 포인트 지급
  giveKtBonus: (userId: number, amount: number = 5000) => apiRequest<Point>(API_BASE_URLS.point, 'points/kt-bonus', {
    method: 'POST',
    body: JSON.stringify({ userId, amount }),
  }),
};

// Subscription API
export const subscriptionAPI = {
  // 활성 구독 조회
  getActiveSubscription: (userId: number) => apiRequest<Subscription>(API_BASE_URLS.subscription, `subscriptions/user/${userId}/active`),
  
  // 프리미엄 구독 신청
  subscribe: (userId: number) => apiRequest<Subscription>(API_BASE_URLS.subscription, 'subscriptions/subscribe', {
    method: 'POST',
    body: JSON.stringify({ userId }),
  }),
  
  // 구독 취소
  cancelSubscription: (subscriptionId: number) => apiRequest<Subscription>(API_BASE_URLS.subscription, `subscriptions/${subscriptionId}/cancel`, {
    method: 'PATCH',
  }),
  
  // 사용자 구독 내역 조회
  getByUser: (userId: number) => apiRequest<Subscription[]>(API_BASE_URLS.subscription, `subscriptions/user/${userId}`),
  
  // 구독 상태 확인
  getSubscriptionStatus: (userId: number) => apiRequest<{
    userId: number;
    isSubscriber: boolean;
    planType?: string;
    endDate?: string;
  }>(API_BASE_URLS.subscription, `subscriptions/user/${userId}/status`),
};

// AI API
export const aiAPI = {
  polishText: (content: string, style?: string) => apiRequest<{
    success: boolean;
    data: string;
    message?: string;
  }>(API_BASE_URLS.ai, 'ai/polish', {
    method: 'POST',
    body: JSON.stringify({ content, style }),
  }),
  
  generateCover: (title: string, genre?: string, description?: string) => apiRequest<{
    success: boolean;
    data: string;
    message?: string;
  }>(API_BASE_URLS.ai, 'ai/generate-cover', {
    method: 'POST',
    body: JSON.stringify({ title, genre, description }),
  }),
  
  suggestPlot: (genre: string, keywords?: string) => apiRequest<{
    success: boolean;
    data: string;
    message?: string;
  }>(API_BASE_URLS.ai, `ai/suggest-plot?genre=${encodeURIComponent(genre)}${keywords ? `&keywords=${encodeURIComponent(keywords)}` : ''}`, {
    method: 'POST',
  }),
  
  healthCheck: () => apiRequest<{
    success: boolean;
    data: string;
  }>(API_BASE_URLS.ai, 'ai/health'),
};