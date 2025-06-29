
import { ArrowLeft, BookOpen, TrendingUp, Edit, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AuthorCenterProps {
  user: any;
  onBack: () => void;
  onWriteClick: () => void;
}

export const AuthorCenter = ({ user, onBack, onWriteClick }: AuthorCenterProps) => {
  // Sample author data
  const authorStats = {
    totalViews: 1247,
    totalWorks: 3,
    bestseller: true,
    monthlyEarnings: 45600,
    followers: 89
  };

  const myWorks = [
    { id: 1, title: '바람의 서사시', views: 523, status: '연재중', lastUpdate: '2024-01-15' },
    { id: 2, title: '도시의 밤', views: 412, status: '완결', lastUpdate: '2024-01-10' },
    { id: 3, title: '시간의 조각들', views: 312, status: '연재중', lastUpdate: '2024-01-12' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              서재로 돌아가기
            </Button>
            <h1 className="text-xl font-light text-gray-800">작가 센터</h1>
            <div></div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-light text-gray-800">안녕하세요, {user?.name} 작가님!</h2>
          <p className="text-gray-600">창작의 영감이 가득한 하루 되세요.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
            <CardContent className="p-6 text-center space-y-2">
              <TrendingUp className="h-8 w-8 text-blue-600 mx-auto" />
              <div className="text-2xl font-bold text-gray-800">{authorStats.totalViews.toLocaleString()}</div>
              <div className="text-sm text-gray-600">총 조회수</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
            <CardContent className="p-6 text-center space-y-2">
              <BookOpen className="h-8 w-8 text-green-600 mx-auto" />
              <div className="text-2xl font-bold text-gray-800">{authorStats.totalWorks}</div>
              <div className="text-sm text-gray-600">등록 작품수</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
            <CardContent className="p-6 text-center space-y-2">
              <Users className="h-8 w-8 text-purple-600 mx-auto" />
              <div className="text-2xl font-bold text-gray-800">{authorStats.followers}</div>
              <div className="text-sm text-gray-600">팔로워</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0">
            <CardContent className="p-6 text-center space-y-2">
              <div className="text-2xl">💰</div>
              <div className="text-2xl font-bold">₩{authorStats.monthlyEarnings.toLocaleString()}</div>
              <div className="text-sm text-amber-100">이번 달 수익</div>
            </CardContent>
          </Card>
        </div>

        {/* Achievement Badge */}
        {authorStats.bestseller && (
          <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <div className="text-2xl">🏆</div>
                <h3 className="text-xl font-medium">베스트셀러 작가</h3>
              </div>
              <p className="text-purple-100">축하합니다! 회원들이 가장 사랑하는 작가입니다.</p>
            </CardContent>
          </Card>
        )}

        {/* Write New Work CTA */}
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-8 text-center space-y-6">
            <div className="space-y-2">
              <Edit className="h-12 w-12 text-amber-600 mx-auto" />
              <h3 className="text-2xl font-medium text-gray-800">새로운 작품을 시작해보세요</h3>
              <p className="text-gray-600">영감이 떠오르는 순간, 바로 글쓰기를 시작할 수 있어요.</p>
            </div>
            <Button 
              onClick={onWriteClick}
              className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 text-lg font-medium rounded-xl transition-all duration-300 hover:scale-105"
            >
              새 작품 집필하기
            </Button>
          </CardContent>
        </Card>

        {/* My Works */}
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
          <CardHeader>
            <CardTitle className="text-xl font-medium text-gray-800">내 작품 관리</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {myWorks.map((work) => (
              <div key={work.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="space-y-1">
                  <h4 className="font-medium text-gray-800">{work.title}</h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>조회수: {work.views.toLocaleString()}</span>
                    <Badge variant={work.status === '연재중' ? 'default' : 'secondary'}>
                      {work.status}
                    </Badge>
                    <span>최종 수정: {work.lastUpdate}</span>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  편집
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
