
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Book {
  id: number;
  title: string;
  author: string;
  cover: string;
  genre: string;
  price: number;
  isNew?: boolean;
  isBestseller?: boolean;
}

interface BookCarouselProps {
  books: Book[];
  onBookSelect: (book: Book) => void;
}

export const BookCarousel = ({ books, onBookSelect }: BookCarouselProps) => {
  return (
    <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
      {books.map((book) => (
        <Card
          key={book.id}
          className="flex-shrink-0 w-48 cursor-pointer group hover:shadow-lg transition-all duration-300 hover:scale-105 bg-white/80 backdrop-blur-sm border-gray-200/50"
          onClick={() => onBookSelect(book)}
        >
          <CardContent className="p-4 space-y-3">
            <div className="relative">
              <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center text-4xl group-hover:from-gray-200 group-hover:to-gray-300 transition-colors overflow-hidden">
                {book.cover && book.cover.startsWith('http') ? (
                  <img 
                    src={book.cover} 
                    alt={book.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).nextElementSibling!.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`w-full h-full flex items-center justify-center text-4xl ${book.cover && book.cover.startsWith('http') ? 'hidden' : ''}`}>
                  {book.cover && !book.cover.startsWith('http') ? book.cover : '📚'}
                </div>
              </div>
              {book.isNew && (
                <Badge className="absolute -top-2 -right-2 bg-green-500 text-white">NEW</Badge>
              )}
              {book.isBestseller && (
                <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white">BEST</Badge>
              )}
            </div>
            
            <div className="space-y-1">
              <h3 className="font-medium text-gray-800 text-sm line-clamp-2 group-hover:text-amber-700 transition-colors">
                {book.title}
              </h3>
              <p className="text-xs text-gray-600">{book.author}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {book.genre}
                </span>
                <span className="text-xs font-medium text-amber-700">
                  🪙 {book.price}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
