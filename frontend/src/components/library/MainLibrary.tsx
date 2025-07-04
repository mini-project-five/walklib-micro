
import { useState } from 'react';
import { Search, User, DollarSign, Crown, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BookCarousel } from './BookCarousel';

interface MainLibraryProps {
  user: any;
  points: number; // coins → points로 변경
  isSubscribed: boolean;
  onBookSelect: (book: any) => void;
  onPaymentClick: () => void;
  onAuthorClick: () => void;
  onLogout: () => void;
}

export const MainLibrary = ({ 
  user, 
  points, // coins → points로 변경
  isSubscribed, 
  onBookSelect, 
  onPaymentClick, 
  onAuthorClick,
  onLogout
}: MainLibraryProps) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Sample book data
  const recommendedBooks = [
    { id: 1, title: '바람의 서사시', author: '김서정', cover: '🌊', genre: '판타지', price: 10, isNew: false },
    { id: 2, title: '도시의 밤', author: '이현우', cover: '🌃', genre: '로맨스', price: 10, isNew: true },
    { id: 3, title: '시간의 조각들', author: '박미라', cover: '⏰', genre: 'SF', price: 10, isNew: false },
  ];

  const bestsellerBooks = [
    { id: 4, title: '마음의 정원', author: '정수민', cover: '🌸', genre: '힐링', price: 10, isBestseller: true },
    { id: 5, title: '별빛 카페', author: '송지은', cover: '☕', genre: '일상', price: 10, isBestseller: true },
    { id: 6, title: '숲속의 비밀', author: '최영호', cover: '🌲', genre: '미스터리', price: 10, isBestseller: true },
  ];

  const newBooks = [
    { id: 7, title: '새벽의 약속', author: '한지민', cover: '🌅', genre: '드라마', price: 10, isNew: true },
    { id: 8, title: '무지개 다리', author: '오성훈', cover: '🌈', genre: '동화', price: 10, isNew: true },
    { id: 9, title: '겨울 연가', author: '임수진', cover: '❄️', genre: '로맨스', price: 10, isNew: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-light text-gray-800 tracking-wide">걷다가, 서재</h1>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
                <Search className="h-5 w-5" />
              </Button>
              
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="text-gray-600 hover:text-gray-800 flex items-center space-x-2"
                >
                  <User className="h-5 w-5" />
                  <span className="hidden sm:inline">{user?.name}</span>
                </Button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 animate-fade-in">
                    <button
                      onClick={onAuthorClick}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      작가 센터
                    </button>
                    <button
                      onClick={onLogout}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>로그아웃</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* User Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {isSubscribed ? (
              <div className="flex items-center space-x-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-2 rounded-full">
                <Crown className="h-4 w-4" />
                <span className="text-sm font-medium">프리미엄 구독 중</span>
              </div>
            ) : (
              <button
                onClick={onPaymentClick}
                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-full transition-colors"
              >
                <DollarSign className="h-4 w-4" />
                <span className="text-sm font-medium">💰 {points} 포인트</span>
              </button>
            )}
          </div>
        </div>

        {/* Today's Recommendations */}
        <section className="space-y-6">
          <h2 className="text-2xl font-light text-gray-800">오늘의 추천작</h2>
          <BookCarousel books={recommendedBooks} onBookSelect={onBookSelect} />
        </section>

        {/* Bestsellers */}
        <section className="space-y-6">
          <h2 className="text-2xl font-light text-gray-800">주목받는 베스트셀러</h2>
          <BookCarousel books={bestsellerBooks} onBookSelect={onBookSelect} />
        </section>

        {/* New Releases */}
        <section className="space-y-6">
          <h2 className="text-2xl font-light text-gray-800">새로 나온 작품</h2>
          <BookCarousel books={newBooks} onBookSelect={onBookSelect} />
        </section>
      </div>
    </div>
  );
};
