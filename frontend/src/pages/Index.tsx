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

  const handleApiTest = () => {
    setCurrentScreen('api-test');
  };

  const handleIntegrationTest = () => {
    setCurrentScreen('integration-test');
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
      
      {currentScreen === 'author' && (
        <AuthorCenter
          user={user}
          onBack={() => setCurrentScreen('library')}
          onWriteClick={() => {
            setEditingWork(null);
            setCurrentScreen('editor');
          }}
          onViewWorksClick={() => setCurrentScreen('works')}
        />
      )}
      
      {currentScreen === 'works' && (
        <AuthorWorks
          user={user}
          onBack={() => setCurrentScreen('author')}
          onNewWork={() => {
            setEditingWork(null);
            setCurrentScreen('editor');
          }}
          onEditWork={(work) => {
            setEditingWork(work);
            setCurrentScreen('editor');
          }}
        />
      )}
      
      {currentScreen === 'editor' && (
        <AuthorEditor
          user={user}
          editingWork={editingWork}
          onBack={() => editingWork ? setCurrentScreen('works') : setCurrentScreen('author')}
          onSaved={() => setCurrentScreen('works')}
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
