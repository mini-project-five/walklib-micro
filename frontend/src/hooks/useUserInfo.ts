import { useState, useEffect } from 'react';
import { authApi } from '@/lib/api';

interface UserInfo {
  id: string;
  email: string;
  userName?: string;
  realName?: string;
  penName?: string;
  role: string;
  userType: 'reader' | 'author';
  isKtCustomer?: boolean;
  coins?: number;
  isSubscribed?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface UseUserInfoReturn {
  userInfo: UserInfo | null;
  loading: boolean;
  error: string | null;
  refreshUserInfo: () => Promise<void>;
  updateUserInfo: (updates: Partial<UserInfo>) => void;
}

export const useUserInfo = (): UseUserInfoReturn => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUserInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 먼저 로컬 스토리지에서 기본 정보 확인
      const savedUser = localStorage.getItem('walkingLibraryUser');
      if (!savedUser) {
        setUserInfo(null);
        setLoading(false);
        return;
      }

      const localUserData = JSON.parse(savedUser);
      
      // 로컬 정보를 우선 설정 (빠른 로딩을 위해)
      setUserInfo(localUserData);

      // API를 통해 최신 정보 가져오기
      try {
        const response = await authApi.getCurrentUser();
        const apiUserData = response as UserInfo;
        
        // API 응답과 로컬 정보 병합
        const mergedUserInfo = {
          ...localUserData,
          ...apiUserData,
          // 로컬 정보 중 일부는 유지 (coins, isSubscribed 등)
          coins: localUserData.coins || apiUserData.coins || 100,
          isSubscribed: localUserData.isSubscribed || apiUserData.isSubscribed || false,
        };

        setUserInfo(mergedUserInfo);
        
        // 로컬 스토리지 업데이트
        localStorage.setItem('walkingLibraryUser', JSON.stringify(mergedUserInfo));
      } catch (apiError) {
        console.warn('API에서 사용자 정보 로드 실패, 로컬 정보 사용:', apiError);
        // API 실패시 로컬 정보만 사용
      }
    } catch (localError) {
      console.error('사용자 정보 로드 실패:', localError);
      setError('사용자 정보를 불러올 수 없습니다.');
      setUserInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshUserInfo = async () => {
    await loadUserInfo();
  };

  const updateUserInfo = (updates: Partial<UserInfo>) => {
    if (userInfo) {
      const updatedUserInfo = { ...userInfo, ...updates };
      setUserInfo(updatedUserInfo);
      localStorage.setItem('walkingLibraryUser', JSON.stringify(updatedUserInfo));
    }
  };

  useEffect(() => {
    loadUserInfo();
  }, []);

  return {
    userInfo,
    loading,
    error,
    refreshUserInfo,
    updateUserInfo
  };
};

// 사용자 이름을 가져오는 유틸리티 함수
export const getUserDisplayName = (user: UserInfo | null): string => {
  if (!user) return '게스트';
  
  // 작가의 경우 필명 우선, 없으면 실명, 없으면 사용자명
  if (user.userType === 'author') {
    return user.penName || user.realName || user.userName || user.email.split('@')[0];
  }
  
  // 독자의 경우 사용자명 우선, 없으면 실명, 없으면 이메일에서 추출
  return user.userName || user.realName || user.email.split('@')[0];
};

// 사용자 역할을 한글로 표시하는 유틸리티 함수
export const getUserRoleText = (user: UserInfo | null): string => {
  if (!user) return '게스트';
  
  switch (user.userType) {
    case 'author': return '작가';
    case 'reader': return '독자';
    default: return user.role || '사용자';
  }
};

// 역할 검증 함수
export const validateUserRole = (user: UserInfo | null, expectedRole: 'author' | 'reader'): boolean => {
  if (!user) return false;
  
  const userRole = user.userType || (user.role === 'AUTHOR' ? 'author' : 'reader');
  return userRole === expectedRole;
};

// 권한 체크 함수
export const hasPermission = (user: UserInfo | null, permission: string): boolean => {
  if (!user) return false;
  
  switch (permission) {
    case 'write':
      return user.userType === 'author' || user.role === 'AUTHOR';
    case 'read':
      return true; // 모든 사용자가 읽기 가능
    case 'admin':
      return user.role === 'ADMIN';
    default:
      return false;
  }
};
