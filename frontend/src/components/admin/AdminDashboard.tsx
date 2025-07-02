import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, PenTool, ArrowLeft, Users, Settings } from 'lucide-react';
import { AdminKtAuth } from './AdminKtAuth';
import { AdminAuthorApproval } from './AdminAuthorApproval';

interface AdminDashboardProps {
  onBack: () => void;
}

type AdminScreen = 'dashboard' | 'kt-auth' | 'author-approval';

export const AdminDashboard = ({ onBack }: AdminDashboardProps) => {
  const [currentScreen, setCurrentScreen] = useState<AdminScreen>('dashboard');

  if (currentScreen === 'kt-auth') {
    return <AdminKtAuth onBack={() => setCurrentScreen('dashboard')} />;
  }

  if (currentScreen === 'author-approval') {
    return <AdminAuthorApproval onBack={() => setCurrentScreen('dashboard')} />;
  }

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-indigo-100 rounded-full">
              <Settings className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
              <p className="text-gray-600">시스템 관리 및 사용자 승인을 처리할 수 있습니다.</p>
            </div>
          </div>
          <Button onClick={onBack} variant="outline" className="flex items-center space-x-2">
            <ArrowLeft className="w-4 h-4" />
            <span>뒤로가기</span>
          </Button>
        </div>

        {/* Welcome Card */}
        <Card className="mb-8 bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0">
          <CardContent className="p-8">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-white/20 rounded-full">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">관리자님, 환영합니다!</h2>
                <p className="text-indigo-100">
                  걷다가 서재의 원활한 운영을 위해 사용자 인증 및 작가 승인을 관리하세요.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Management Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* KT 인증 관리 */}
          <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <span>KT 인증 관리</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                KT 고객의 인증 요청을 검토하고 승인 또는 거절할 수 있습니다.
                승인 시 5,000 포인트가 자동으로 지급됩니다.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>KT 고객 확인</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>자동 포인트 지급</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>실시간 상태 업데이트</span>
                </div>
              </div>
              <Button 
                onClick={() => setCurrentScreen('kt-auth')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                KT 인증 관리하기
              </Button>
            </CardContent>
          </Card>

          {/* 작가 승인 관리 */}
          <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                  <PenTool className="w-6 h-6 text-purple-600" />
                </div>
                <span>작가 승인 관리</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                작가 신청을 검토하고 승인 또는 거절할 수 있습니다.
                승인된 작가는 작품을 작성하고 출간할 수 있습니다.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>작가 자격 검토</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span>작품 등록 권한 부여</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                  <span>작가 프로필 활성화</span>
                </div>
              </div>
              <Button 
                onClick={() => setCurrentScreen('author-approval')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                작가 승인 관리하기
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-4 gap-4 mt-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm text-gray-600">KT 인증 대기</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">0</div>
              <div className="text-sm text-gray-600">작가 승인 대기</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-gray-600">오늘 처리</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">0</div>
              <div className="text-sm text-gray-600">전체 승인</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>빠른 액션</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => setCurrentScreen('kt-auth')}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Shield className="w-4 h-4" />
                <span>KT 인증 처리</span>
              </Button>
              <Button
                onClick={() => setCurrentScreen('author-approval')}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <PenTool className="w-4 h-4" />
                <span>작가 승인 처리</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
