
import { useState } from 'react';
import { ArrowLeft, User, Star, ChevronRight, ChevronLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useUserInfo, getUserDisplayName, getUserRoleText } from '@/hooks/useUserInfo';

interface BookDetailProps {
  book: any;
  user: any;
  coins: number;
  isSubscribed: boolean;
  onBack: () => void;
  onPaymentNeeded: () => void;
  onCoinsUpdate: (newCoins: number) => void;
}

export const BookDetail = ({ 
  book, 
  user, 
  coins, 
  isSubscribed, 
  onBack, 
  onPaymentNeeded,
  onCoinsUpdate 
}: BookDetailProps) => {
  const { userInfo } = useUserInfo();
  const currentUser = userInfo || user;
  const { toast } = useToast();
  const [isReading, setIsReading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showRating, setShowRating] = useState(false);
  const [userRating, setUserRating] = useState(0);
  
  const totalPages = 20;
  const progress = Math.round((currentPage / totalPages) * 100);

  const bookContent = [
    "이곳은 " + book.title + "의 첫 번째 페이지입니다. AI가 생성한 감각적이고 몰입도 높은 스토리가 독자들에게 깊은 인상을 남기며, 텍스트 가독성을 최우선으로 한 미니멀한 디자인으로 독서에만 집중할 수 있도록 구성되어 있습니다.",
    
    "각 문단은 적절한 여백과 함께 배치되어 있으며, 사용자의 눈의 피로를 최소화하고 몰입감을 극대화하는 타이포그래피를 사용합니다. 페이지를 넘기며 자연스럽게 이야기에 빠져들 수 있습니다.",
    
    "이 작품은 " + book.author + " 작가의 독특한 문체와 상상력이 돋보이는 작품으로, 독자들에게 새로운 세계로의 여행을 선사합니다. 매 페이지마다 새로운 발견이 있습니다.",
    
    "스토리는 점점 더 흥미진진해집니다. 주인공의 여정을 따라가며 독자들은 예상치 못한 반전과 감동을 경험하게 됩니다. 이제 중반부에 접어들면서 긴장감이 고조됩니다.",
    
    "클라이맥스가 다가오고 있습니다. 지금까지의 모든 복선들이 하나로 모이며 놀라운 진실이 밝혀집니다. 독자들은 숨을 고르며 다음 페이지를 기다리게 됩니다."
  ];

  const handleReadBook = () => {
    const userCoins = userInfo?.coins || coins;
    const userSubscribed = userInfo?.isSubscribed || isSubscribed;
    
    if (userSubscribed) {
      setIsReading(true);
    } else if (userCoins >= 10) {
      onCoinsUpdate(userCoins - 10);
      setIsReading(true);
    } else {
      onPaymentNeeded();
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    } else {
      // 책을 다 읽었을 때 별점 평가 모달 표시
      setShowRating(true);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleRatingSubmit = () => {
    if (userRating === 0) {
      toast({
        title: "별점을 선택해주세요",
        description: "1점부터 5점까지 평가해주세요.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "평가해주셔서 감사합니다!",
      description: `${book.title}에 ${userRating}점을 주셨습니다.`,
    });
    
    setShowRating(false);
    setIsReading(false);
  };

  const getCurrentPageContent = () => {
    const contentIndex = Math.floor((currentPage - 1) / 4);
    return bookContent[contentIndex] || "계속되는 흥미진진한 이야기...";
  };

  if (showRating) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md bg-white">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-semibold mb-4">책을 어떠셨나요?</h3>
            <p className="text-gray-600 mb-6">"{book.title}"에 대한 평가를 남겨주세요</p>
            
            <div className="flex justify-center space-x-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setUserRating(star)}
                  className="transition-colors"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= userRating 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowRating(false)}
                className="flex-1"
              >
                나중에
              </Button>
              <Button
                onClick={handleRatingSubmit}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
              >
                평가하기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isReading) {
    return (
      <div className="min-h-screen bg-white">
        {/* Reading Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                onClick={() => setIsReading(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                <X className="h-5 w-5 mr-2" />
                나가기
              </Button>
              
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-1">
                  {currentPage} / {totalPages} 페이지
                </div>
                <div className="w-32 bg-gray-200 rounded-full h-1">
                  <div 
                    className="bg-amber-600 h-1 rounded-full transition-all duration-300" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="text-sm text-gray-500">
                {progress}%
              </div>
            </div>
          </div>
        </header>

        {/* Reading Content */}
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="prose prose-lg max-w-none">
            <h1 className="text-2xl font-light text-gray-800 mb-8 text-center">
              {book.title}
            </h1>
            
            <div className="min-h-96 flex items-center">
              <div className="space-y-6 text-gray-700 leading-relaxed text-lg">
                <p>{getCurrentPageContent()}</p>
                
                {currentPage % 4 === 0 && (
                  <div className="text-center text-gray-400 my-8">
                    ◆ ◇ ◆
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reading Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200 p-4">
          <div className="max-w-3xl mx-auto flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>이전</span>
            </Button>
            
            <div className="text-sm text-gray-500">
              페이지 {currentPage} / {totalPages}
            </div>
            
            <Button
              onClick={handleNextPage}
              className="flex items-center space-x-2 bg-amber-600 hover:bg-amber-700 text-white"
            >
              <span>{currentPage === totalPages ? '완료' : '다음'}</span>
              {currentPage < totalPages && <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              서재로 돌아가기
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Book Cover Section */}
        <div className="relative h-80 bg-gradient-to-br from-amber-100 to-orange-200 rounded-2xl mb-8 flex items-center justify-center overflow-hidden">
          <div className="text-8xl">{book.cover}</div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          {book.isNew && (
            <Badge className="absolute top-4 right-4 bg-green-500 text-white">NEW</Badge>
          )}
          {book.isBestseller && (
            <Badge className="absolute top-4 right-4 bg-orange-500 text-white">BEST</Badge>
          )}
        </div>

        {/* Book Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-light text-gray-800 mb-2">{book.title}</h1>
            <button className="flex items-center space-x-2 text-amber-700 hover:text-amber-800 transition-colors">
              <User className="h-4 w-4" />
              <span className="text-lg">{book.author}</span>
            </button>
          </div>

          {/* Rating & Genre */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
              ))}
              <span className="text-sm text-gray-600 ml-2">4.2 (128 리뷰)</span>
            </div>
            <Badge variant="secondary">{book.genre}</Badge>
          </div>

          {/* AI Summary */}
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
            <CardContent className="p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-3">AI 요약 줄거리</h3>
              <p className="text-gray-700 leading-relaxed">
                이 작품은 {book.genre} 장르의 매력적인 스토리로, {book.author} 작가의 독특한 
                세계관과 섬세한 감정 묘사가 돋보입니다. 주인공의 여정을 통해 독자들은 깊은 감동과 
                새로운 통찰을 얻게 되며, 마지막 페이지까지 손에서 놓을 수 없는 몰입감을 선사합니다.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Floating CTA Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200/50 p-4">
        <div className="max-w-4xl mx-auto">
          <Button 
            onClick={handleReadBook}
            className="w-full bg-amber-700 hover:bg-amber-800 text-white py-4 text-lg font-medium rounded-xl transition-all duration-300 hover:scale-[1.02]"
          >
            {(userInfo?.isSubscribed || isSubscribed) ? '무제한 열람하기' : `${book.price} 코인으로 열람하기`}
          </Button>
          {!(userInfo?.isSubscribed || isSubscribed) && (userInfo?.coins || coins) < 10 && (
            <p className="text-center text-sm text-amber-700 mt-2">
              코인이 부족합니다. 충전이 필요해요!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
