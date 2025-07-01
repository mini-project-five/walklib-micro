import { useState, useEffect } from 'react';
import { UserTypeSelector } from '@/components/auth/UserTypeSelector';
import { ReaderLogin } from '@/components/auth/ReaderLogin';
import { AuthorLogin } from '@/components/auth/AuthorLogin';
import { ModernMainLibrary } from '@/components/library/ModernMainLibrary';
import { BookDetail } from '@/components/books/BookDetail';
import { PaymentCenter } from '@/components/payment/PaymentCenter';
import { AuthorCenter } from '@/components/author/AuthorCenter';
import { AuthorEditor } from '@/components/author/AuthorEditor';
import { AuthorWorks } from '@/components/author/AuthorWorks';
import { ApiTestPanel } from '@/components/debug/ApiTestPanel';
import { ServiceIntegrationTest } from '@/components/test/ServiceIntegrationTest';
import { validateUserRole } from '@/hooks/useUserInfo';

type Screen = 'type-selector' | 'reader-login' | 'author-login' | 'library' | 'book-detail' | 'payment' | 'author' | 'editor' | 'works' | 'api-test' | 'integration-test';

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('type-selector');
  const [user, setUser] = useState<any>(null);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [editingWork, setEditingWork] = useState<any>(null);
  const [coins, setCoins] = useState(100);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Check if user is logged in on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('walkingLibraryUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      
      // 역할 기반 라우팅 및 검증
      const userRole = userData.userType || (userData.role === 'AUTHOR' ? 'author' : 'reader');
      
      if (userRole === 'author') {
        if (validateUserRole(userData, 'author')) {
          setCurrentScreen('author');
        } else {
          console.warn('잘못된 작가 권한, 로그아웃 처리');
          localStorage.removeItem('walkingLibraryUser');
          setUser(null);
          setCurrentScreen('type-selector');
        }
      } else {
        if (validateUserRole(userData, 'reader')) {
          setCurrentScreen('library');
        } else {
          console.warn('잘못된 독자 권한, 로그아웃 처리');
          localStorage.removeItem('walkingLibraryUser');
          setUser(null);
          setCurrentScreen('type-selector');
        }
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

  const handleApiTest = () => {
    setCurrentScreen('api-test');
  };

  const handleIntegrationTest = () => {
    setCurrentScreen('integration-test');
  };

  const handleLogin = (userData: any) => {
    // 추가 역할 검증
    const expectedRole = userData.userType || (userData.role === 'AUTHOR' ? 'author' : 'reader');
    
    if (!validateUserRole(userData, expectedRole)) {
      alert('잘못된 사용자 권한입니다. 다시 로그인해주세요.');
      return;
    }
    
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

  const handleBookSelect = (book: any) => {
    setSelectedBook(book);
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

  return (
    <div className="min-h-screen">
      {currentScreen === 'type-selector' && (
        <UserTypeSelector 
          onSelectType={handleUserTypeSelect} 
          onApiTest={handleApiTest}
          onIntegrationTest={handleIntegrationTest}
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
      
      {currentScreen === 'author' && !validateUserRole(user, 'author') && (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">접근 권한이 없습니다</h2>
            <p className="text-gray-600 mb-6">작가 전용 페이지입니다. 작가 계정으로 로그인해주세요.</p>
            <button 
              onClick={handleLogout}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              로그인 페이지로 돌아가기
            </button>
          </div>
        </div>
      )}
      
      {(currentScreen === 'works' || currentScreen === 'editor') && !validateUserRole(user, 'author') && (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">접근 권한이 없습니다</h2>
            <p className="text-gray-600 mb-6">작가 전용 기능입니다. 작가 계정으로 로그인해주세요.</p>
            <button 
              onClick={handleLogout}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              로그인 페이지로 돌아가기
            </button>
          </div>
        </div>
      )}
      
      {currentScreen === 'author' && validateUserRole(user, 'author') && (
        <AuthorCenter
          user={user}
          onBack={handleLogout}
          onWriteClick={() => {
            setEditingWork(null);
            setCurrentScreen('editor');
          }}
          onViewWorksClick={() => setCurrentScreen('works')}
        />
      )}
      
      {currentScreen === 'works' && validateUserRole(user, 'author') && (
        <AuthorWorks
          user={user}
          onBack={() => setCurrentScreen('author')}
          onCreateWork={() => {
            setEditingWork(null);
            setCurrentScreen('editor');
          }}
          onEditWork={(workId) => {
            setEditingWork(workId);
            setCurrentScreen('editor');
          }}
        />
      )}
      
      {currentScreen === 'editor' && validateUserRole(user, 'author') && (
        <AuthorEditor
          user={user}
          workId={editingWork}
          onBack={() => editingWork ? setCurrentScreen('works') : setCurrentScreen('author')}
        />
      )}
      
      {currentScreen === 'api-test' && (
        <ApiTestPanel />
      )}
      
      {currentScreen === 'integration-test' && (
        <ServiceIntegrationTest onBack={() => setCurrentScreen('type-selector')} />
      )}
    </div>
  );
};

export default Index;
