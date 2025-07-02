
import { ModernBookCard } from './ModernBookCard';

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
}

interface ModernBookCarouselProps {
  title: string;
  books: Book[];
  onBookSelect: (book: Book) => void;
}

export const ModernBookCarousel = ({ title, books, onBookSelect }: ModernBookCarouselProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
      <div className="relative">
        <div className="flex space-x-6 overflow-x-auto pb-6 scrollbar-hide">
          {books.map((book) => (
            <div key={book.id} className="flex-shrink-0 w-48">
              <ModernBookCard book={book} onBookSelect={onBookSelect} />
            </div>
          ))}
        </div>
        
        {/* Gradient fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
      </div>
    </div>
  );
};
