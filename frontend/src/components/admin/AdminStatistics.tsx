import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  UserCheck, 
  UserX, 
  FileText,
  TrendingUp,
  BarChart3,
  PieChart,
  Calendar
} from 'lucide-react';

interface StatisticsProps {
  dashboardStats: {
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
  } | null;
}

const AdminStatistics: React.FC<StatisticsProps> = ({ dashboardStats }) => {
  if (!dashboardStats) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">통계 데이터를 불러오는 중...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { userStats, authorStats } = dashboardStats;

  // 사용자 역할별 비율 계산
  const userRoleDistribution = [
    { name: '독자', value: userStats.readerCount, color: 'bg-blue-500' },
    { name: '작가', value: userStats.authorCount, color: 'bg-green-500' },
    { name: '관리자', value: userStats.adminCount, color: 'bg-purple-500' }
  ];

  // 작가 승인 상태별 비율 계산
  const authorApprovalDistribution = [
    { name: '승인됨', value: authorStats.approvedCount, color: 'bg-green-500' },
    { name: '거부됨', value: authorStats.rejectedCount, color: 'bg-red-500' },
    { name: '대기중', value: authorStats.pendingCount, color: 'bg-orange-500' }
  ];

  const StatCard: React.FC<{
    title: string;
    value: number | string;
    description: string;
    icon: React.ReactNode;
    className?: string;
  }> = ({ title, value, description, icon, className = '' }) => (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  const ChartCard: React.FC<{
    title: string;
    data: Array<{ name: string; value: number; color: string }>;
    total: number;
  }> = ({ title, data, total }) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>전체 {total}건 기준</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((item, index) => {
          const percentage = total > 0 ? (item.value / total) * 100 : 0;
          return (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <div className="text-sm text-gray-600">
                  {item.value}명 ({percentage.toFixed(1)}%)
                </div>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">시스템 통계</h2>
        <p className="text-gray-600">WalkLib 서비스의 전체 현황을 확인합니다</p>
      </div>

      {/* 주요 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="전체 사용자"
          value={userStats.totalUsers}
          description="시스템에 등록된 모든 사용자"
          icon={<Users className="h-4 w-4 text-blue-600" />}
        />
        <StatCard
          title="활성 사용자"
          value={userStats.activeUsers}
          description="현재 활성 상태인 사용자"
          icon={<UserCheck className="h-4 w-4 text-green-600" />}
        />
        <StatCard
          title="최근 가입자"
          value={userStats.recentSignups}
          description="최근 7일간 신규 가입"
          icon={<TrendingUp className="h-4 w-4 text-purple-600" />}
        />
        <StatCard
          title="작가 승인률"
          value={`${authorStats.approvalRate}%`}
          description="전체 신청 대비 승인 비율"
          icon={<FileText className="h-4 w-4 text-orange-600" />}
        />
      </div>

      {/* 차트 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 사용자 역할 분포 */}
        <ChartCard
          title="사용자 역할 분포"
          data={userRoleDistribution}
          total={userStats.totalUsers}
        />

        {/* 작가 승인 현황 */}
        <ChartCard
          title="작가 승인 현황"
          data={authorApprovalDistribution}
          total={authorStats.totalRequests}
        />
      </div>

      {/* 상세 통계 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 사용자 상세 통계 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>사용자 상세 현황</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div>
                  <div className="font-medium text-blue-900">독자</div>
                  <div className="text-sm text-blue-600">일반 사용자</div>
                </div>
                <div className="text-2xl font-bold text-blue-900">{userStats.readerCount}</div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div>
                  <div className="font-medium text-green-900">작가</div>
                  <div className="text-sm text-green-600">승인된 작가</div>
                </div>
                <div className="text-2xl font-bold text-green-900">{userStats.authorCount}</div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <div>
                  <div className="font-medium text-purple-900">관리자</div>
                  <div className="text-sm text-purple-600">시스템 관리자</div>
                </div>
                <div className="text-2xl font-bold text-purple-900">{userStats.adminCount}</div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="text-sm text-gray-600">
                <div className="flex justify-between py-1">
                  <span>활성 사용자 비율:</span>
                  <span className="font-medium">
                    {userStats.totalUsers > 0 
                      ? ((userStats.activeUsers / userStats.totalUsers) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span>작가 비율:</span>
                  <span className="font-medium">
                    {userStats.totalUsers > 0 
                      ? ((userStats.authorCount / userStats.totalUsers) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 작가 승인 상세 통계 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>작가 승인 상세 현황</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <div>
                  <div className="font-medium text-orange-900">승인 대기</div>
                  <div className="text-sm text-orange-600">검토 필요</div>
                </div>
                <div className="text-2xl font-bold text-orange-900">{authorStats.pendingCount}</div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div>
                  <div className="font-medium text-green-900">승인됨</div>
                  <div className="text-sm text-green-600">작가 계정 활성화</div>
                </div>
                <div className="text-2xl font-bold text-green-900">{authorStats.approvedCount}</div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <div>
                  <div className="font-medium text-red-900">거부됨</div>
                  <div className="text-sm text-red-600">승인 거부</div>
                </div>
                <div className="text-2xl font-bold text-red-900">{authorStats.rejectedCount}</div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="text-sm text-gray-600">
                <div className="flex justify-between py-1">
                  <span>전체 신청 건수:</span>
                  <span className="font-medium">{authorStats.totalRequests}건</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>처리 완료 비율:</span>
                  <span className="font-medium">
                    {authorStats.totalRequests > 0 
                      ? (((authorStats.approvedCount + authorStats.rejectedCount) / authorStats.totalRequests) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span>승인률:</span>
                  <span className="font-medium text-green-600">{authorStats.approvalRate}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 시스템 요약 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>시스템 요약</span>
          </CardTitle>
          <CardDescription>WalkLib 서비스의 전반적인 상태</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-900">{userStats.totalUsers}</div>
              <div className="text-sm text-blue-600">총 사용자 수</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-900">{authorStats.approvedCount}</div>
              <div className="text-sm text-green-600">활동 작가 수</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-900">{authorStats.approvalRate}%</div>
              <div className="text-sm text-purple-600">작가 승인률</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStatistics;