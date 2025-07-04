import { useState, useEffect } from 'react';
import { ModernHeader } from './ModernHeader';
import { ModernBookCarousel } from './ModernBookCarousel';
import { Footer } from '@/components/ui/footer';
import { bookAPI, authorAPI, Book as APIBook, Author } from '@/services/api';

interface Book {
  id: number;
  title: string;
  author: string;
  cover: string;
  genre: string;
  price: number;
  views?: number;
  isNew?: boolean;
  isBestseller?: boolean;
  content?: string;
  authorId?: number;
}

const mockBooks: Book[] = [
  {
    id: 1,
    title: '별 헤는 밤',
    author: '윤동주',
    cover: '✨',
    genre: '시',
    price: 1000,
    views: 1234,
    isNew: true,
  },
  {
    id: 2,
    title: 'The Little Prince',
    author: 'Antoine de Saint-Exupéry',
    cover: '👑',
    genre: '소설',
    price: 1000,
    views: 15,
    isBestseller: true,
  },
  {
    id: 3,
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    cover: '📜',
    genre: '소설',
    price: 1000,
    views: 4321,
  },
  {
    id: 4,
    title: '1984',
    author: 'George Orwell',
    cover: '👁️',
    genre: '소설',
    price: 1000,
    views: 9876,
    isNew: true,
    isBestseller: true,
  },
  {
    id: 5,
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    cover: '🐦',
    genre: '소설',
    price: 1000,
    views: 3456,
  },
  {
    id: 6,
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    cover: '🍸',
    genre: '소설',
    price: 1000,
    views: 6789,
    isBestseller: true,
  },
  {
    id: 7,
    title: 'One Hundred Years of Solitude',
    author: 'Gabriel García Márquez',
    cover: '🦋',
    genre: '소설',
    price: 1000,
    views: 10234,
    isNew: true,
  },
  {
    id: 8,
    title: 'Moby Dick',
    author: 'Herman Melville',
    cover: '🐳',
    genre: '소설',
    price: 1000,
    views: 2345,
  },
];

interface ModernMainLibraryProps {
  user: any;
  points: number; // coins → points 변경
  isSubscribed: boolean;
  onBookSelect: (book: any) => void;
  onPaymentClick: () => void;
  onLogout: () => void;
}

export const ModernMainLibrary = ({ 
  user, 
  points, // coins → points 변경
  isSubscribed, 
  onBookSelect, 
  onPaymentClick, 
  onLogout 
}: ModernMainLibraryProps) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<{ [key: number]: Author }>({});
  const [loading, setLoading] = useState(true);
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [newBooks, setNewBooks] = useState<Book[]>([]);
  const [bestSellerBooks, setBestSellerBooks] = useState<Book[]>([]);

  // 실제 API에서 도서와 작가 데이터 불러오기
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // 일시적으로 manuscripts API 사용 (출간된 원고 조회)
        console.log('manuscripts API에서 출간된 도서 조회 중...');
        const manuscriptsData = await fetch('/manuscripts')
          .then(res => res.json())
          .catch(err => {
            console.warn('manuscripts API 오류:', err);
            return [];
          });
        
        const publishedBooks = manuscriptsData.filter((manuscript: any) => manuscript.status === 'PUBLISHED');
        console.log('출간된 도서 수:', publishedBooks.length);
        
        // 각 도서의 작가 정보 조회
        const authorIds = [...new Set(publishedBooks.map((book: any) => book.authorId).filter(Boolean))] as number[];
        const authorsData: { [key: number]: Author } = {};
        
        for (const authorId of authorIds) {
          try {
            const author = await authorAPI.getById(authorId);
            authorsData[authorId] = author;
          } catch (error) {
            console.warn(`작가 정보 조회 실패 (ID: ${authorId}):`, error);
          }
        }
        
        setAuthors(authorsData);
        
        // API 데이터를 UI 형태로 변환
        const transformedBooks: Book[] = publishedBooks.map((book: any, index: number) => ({
          id: book.manuscriptId || index,
          title: book.title,
          author: authorsData[book.authorId]?.authorName || '알 수 없는 작가',
          cover: book.coverImage || '📖',
          genre: '소설', // 기본값
          price: 1000, // 모든 책 가격 1000포인트로 통일
          views: book.viewCount || 0, // 실제 조회수 (기본값 0)
          isNew: new Date(book.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000, // 7일 이내
          isBestseller: (book.viewCount || 0) >= 10, // 조회수 10 이상이면 베스트셀러
          content: book.content,
          authorId: book.authorId
        }));
        
        console.log('변환된 도서 데이터:', transformedBooks.length);
        console.log('📊 조회수 정보:', transformedBooks.map(b => ({ 
          title: b.title, 
          views: b.views, 
          isBestseller: b.isBestseller 
        })));
        
        setBooks(transformedBooks);
        setFeaturedBooks(transformedBooks.slice(0, 5));
        setNewBooks(transformedBooks.filter(book => book.isNew));
        setBestSellerBooks(transformedBooks.filter(book => book.isBestseller));
        
        // 데이터가 없을 때 mockBooks 사용
        if (transformedBooks.length === 0) {
          console.log('실제 도서 데이터가 없어서 mockBooks 사용');
          setBooks(mockBooks);
          setFeaturedBooks(mockBooks.slice(0, 5));
          setNewBooks(mockBooks.filter(book => book.isNew));
          setBestSellerBooks(mockBooks.filter(book => book.isBestseller));
        }
        
      } catch (error) {
        console.error('도서 데이터 로딩 실패:', error);
        // 오류 시 mockBooks 사용
        console.log('오류로 인해 mockBooks 사용');
        setBooks(mockBooks);
        setFeaturedBooks(mockBooks.slice(0, 5));
        setNewBooks(mockBooks.filter(book => book.isNew));
        setBestSellerBooks(mockBooks.filter(book => book.isBestseller));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">도서관을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
      <ModernHeader
        user={user}
        points={points} // coins → points 변경
        isSubscribed={isSubscribed}
        onPaymentClick={onPaymentClick}
        onLogout={onLogout}
      />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Featured Books Carousel */}
        <ModernBookCarousel
          title="✨ 추천 작품"
          books={featuredBooks}
          onBookSelect={onBookSelect}
        />

        {/* New Releases Carousel */}
        <ModernBookCarousel
          title="🔥 따끈따끈 신작"
          books={newBooks}
          onBookSelect={onBookSelect}
        />

        {/* Bestseller Carousel */}
        <ModernBookCarousel
          title="🏆 요즘 핫한 베스트셀러"
          books={bestSellerBooks}
          onBookSelect={onBookSelect}
        />

        {/* All Books Grid */}
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-gray-800">📚 모든 작품</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {books.map((book) => (
              <div key={book.id}>
                <div onClick={() => onBookSelect(book)}>
                  {book.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};
