import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { userAPI, pointAPI } from '@/services/api';
import { User } from '@/services/api';
import { CheckCircle, XCircle, Clock, Users, Shield } from 'lucide-react';

interface AdminKtAuthProps {
  onBack: () => void;
}

export const AdminKtAuth = ({ onBack }: AdminKtAuthProps) => {
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const users = await userAPI.getKtAuthPendingUsers();
      setPendingUsers(users);
    } catch (error) {
      console.error('KT 인증 대기 목록 조회 실패:', error);
      setMessage('목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: number, userName: string) => {
    try {
      // 1. KT 인증 승인
      await userAPI.approveKtAuth(userId);
      
      // 2. KT 보너스 포인트 지급 (5000P)
      try {
        await pointAPI.giveKtBonus(userId, 5000);
        setMessage(`${userName}님의 KT 인증이 승인되었습니다. 5,000포인트가 추가로 지급되었습니다.`);
      } catch (pointError) {
        console.warn('KT 보너스 포인트 지급 실패:', pointError);
        // KT 보너스 API가 없다면 포인트 충전 API 사용
        try {
          await pointAPI.chargePoints(userId, 5000);
          setMessage(`${userName}님의 KT 인증이 승인되었습니다. 5,000포인트가 추가로 지급되었습니다.`);
        } catch (chargeError) {
          console.error('포인트 지급 실패:', chargeError);
          setMessage(`${userName}님의 KT 인증은 승인되었지만, 포인트 지급에 실패했습니다. 수동으로 처리해주세요.`);
        }
      }
      
      fetchPendingUsers(); // 목록 새로고침
    } catch (error) {
      console.error('KT 인증 승인 실패:', error);
      setMessage('승인 처리에 실패했습니다.');
    }
  };

  const handleReject = async (userId: number, userName: string) => {
    try {
      await userAPI.rejectKtAuth(userId);
      setMessage(`${userName}님의 KT 인증이 거절되었습니다.`);
      fetchPendingUsers(); // 목록 새로고침
    } catch (error) {
      console.error('KT 인증 거절 실패:', error);
      setMessage('거절 처리에 실패했습니다.');
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">KT 인증 관리</h1>
              <p className="text-gray-600">KT 고객 인증 요청을 승인하거나 거절할 수 있습니다.</p>
            </div>
          </div>
          <Button onClick={onBack} variant="outline">
            돌아가기
          </Button>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
            {message}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Clock className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600">대기 중</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingUsers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Users className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">전체 요청</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingUsers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">처리 대기</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingUsers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Users List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>KT 인증 대기 목록</span>
              <Badge variant="secondary">{pendingUsers.length}건</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">목록을 불러오는 중...</p>
              </div>
            ) : pendingUsers.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">현재 KT 인증 요청이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingUsers.map((user) => (
                  <div
                    key={user.userId}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {user.userName?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{user.userName}</h3>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>사용자 ID: {user.userId}</span>
                        <Badge variant="outline" className="text-orange-600 border-orange-200">
                          KT 인증 대기
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleApprove(user.userId!, user.userName)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        승인
                      </Button>
                      <Button
                        onClick={() => handleReject(user.userId!, user.userName)}
                        size="sm"
                        variant="destructive"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        거절
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
