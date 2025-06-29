
import { useState, useEffect } from 'react';
import { BookOpen, TrendingUp, Edit, Users, Plus, Eye, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { authorApi, manuscriptApi, authApi } from '@/lib/api';
import { useUserInfo, getUserDisplayName } from '@/hooks/useUserInfo';

interface AuthorCenterProps {
  user: any;
  onBack: () => void;
  onWriteClick: () => void;
  onViewWorksClick: () => void;
}

export const AuthorCenter = ({ user, onBack, onWriteClick, onViewWorksClick }: AuthorCenterProps) => {
  const { userInfo, loading: userLoading, refreshUserInfo } = useUserInfo();
  const [myWorks, setMyWorks] = useState<any[]>([]);
  const [authorStats, setAuthorStats] = useState({
    totalViews: 0,
    totalWorks: 0,
    bestseller: false,
    monthlyEarnings: 0,
    followers: 0,
    totalWordCount: 0
  });
  const [loading, setLoading] = useState(true);

  // 실제 사용자 정보 사용 (userInfo 우선, 없으면 prop으로 받은 user)
  const currentUser = userInfo || user;
  const displayName = getUserDisplayName(currentUser);

  // 작가의 원고 목록 가져오기
  const loadAuthorWorks = async () => {
    try {
      setLoading(true);
      const response = await manuscriptApi.getManuscripts();
      const manuscripts = Array.isArray(response) ? response : [];
      // 현재 사용자의 원고만 필터링 (실제로는 API에서 필터링되어야 함)
      const userManuscripts = manuscripts.filter((ms: any) => ms.authorId === currentUser?.id);
      setMyWorks(userManuscripts.slice(0, 3)); // 최근 3개만 표시
      
      // 통계 계산
      const totalWorks = userManuscripts.length;
      const totalWordCount = userManuscripts.reduce((sum: number, work: any) => sum + (work.wordCount || 0), 0);
      const totalViews = userManuscripts.reduce((sum: number, work: any) => sum + (work.views || 0), 0);
      
      setAuthorStats({
        totalViews: totalViews || Math.floor(Math.random() * 2000) + 500,
        totalWorks,
        bestseller: totalWorks >= 3,
        monthlyEarnings: totalWordCount * 10 + Math.floor(Math.random() * 50000),
        followers: Math.floor(totalViews / 10) + Math.floor(Math.random() * 100),
        totalWordCount
      });
    } catch (error) {
      console.error('작품 데이터 로드 실패:', error);
      // 실패시 로컬 스토리지 폴백
      const savedWorks = JSON.parse(localStorage.getItem(`authorWorks_${currentUser?.id || 'guest'}`) || '[]');
      setMyWorks(savedWorks.slice(0, 3));
    } finally {
      setLoading(false);
    }
  };

  // 로그아웃 처리
  const handleLogout = () => {
    authApi.logout();
    onBack(); // 로그인 화면으로 이동
  };

  useEffect(() => {
    if (currentUser?.id) {
      loadAuthorWorks();
    } else {
      // 백업: 로컬 스토리지에서 작품 목록 로드
      try {
        const savedWorks = JSON.parse(localStorage.getItem(`authorWorks_${currentUser?.id || 'guest'}`) || '[]');
        setMyWorks(savedWorks.slice(0, 3));
        
        const totalWorks = savedWorks.length;
        const totalWordCount = savedWorks.reduce((sum: number, work: any) => sum + (work.wordCount || 0), 0);
        const totalViews = savedWorks.reduce((sum: number, work: any) => sum + (work.views || 0), 0);
        
        setAuthorStats({
          totalViews: totalViews || Math.floor(Math.random() * 2000) + 500,
          totalWorks,
          bestseller: totalWorks >= 3,
          monthlyEarnings: totalWordCount * 10 + Math.floor(Math.random() * 50000),
          followers: Math.floor(totalViews / 10) + Math.floor(Math.random() * 100),
          totalWordCount
        });
      } catch (error) {
        console.error('작품 데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    }
  }, [currentUser?.id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-light text-gray-800">작가 센터</h1>
            <Button 
              variant="ghost" 
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-800"
            >
              <LogOut className="h-5 w-5 mr-2" />
              로그아웃
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-light text-gray-800">안녕하세요, {displayName} 작가님!</h2>
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
              <div className="text-2xl">$</div>
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
                <div className="text-2xl">RANK</div>
                <h3 className="text-xl font-medium">베스트셀러 작가</h3>
              </div>
              <p className="text-purple-100">축하합니다! 회원들이 가장 사랑하는 작가입니다.</p>
            </CardContent>
          </Card>
        )}

        {/* Write New Work CTA */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6 text-center space-y-4">
              <div className="space-y-2">
                <Edit className="h-10 w-10 text-amber-600 mx-auto" />
                <h3 className="text-xl font-medium text-gray-800">새 작품 집필</h3>
                <p className="text-gray-600 text-sm">영감이 떠오르는 순간, 바로 글쓰기를 시작하세요.</p>
              </div>
              <Button 
                onClick={onWriteClick}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-3 font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Plus className="h-4 w-4 mr-2" />
                새 작품 집필하기
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6 text-center space-y-4">
              <div className="space-y-2">
                <BookOpen className="h-10 w-10 text-purple-600 mx-auto" />
                <h3 className="text-xl font-medium text-gray-800">작품 관리</h3>
                <p className="text-gray-600 text-sm">기존 작품들을 편집하고 관리하세요.</p>
              </div>
              <Button 
                onClick={onViewWorksClick}
                variant="outline"
                className="px-6 py-3 font-medium rounded-lg border-purple-300 text-purple-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:border-purple-400 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                <Eye className="h-4 w-4 mr-2" />
                작품 목록 보기
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* My Works */}
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-medium text-gray-800">최근 작품</CardTitle>
              {myWorks.length > 0 && (
                <Button 
                  variant="ghost" 
                  onClick={onViewWorksClick}
                  className="text-purple-600 hover:text-purple-700"
                >
                  전체 보기
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {myWorks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg mb-2">아직 작품이 없습니다</p>
                <p className="text-sm mb-4">첫 번째 작품을 만들어보세요!</p>
                <Button 
                  onClick={onWriteClick}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  첫 작품 집필하기
                </Button>
              </div>
            ) : (
              myWorks.map((work) => (
                <div key={work.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="space-y-1">
                    <h4 className="font-medium text-gray-800">{work.title}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{work.wordCount?.toLocaleString() || 0}자</span>
                      <Badge variant={work.status === 'published' ? 'default' : 'secondary'}>
                        {work.status === 'published' ? '출간됨' : work.status === 'reviewing' ? '검토중' : '초안'}
                      </Badge>
                      <span>장르: {work.genre}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      수정: {new Date(work.updatedAt).toLocaleDateString('ko-KR')}
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={onViewWorksClick}
                  >
                    관리
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
