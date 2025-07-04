import { useState, useEffect } from 'react';
import { UserTypeSelector } from '@/components/auth/UserTypeSelector';
import { ReaderLogin } from '@/components/auth/ReaderLogin';
import { AuthorLogin } from '@/components/auth/AuthorLogin';
import { ModernMainLibrary } from '@/components/library/ModernMainLibrary';
import { BookDetail } from '@/components/books/BookDetail';
import { PaymentCenter } from '@/components/payment/PaymentCenter';
import { AuthorCenter } from '@/components/author/AuthorCenter';
import { AuthorEditor } from '@/components/author/AuthorEditor';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { subscriptionAPI, pointAPI } from '@/services/api';

type Screen = 'type-selector' | 'reader-login' | 'author-login' | 'library' | 'book-detail' | 'payment' | 'author' | 'editor' | 'admin-login' | 'admin-dashboard';

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('type-selector');
  const [user, setUser] = useState<any>(null);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [coins, setCoins] = useState(100);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [editingManuscript, setEditingManuscript] = useState<any>(null);
  const [adminData, setAdminData] = useState<any>(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('walkingLibraryUser');
    const savedAdmin = localStorage.getItem('adminData');
    
    if (savedAdmin) {
      // 관리자 로그인 상태
      const adminInfo = JSON.parse(savedAdmin);
      setAdminData(adminInfo);
      setCurrentScreen('admin-dashboard');
    } else if (savedUser) {
      // 일반 사용자 로그인 상태
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

  const handleLogin = async (userData: any) => {
    setUser(userData);
    
    // 독자인 경우 구독 상태와 포인트 정보를 API에서 가져옴
    const userId = userData.userId || userData.id;
    if (userData.userType === 'reader' && userId) {
      try {
        // 구독 상태 확인
        const subscriptionResponse = await fetch(`http://20.249.140.195:8080/subscriptions/user/${userId}/active`);
        if (subscriptionResponse.ok) {
          const subscriptionData = await subscriptionResponse.json();
          setIsSubscribed(subscriptionData.success && subscriptionData.subscription);
        }
        
        // 포인트 잔액 확인
        const pointResponse = await fetch(`http://20.249.140.195:8080/points/user/${userId}/balance`);
        if (pointResponse.ok) {
          const pointData = await pointResponse.json();
          setCoins(pointData.success ? pointData.pointBalance : 0);
        }
      } catch (error) {
        console.error('Failed to fetch user subscription/point data:', error);
        // 기본값 사용
        setIsSubscribed(false);
        setCoins(100);
      }
    }
    
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

  const handleAdminLogin = (adminInfo: any) => {
    setAdminData(adminInfo);
    setCurrentScreen('admin-dashboard');
  };

  const handleAdminLogout = () => {
    setAdminData(null);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    setCurrentScreen('type-selector');
  };

  return (
    <div className="min-h-screen">
      {currentScreen === 'type-selector' && (
        <UserTypeSelector 
          onSelectType={handleUserTypeSelect}
          onAdminClick={() => setCurrentScreen('admin-login')}
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
          onAuthorHomeClick={user?.userType === 'author' ? () => setCurrentScreen('author') : undefined}
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
            setEditingManuscript(null); // 새 작성 모드
            setCurrentScreen('editor');
          }}
          onEditClick={(manuscript) => {
            setEditingManuscript(manuscript); // 편집 모드
            setCurrentScreen('editor');
          }}
        />
      )}
      
      {currentScreen === 'editor' && (
        <AuthorEditor
          user={user}
          onBack={() => {
            setEditingManuscript(null); // 편집 모드 해제
            setCurrentScreen('author');
          }}
          editingManuscript={editingManuscript}
        />
      )}

      {currentScreen === 'admin-login' && (
        <AdminLogin
          onLoginSuccess={handleAdminLogin}
          onBackToMain={() => setCurrentScreen('type-selector')}
        />
      )}

      {currentScreen === 'admin-dashboard' && adminData && (
        <AdminDashboard
          adminData={adminData}
          onLogout={handleAdminLogout}
        />
      )}
    </div>
  );
};

export default Index;
