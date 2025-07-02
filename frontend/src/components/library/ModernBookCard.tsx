
import { Badge } from '@/components/ui/badge';
import { Star, Eye, Heart } from 'lucide-react';

interface Book {
  id: number;
  title: string;
  author: string;
  cover: string;
  genre: string;
  price: number;
  views?: number;
  likes?: number;
  isNew?: boolean;
  isBestseller?: boolean;
}

interface ModernBookCardProps {
  book: Book;
  onBookSelect: (book: Book) => void;
}

export const ModernBookCard = ({ book, onBookSelect }: ModernBookCardProps) => {
  return (
    <div className="pb-4">
      <div
        className="group cursor-pointer transition-all duration-500 hover:scale-105"
        onClick={() => onBookSelect(book)}
      >
        <div className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-gray-200 transition-all duration-500">
          {/* Book Cover */}
          <div className="relative aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-gray-200 group-hover:to-gray-300 transition-all duration-500">
            {/* 실제 이미지 URL인지 확인 후 이미지 또는 이모지 표시 */}
            {book.cover && (book.cover.startsWith('http') || book.cover.startsWith('data:')) ? (
              <img 
                src={book.cover} 
                alt={book.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => {
                  // 이미지 로드 실패 시 기본 이모지로 대체
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            
            {/* 이모지 fallback */}
            <div className={`absolute inset-0 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-500 ${
              book.cover && (book.cover.startsWith('http') || book.cover.startsWith('data:')) ? 'hidden' : ''
            }`}>
              {book.cover || '📖'}
            </div>
            
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Badges */}
            <div className="absolute top-3 right-3 space-y-1">
              {book.isNew && (
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
                  NEW
                </Badge>
              )}
              {book.isBestseller && (
                <Badge className="bg-gradient-to-r from-orange-500 to-red-600 text-white border-0">
                  BEST
                </Badge>
              )}
            </div>

            {/* Hover Stats */}
            <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
              <div className="flex items-center justify-between text-white text-xs">
                <div className="flex items-center space-x-1">
                  <Eye className="h-3 w-3" />
                  <span>{book.views?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Heart className="h-3 w-3" />
                  <span>{book.likes?.toLocaleString() || '0'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Book Info */}
          <div className="p-4 space-y-3">
            <div className="space-y-1">
              <h3 className="font-bold text-gray-800 text-sm line-clamp-2 group-hover:text-indigo-600 transition-colors duration-300">
                {book.title}
              </h3>
              <p className="text-xs text-gray-500 font-medium">{book.author}</p>
            </div>

            {/* Genre and Price */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full font-medium">
                {book.genre}
              </span>
              <div className="flex items-center space-x-1">
                <span className="text-xs font-bold text-indigo-600">🪙 {book.price}</span>
              </div>
            </div>
          </div>

          {/* Hover Effect Border */}
          <div className="absolute inset-0 border-2 border-indigo-400 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      </div>
    </div>
  );
};
