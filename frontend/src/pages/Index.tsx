import { useState, useEffect } from 'react';
import { UserTypeSelector } from '@/components/auth/UserTypeSelector';
import { ReaderLogin } from '@/components/auth/ReaderLogin';
import { AuthorLogin } from '@/components/auth/AuthorLogin';
import { ModernMainLibrary } from '@/components/library/ModernMainLibrary';
import { BookDetail } from '@/components/books/BookDetail';
import { PaymentCenter } from '@/components/payment/PaymentCenter';
import { AuthorCenter } from '@/components/author/AuthorCenter';
import { AuthorEditor } from '@/components/author/AuthorEditor';
import { AdminKtAuth } from '@/components/admin/AdminKtAuth';
import { bookAPI, manuscriptAPI, pointAPI, subscriptionAPI } from '@/services/api';

type Screen = 'type-selector' | 'reader-login' | 'author-login' | 'library' | 'book-detail' | 'payment' | 'author' | 'editor' | 'admin-kt';

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('type-selector');
  const [user, setUser] = useState<any>(null);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [points, setPoints] = useState(0); // 코인 → 포인트로 변경
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // 작가 센터 갱신용

  // Check if user is logged in on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('walkingLibraryUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      
      // 독자의 경우 포인트와 구독 상태 로드
      if (userData.userType === 'reader' && userData.userId) {
        loadUserPointsAndSubscription(userData.userId);
      }
      
      // 작가면 작가 센터로, 독자면 라이브러리로
      if (userData.userType === 'author') {
        setCurrentScreen('author');
      } else {
        setCurrentScreen('library');
      }
    }
  }, []);

  // 사용자 포인트와 구독 상태 로드
  const loadUserPointsAndSubscription = async (userId: number) => {
    try {
      // 포인트 잔액 조회
      const pointBalance = await pointAPI.getBalance(userId);
      setPoints(pointBalance);
      
      // 구독 상태 조회
      const subscriptionStatus = await subscriptionAPI.getSubscriptionStatus(userId);
      setIsSubscribed(subscriptionStatus.isSubscriber);
      
      console.log('사용자 포인트 및 구독 상태 로드:', { points: pointBalance, isSubscribed: subscriptionStatus.isSubscriber });
    } catch (error) {
      console.warn('포인트/구독 정보 로드 실패:', error);
      // 실패해도 앱은 계속 동작하도록
    }
  };

  const handleUserTypeSelect = (type: 'reader' | 'author') => {
    if (type === 'reader') {
      setCurrentScreen('reader-login');
    } else {
      setCurrentScreen('author-login');
    }
  };

  const handleLogin = (userData: any) => {
    setUser(userData);
    
    // 독자의 경우 포인트와 구독 상태 로드
    if (userData.userType === 'reader' && userData.userId) {
      loadUserPointsAndSubscription(userData.userId);
    }
    
    // 작가면 작가 센터로, 독자면 라이브러리로
    if (userData.userType === 'author') {
      setCurrentScreen('author');
    } else {
      setCurrentScreen('library');
    }
    localStorage.setItem('walkingLibraryUser', JSON.stringify({
      ...userData,
      // localStorage에는 더 이상 coins 저장하지 않음 (API에서 실시간 조회)
      isSubscribed: userData.userType === 'reader' ? isSubscribed : undefined
    }));
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentScreen('type-selector');
    localStorage.removeItem('walkingLibraryUser');
  };

  const handleBookSelect = async (book: any) => {
    try {
      // 조회수 증가 API 호출 (manuscripts 서비스 사용)
      await manuscriptAPI.incrementView(book.id);
      console.log(`도서 "${book.title}" 선택됨 - 조회수 증가 완료`);
    } catch (error) {
      console.warn('조회수 증가 실패:', error);
    }
    
    // ModernMainLibrary의 Book 형태를 API Book 형태로 변환
    const apiBook = {
      bookId: book.id,
      title: book.title,
      content: book.content || '내용을 불러오는 중...',
      authorId: book.authorId,
      status: 'PUBLISHED',
      coverImage: book.cover,
      viewCount: book.views || 0,
      isBestseller: book.isBestseller || false,
      createdAt: new Date().toISOString(),
      publishedAt: new Date().toISOString()
    };
    
    setSelectedBook(apiBook);
    setCurrentScreen('book-detail');
  };

  const handlePaymentSuccess = async (type: 'point' | 'subscription', amount?: number) => {
    if (type === 'point' && amount && user?.userId) {
      try {
        // 포인트 충전 API 호출
        await pointAPI.chargePoints(user.userId, amount);
        // 포인트 잔액 새로고침
        await loadUserPointsAndSubscription(user.userId);
      } catch (error) {
        console.error('포인트 충전 실패:', error);
      }
    } else if (type === 'subscription' && user?.userId) {
      try {
        // 구독 신청 API 호출
        await subscriptionAPI.subscribe(user.userId);
        // 구독 상태 새로고침
        await loadUserPointsAndSubscription(user.userId);
      } catch (error) {
        console.error('구독 신청 실패:', error);
      }
    }
    setCurrentScreen('library');
  };

  const updateUserData = (newData: any) => {
    const updatedUser = { ...user, ...newData };
    setUser(updatedUser);
    localStorage.setItem('walkingLibraryUser', JSON.stringify(updatedUser));
  };

  // 원고 저장/출간 후 호출될 함수
  const handleManuscriptSaved = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen">
      {currentScreen === 'type-selector' && (
        <UserTypeSelector 
          onSelectType={handleUserTypeSelect}
          onAdminClick={() => setCurrentScreen('admin-kt')}
        />
      )}
      
      {currentScreen === 'reader-login' && (
        <ReaderLogin 
          onLogin={handleLogin} 
          onBack={() => setCurrentScreen('type-selector')}
        />
      )}
      
      {currentScreen === 'author-login' && (
        <AuthorLogin 
          onLogin={handleLogin} 
          onBack={() => setCurrentScreen('type-selector')}
        />
      )}
      
      {currentScreen === 'library' && (
        <ModernMainLibrary
          user={user}
          points={points} // coins → points 변경
          isSubscribed={isSubscribed}
          onBookSelect={handleBookSelect}
          onPaymentClick={() => setCurrentScreen('payment')}
          onLogout={handleLogout}
        />
      )}
      
      {currentScreen === 'book-detail' && selectedBook && (
        <BookDetail
          book={selectedBook}
          user={user}
          points={points} // coins → points 변경
          isSubscribed={isSubscribed}
          onBack={() => setCurrentScreen('library')}
          onPaymentNeeded={() => setCurrentScreen('payment')}
          onPointsUpdate={async (usedPoints) => {
            // 포인트 사용 API 호출
            if (user?.userId) {
              try {
                await pointAPI.usePoints(user.userId, usedPoints, `도서 "${selectedBook.title}" 구매`);
                // 포인트 잔액 새로고침
                await loadUserPointsAndSubscription(user.userId);
              } catch (error) {
                console.error('포인트 사용 실패:', error);
              }
            }
          }}
        />
      )}
      
      {currentScreen === 'payment' && (
        <PaymentCenter
          user={user}
          points={points} // coins → points 변경
          isSubscribed={isSubscribed}
          onBack={() => setCurrentScreen('library')}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
      
      {currentScreen === 'author' && (
        <AuthorCenter
          user={user}
          onBack={() => setCurrentScreen('library')}
          onWriteClick={() => setCurrentScreen('editor')}
          refreshTrigger={refreshTrigger}
        />
      )}
      
      {currentScreen === 'editor' && (
        <AuthorEditor
          user={user}
          onBack={() => setCurrentScreen('author')}
          onManuscriptSaved={handleManuscriptSaved}
        />
      )}
      
      {currentScreen === 'admin-kt' && (
        <AdminKtAuth
          onBack={() => setCurrentScreen('type-selector')}
        />
      )}
    </div>
  );
};

export default Index;
