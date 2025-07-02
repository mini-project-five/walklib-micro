import { useState, useEffect } from 'react';
import { UserTypeSelector } from '@/components/auth/UserTypeSelector';
import { ReaderLogin } from '@/components/auth/ReaderLogin';
import { AuthorLogin } from '@/components/auth/AuthorLogin';
import { ModernMainLibrary } from '@/components/library/ModernMainLibrary';
import { BookDetail } from '@/components/books/BookDetail';
import { PaymentCenter } from '@/components/payment/PaymentCenter';
import { AuthorCenter } from '@/components/author/AuthorCenter';
import { AuthorEditor } from '@/components/author/AuthorEditor';
import { bookAPI, manuscriptAPI } from '@/services/api';

type Screen = 'type-selector' | 'reader-login' | 'author-login' | 'library' | 'book-detail' | 'payment' | 'author' | 'editor';

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('type-selector');
  const [user, setUser] = useState<any>(null);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [coins, setCoins] = useState(100);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // 작가 센터 갱신용

  // Check if user is logged in on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('walkingLibraryUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      // 작가면 작가 센터로, 독자면 라이브러리로
      if (userData.userType === 'author') {
        setCurrentScreen('author');
      } else {
        setCurrentScreen('library');
      }
      setCoins(userData.coins || 100);
      setIsSubscribed(userData.isSubscribed || false);
    }
  }, []);

  const handleUserTypeSelect = (type: 'reader' | 'author') => {
    if (type === 'reader') {
      setCurrentScreen('reader-login');
    } else {
      setCurrentScreen('author-login');
    }
  };

  const handleLogin = (userData: any) => {
    setUser(userData);
    // 작가면 작가 센터로, 독자면 라이브러리로
    if (userData.userType === 'author') {
      setCurrentScreen('author');
    } else {
      setCurrentScreen('library');
    }
    localStorage.setItem('walkingLibraryUser', JSON.stringify({
      ...userData,
      coins: userData.userType === 'reader' ? coins : undefined,
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

  const handlePaymentSuccess = (type: 'coin' | 'subscription', amount?: number) => {
    if (type === 'coin' && amount) {
      const newCoins = coins + amount;
      setCoins(newCoins);
      const updatedUser = { ...user, coins: newCoins };
      setUser(updatedUser);
      localStorage.setItem('walkingLibraryUser', JSON.stringify(updatedUser));
    } else if (type === 'subscription') {
      setIsSubscribed(true);
      const updatedUser = { ...user, isSubscribed: true };
      setUser(updatedUser);
      localStorage.setItem('walkingLibraryUser', JSON.stringify(updatedUser));
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
        <UserTypeSelector onSelectType={handleUserTypeSelect} />
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
          coins={coins}
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
          coins={coins}
          isSubscribed={isSubscribed}
          onBack={() => setCurrentScreen('library')}
          onPaymentNeeded={() => setCurrentScreen('payment')}
          onCoinsUpdate={(newCoins) => {
            setCoins(newCoins);
            updateUserData({ coins: newCoins });
          }}
        />
      )}
      
      {currentScreen === 'payment' && (
        <PaymentCenter
          user={user}
          coins={coins}
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
    </div>
  );
};

export default Index;
