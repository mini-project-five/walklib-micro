import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  TrendingUp, 
  Shield, 
  Settings,
  LogOut,
  Bell,
  BarChart3,
  FileText,
  AlertCircle
} from 'lucide-react';

// 컴포넌트 임포트
import AdminUserManagement from './AdminUserManagement';
import AdminAuthorApproval from './AdminAuthorApproval';
import AdminStatistics from './AdminStatistics';

interface AdminDashboardProps {
  adminData: any;
  onLogout: () => void;
}

interface DashboardStats {
  userStats: {
    totalUsers: number;
    readerCount: number;
    authorCount: number;
    adminCount: number;
    activeUsers: number;
    recentSignups: number;
  };
  authorStats: {
    pendingCount: number;
    approvedCount: number;
    rejectedCount: number;
    totalRequests: number;
    approvalRate: number;
  };
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ adminData, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        setError('인증 토큰이 없습니다.');
        return;
      }

      // 사용자 통계 조회
      const userStatsResponse = await fetch('http://20.249.130.200/users/admin/dashboard-stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // 작가 승인 통계 조회  
      const authorStatsResponse = await fetch('http://20.249.130.200/admin/authors/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const userStatsData = await userStatsResponse.json();
      const authorStatsData = await authorStatsResponse.json();

      if (userStatsData.success && authorStatsData.success) {
        setDashboardStats({
          userStats: userStatsData.stats,
          authorStats: authorStatsData.stats
        });
      } else {
        setError('통계 데이터를 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('Dashboard stats loading error:', error);
      setError('통계 데이터 로드 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    onLogout();
  };

  const StatCard: React.FC<{
    title: string;
    value: number | string;
    description: string;
    icon: React.ReactNode;
    trend?: string;
    trendUp?: boolean;
  }> = ({ title, value, description, icon, trend, trendUp }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <div className={`flex items-center text-xs mt-1 ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className={`w-3 h-3 mr-1 ${!trendUp && 'transform rotate-180'}`} />
            {trend}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">대시보드를 로드하는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">WalkLib 관리자</h1>
                  <p className="text-sm text-gray-500">시스템 관리 대시보드</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{adminData.user?.userName || 'Admin'}</p>
                <p className="text-xs text-gray-500">{adminData.user?.email}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>로그아웃</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>개요</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>사용자 관리</span>
            </TabsTrigger>
            <TabsTrigger value="authors" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>작가 승인</span>
            </TabsTrigger>
            <TabsTrigger value="statistics" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>통계</span>
            </TabsTrigger>
          </TabsList>

          {/* 개요 탭 */}
          <TabsContent value="overview" className="space-y-6">
            {dashboardStats && (
              <>
                {/* 사용자 통계 */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">사용자 현황</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                      title="전체 사용자"
                      value={dashboardStats.userStats.totalUsers}
                      description="등록된 모든 사용자"
                      icon={<Users className="h-4 w-4 text-muted-foreground" />}
                    />
                    <StatCard
                      title="독자"
                      value={dashboardStats.userStats.readerCount}
                      description="일반 독자 계정"
                      icon={<UserCheck className="h-4 w-4 text-blue-600" />}
                    />
                    <StatCard
                      title="작가"
                      value={dashboardStats.userStats.authorCount}
                      description="승인된 작가 계정"
                      icon={<FileText className="h-4 w-4 text-green-600" />}
                    />
                    <StatCard
                      title="최근 가입자"
                      value={dashboardStats.userStats.recentSignups}
                      description="최근 7일간 신규 가입"
                      icon={<TrendingUp className="h-4 w-4 text-purple-600" />}
                    />
                  </div>
                </div>

                {/* 작가 승인 현황 */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">작가 승인 현황</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                      title="승인 대기"
                      value={dashboardStats.authorStats.pendingCount}
                      description="검토가 필요한 신청"
                      icon={<Clock className="h-4 w-4 text-orange-600" />}
                    />
                    <StatCard
                      title="승인 완료"
                      value={dashboardStats.authorStats.approvedCount}
                      description="승인된 작가 신청"
                      icon={<UserCheck className="h-4 w-4 text-green-600" />}
                    />
                    <StatCard
                      title="승인 거부"
                      value={dashboardStats.authorStats.rejectedCount}
                      description="거부된 작가 신청"
                      icon={<UserX className="h-4 w-4 text-red-600" />}
                    />
                    <StatCard
                      title="승인률"
                      value={`${dashboardStats.authorStats.approvalRate}%`}
                      description="전체 신청 대비 승인률"
                      icon={<BarChart3 className="h-4 w-4 text-blue-600" />}
                    />
                  </div>
                </div>

                {/* 승인 대기 알림 */}
                {dashboardStats.authorStats.pendingCount > 0 && (
                  <Alert>
                    <Bell className="h-4 w-4" />
                    <AlertDescription>
                      <strong>{dashboardStats.authorStats.pendingCount}개</strong>의 작가 승인 요청이 대기 중입니다.
                      <Button
                        variant="link"
                        className="ml-2 p-0 h-auto"
                        onClick={() => setActiveTab('authors')}
                      >
                        지금 검토하기
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </TabsContent>

          {/* 사용자 관리 탭 */}
          <TabsContent value="users">
            <AdminUserManagement />
          </TabsContent>

          {/* 작가 승인 탭 */}
          <TabsContent value="authors">
            <AdminAuthorApproval onStatsUpdate={loadDashboardStats} />
          </TabsContent>

          {/* 통계 탭 */}
          <TabsContent value="statistics">
            <AdminStatistics dashboardStats={dashboardStats} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;