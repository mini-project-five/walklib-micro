import React, { useState, useEffect } from 'react';
import { bookAPI, Book } from '../../services/api';
import { useNavigate } from 'react-router-dom';

interface BookListProps {
  authorId?: number; // 작가별 필터링용
  showOnlyPublished?: boolean; // 출간된 책만 보기
  title?: string; // 페이지 제목
  onBookSelect?: (book: Book) => void; // 책 선택 콜백
}

const BookList: React.FC<BookListProps> = ({ 
  authorId, 
  showOnlyPublished = true, 
  title = "출간된 도서 목록",
  onBookSelect
}) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBooks();
  }, [authorId, showOnlyPublished]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let fetchedBooks: Book[];
      
      if (authorId && showOnlyPublished) {
        // 특정 작가의 출간된 책만
        fetchedBooks = await bookAPI.getPublishedByAuthor(authorId);
      } else if (authorId) {
        // 특정 작가의 모든 책
        fetchedBooks = await bookAPI.getByAuthor(authorId);
      } else if (showOnlyPublished) {
        // 모든 출간된 책
        fetchedBooks = await bookAPI.getPublished();
      } else {
        // 모든 책
        fetchedBooks = await bookAPI.getAll();
      }
      
      setBooks(fetchedBooks);
    } catch (err) {
      console.error('책 목록 조회 실패:', err);
      setError('책 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookClick = (book: Book) => {
    if (onBookSelect) {
      onBookSelect(book);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center min-h-[200px] justify-center">
        <div className="text-red-500 mb-4">{error}</div>
        <button 
          onClick={fetchBooks}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{title}</h1>
      
      {books.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">
            {showOnlyPublished ? '출간된 도서가 없습니다.' : '도서가 없습니다.'}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {books.map((book) => (
            <div
              key={book.bookId}
              onClick={() => handleBookClick(book)}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
            >
              {/* 표지 이미지 */}
              <div className="aspect-[3/4] bg-gray-100 rounded-t-lg overflow-hidden">
                {book.coverImage ? (
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg 
                      className="w-16 h-16" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
                      />
                    </svg>
                  </div>
                )}
              </div>
              
              {/* 책 정보 */}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2 text-gray-800 line-clamp-2">
                  {book.title}
                </h3>
                
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>작가 ID: {book.authorId}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    book.status === 'PUBLISHED' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {book.status === 'PUBLISHED' ? '출간' : '미출간'}
                  </span>
                </div>
                
                {book.viewCount !== undefined && (
                  <div className="text-sm text-gray-500">
                    조회수: {book.viewCount.toLocaleString()}회
                  </div>
                )}
                
                {book.isBestseller && (
                  <div className="mt-2">
                    <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded font-medium">
                      베스트셀러
                    </span>
                  </div>
                )}
                
                {book.publishedAt && (
                  <div className="text-xs text-gray-400 mt-2">
                    출간일: {new Date(book.publishedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookList;
