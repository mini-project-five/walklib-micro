import { useState } from 'react';
import { ModernHeader } from './ModernHeader';
import { ModernBookCarousel } from './ModernBookCarousel';
import { Footer } from '@/components/ui/footer';

interface Book {
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

const mockBooks: Book[] = [
  {
    id: 1,
    title: '별 헤는 밤',
    author: '윤동주',
    cover: 'Cover1',
    genre: '시',
    price: 5,
    rating: 4.5,
    views: 1234,
    likes: 567,
    isNew: true,
  },
  {
    id: 2,
    title: 'The Little Prince',
    author: 'Antoine de Saint-Exupéry',
    cover: 'Cover2',
    genre: '소설',
    price: 10,
    rating: 4.8,
    views: 5678,
    likes: 1234,
    isBestseller: true,
  },
  {
    id: 3,
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    cover: 'Cover3',
    genre: '소설',
    price: 8,
    rating: 4.7,
    views: 4321,
    likes: 987,
  },
  {
    id: 4,
    title: '1984',
    author: 'George Orwell',
    cover: 'Cover4',
    genre: '소설',
    price: 12,
    rating: 4.9,
    views: 9876,
    likes: 2345,
    isNew: true,
    isBestseller: true,
  },
  {
    id: 5,
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    cover: 'Cover5',
    genre: '소설',
    price: 9,
    rating: 4.6,
    views: 3456,
    likes: 678,
  },
  {
    id: 6,
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    cover: 'Cover6',
    genre: '소설',
    price: 11,
    rating: 4.8,
    views: 6789,
    likes: 3456,
    isBestseller: true,
  },
  {
    id: 7,
    title: 'One Hundred Years of Solitude',
    author: 'Gabriel García Márquez',
    cover: '🦋',
    genre: '소설',
    price: 13,
    rating: 4.9,
    views: 10234,
    likes: 4567,
    isNew: true,
  },
  {
    id: 8,
    title: 'Moby Dick',
    author: 'Herman Melville',
    cover: 'Cover7',
    genre: '소설',
    price: 7,
    rating: 4.5,
    views: 2345,
    likes: 789,
  },
];

interface ModernMainLibraryProps {
  user: any;
  coins: number;
  isSubscribed: boolean;
  onBookSelect: (book: any) => void;
  onPaymentClick: () => void;
  onLogout: () => void;
}

export const ModernMainLibrary = ({ 
  user, 
  coins, 
  isSubscribed, 
  onBookSelect, 
  onPaymentClick, 
  onLogout 
}: ModernMainLibraryProps) => {
  const [featuredBooks] = useState(mockBooks.slice(0, 5));
  const [newBooks] = useState(mockBooks.filter(book => book.isNew));
  const [bestSellerBooks] = useState(mockBooks.filter(book => book.isBestseller));
  const [allBooks] = useState(mockBooks);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
      <ModernHeader
        user={user}
        coins={coins}
        isSubscribed={isSubscribed}
        onPaymentClick={onPaymentClick}
        onLogout={onLogout}
      />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Featured Books Carousel */}
        <ModernBookCarousel
          title="추천 작품"
          books={featuredBooks}
          onBookSelect={onBookSelect}
        />

        {/* New Releases Carousel */}
        <ModernBookCarousel
          title="따끈따끈 신작"
          books={newBooks}
          onBookSelect={onBookSelect}
        />

        {/* Bestseller Carousel */}
        <ModernBookCarousel
          title="요즘 핫한 베스트셀러"
          books={bestSellerBooks}
          onBookSelect={onBookSelect}
        />

        {/* All Books Grid */}
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-gray-800">모든 작품</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {allBooks.map((book) => (
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
