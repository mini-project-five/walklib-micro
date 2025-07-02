import { useState, useEffect } from 'react';
import { ModernHeader } from './ModernHeader';
import { ModernBookCarousel } from './ModernBookCarousel';
import { Footer } from '@/components/ui/footer';
import { bookAPI, Book } from '@/services/api';

interface LibraryBook {
  id: number;
  title: string;
  author: string;
  cover: string;
  genre: string;
  price: number;
  rating?: number;
  views?: number;
  likes?: number;
  isNew?: boolean;
  isBestseller?: boolean;
}

// Transform backend Book to LibraryBook
const transformBook = (book: Book): LibraryBook => ({
  id: book.bookId || 0,
  title: book.title,
  author: `작가 ${book.authorId}`, // This should be populated with actual author name
  cover: book.coverImageUrl || '📚',
  genre: book.category || '일반',
  price: book.price || 0,
  rating: 4.5, // Default rating
  views: book.viewCount || 0,
  likes: Math.floor((book.viewCount || 0) * 0.3), // Approximate likes
  isNew: false, // This could be calculated based on publishedDate
  isBestseller: book.isBestseller || false,
});

interface ModernMainLibraryProps {
  user: any;
  coins: number;
  isSubscribed: boolean;
  onBookSelect: (book: any) => void;
  onPaymentClick: () => void;
  onLogout: () => void;
  onAuthorHomeClick?: () => void;
}

export const ModernMainLibrary = ({ 
  user, 
  coins, 
  isSubscribed, 
  onBookSelect, 
  onPaymentClick, 
  onLogout,
  onAuthorHomeClick 
}: ModernMainLibraryProps) => {
  const [featuredBooks, setFeaturedBooks] = useState<LibraryBook[]>([]);
  const [newBooks, setNewBooks] = useState<LibraryBook[]>([]);
  const [bestSellerBooks, setBestSellerBooks] = useState<LibraryBook[]>([]);
  const [allBooks, setAllBooks] = useState<LibraryBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBooks = async () => {
      try {
        setIsLoading(true);

        // Load all books
        const [allBooksData, bestsellerData, newBooksData] = await Promise.all([
          bookAPI.getAll(),
          bookAPI.getBestsellers(),
          bookAPI.getNewBooks()
        ]);

        // Transform data
        const transformedAllBooks = allBooksData.map(transformBook);
        const transformedBestsellers = bestsellerData.map(transformBook);
        const transformedNewBooks = newBooksData.map(transformBook);

        setAllBooks(transformedAllBooks);
        setBestSellerBooks(transformedBestsellers);
        setNewBooks(transformedNewBooks);
        setFeaturedBooks(transformedAllBooks.slice(0, 5)); // Take first 5 as featured

      } catch (error) {
        console.error('Error loading books:', error);
        
        // Fallback to empty arrays if API fails
        setAllBooks([]);
        setBestSellerBooks([]);
        setNewBooks([]);
        setFeaturedBooks([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadBooks();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
      <ModernHeader
        user={user}
        coins={coins}
        isSubscribed={isSubscribed}
        onPaymentClick={onPaymentClick}
        onLogout={onLogout}
        onAuthorHomeClick={onAuthorHomeClick}
      />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-8">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700 mx-auto mb-4"></div>
              <p className="text-gray-600">도서를 불러오는 중...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Featured Books Carousel */}
            {featuredBooks.length > 0 && (
              <ModernBookCarousel
                title="✨ 추천 작품"
                books={featuredBooks}
                onBookSelect={onBookSelect}
              />
            )}

            {/* New Releases Carousel */}
            {newBooks.length > 0 && (
              <ModernBookCarousel
                title="🔥 따끈따끈 신작"
                books={newBooks}
                onBookSelect={onBookSelect}
              />
            )}

            {/* Bestseller Carousel */}
            {bestSellerBooks.length > 0 && (
              <ModernBookCarousel
                title="🏆 요즘 핫한 베스트셀러"
                books={bestSellerBooks}
                onBookSelect={onBookSelect}
              />
            )}

            {/* All Books Grid */}
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-gray-800">📚 모든 작품</h2>
              {allBooks.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {allBooks.map((book) => (
                    <div 
                      key={book.id}
                      className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => onBookSelect(book)}
                    >
                      <div className="text-center">
                        <div className="text-4xl mb-2">{book.cover}</div>
                        <h3 className="font-medium text-sm line-clamp-2">{book.title}</h3>
                        <p className="text-xs text-gray-600 mt-1">{book.author}</p>
                        <p className="text-xs text-amber-600 mt-1">조회수: {book.views}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">등록된 도서가 없습니다.</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
};
