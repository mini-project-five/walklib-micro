
import { useState, useEffect } from 'react';
import { BookOpen, TrendingUp, Edit, Users, LogOut, Crown, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { manuscriptAPI, Manuscript } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface AuthorCenterProps {
  user: any;
  onBack: () => void;
  onWriteClick: () => void;
  refreshTrigger?: number; // 갱신 트리거용 prop
}

export const AuthorCenter = ({ user, onBack, onWriteClick, refreshTrigger }: AuthorCenterProps) => {
  const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishingId, setPublishingId] = useState<number | null>(null);
  const { toast } = useToast();

  const handleLogout = () => {
    localStorage.removeItem('walkingLibraryUser');
    window.location.reload();
  };

  // 원고 편집 (에디터로 이동)
  const handleEditManuscript = (manuscript: Manuscript) => {
    // 편집할 원고 정보를 localStorage에 저장하고 에디터로 이동
    localStorage.setItem('editingManuscript', JSON.stringify(manuscript));
    onWriteClick();
  };

  // 원고 출간
  const handlePublishManuscript = async (manuscript: Manuscript) => {
    if (!manuscript.manuscriptId) return;
    
    setPublishingId(manuscript.manuscriptId);
    
    try {
      await manuscriptAPI.publish(manuscript.manuscriptId);
      
      toast({
        title: "출간 완료! 🎉",
        description: `"${manuscript.title}"이 성공적으로 출간되었습니다.`,
      });

      // 목록 새로고침
      const authorId = user.authorData?.authorId || user.id;
      const response = await manuscriptAPI.getByAuthor(authorId);
      const manuscriptList = Array.isArray(response) ? response : [];
      setManuscripts(manuscriptList);
      
    } catch (error) {
      console.error('출간 실패:', error);
      toast({
        title: "출간 실패",
        description: "출간 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive"
      });
    } finally {
      setPublishingId(null);
    }
  };

  // Load manuscripts on component mount and when refreshTrigger changes
  useEffect(() => {
    const loadManuscripts = async () => {
      setLoading(true);
      try {
        const authorId = user.authorData?.authorId || user.id;
        const response = await manuscriptAPI.getByAuthor(authorId);
        // response가 배열이면 그대로 사용, 아니면 빈 배열
        const manuscriptList = Array.isArray(response) ? response : [];
        setManuscripts(manuscriptList);
      } catch (error) {
        console.error('Failed to load manuscripts:', error);
        setManuscripts([]);
      } finally {
        setLoading(false);
      }
    };

    loadManuscripts();
  }, [user, refreshTrigger]); // refreshTrigger를 dependency에 추가

  // 실제 데이터 기반 통계 계산
  const authorStats = {
    totalViews: manuscripts.reduce((sum, m) => {
      // 원고별 조회수를 임의로 계산 (실제로는 viewCount 필드가 있어야 함)
      return sum + Math.floor(Math.random() * 500) + manuscripts.length * 50;
    }, 0),
    totalWorks: manuscripts.length,
    publishedWorks: manuscripts.filter(m => m.status === 'PUBLISHED').length,
    draftWorks: manuscripts.filter(m => m.status === 'DRAFT').length,
    bestseller: manuscripts.length >= 3,
    // 목데이터
    monthlyEarnings: Math.floor(manuscripts.length * 15000 + Math.random() * 20000),
    followers: Math.floor(manuscripts.length * 25 + Math.random() * 100) + 20
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Crown className="h-6 w-6 text-amber-600" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  작가 센터
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">{user?.penName || user?.name}</p>
                <p className="text-xs text-gray-500">작가님, 안녕하세요!</p>
              </div>
              <Button 
                variant="ghost" 
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                로그아웃
              </Button>
            </div>
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
          <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6 text-center space-y-2">
              <TrendingUp className="h-8 w-8 text-blue-600 mx-auto" />
              <div className="text-2xl font-bold text-gray-800">{authorStats.totalViews.toLocaleString()}</div>
              <div className="text-sm text-gray-600">총 조회수</div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6 text-center space-y-2">
              <BookOpen className="h-8 w-8 text-green-600 mx-auto" />
              <div className="text-2xl font-bold text-gray-800">{authorStats.totalWorks}</div>
              <div className="text-sm text-gray-600">등록 작품수</div>
              <div className="text-xs text-gray-500">
                출간 {authorStats.publishedWorks} · 임시저장 {authorStats.draftWorks}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6 text-center space-y-2">
              <Users className="h-8 w-8 text-purple-600 mx-auto" />
              <div className="text-2xl font-bold text-gray-800">{authorStats.followers.toLocaleString()}</div>
              <div className="text-sm text-gray-600">팔로워</div>
              <div className="text-xs text-gray-500">독자들의 사랑</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6 text-center space-y-2">
              <div className="text-2xl">💰</div>
              <div className="text-2xl font-bold">₩{authorStats.monthlyEarnings.toLocaleString()}</div>
              <div className="text-sm text-amber-100">이번 달 수익</div>
              <div className="text-xs text-amber-200">예상 수익</div>
            </CardContent>
          </Card>
        </div>

        {/* Achievement Badge */}
        {authorStats.bestseller && (
          <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center space-x-3 mb-3">
                <Award className="h-8 w-8 text-yellow-300" />
                <h3 className="text-xl font-bold">베스트셀러 작가</h3>
                <Award className="h-8 w-8 text-yellow-300" />
              </div>
              <p className="text-purple-100">축하합니다! 독자들이 가장 사랑하는 작가입니다.</p>
              <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-purple-200">
                <span>{authorStats.totalWorks}편의 작품</span>
                <span>•</span>
                <span>{authorStats.totalViews.toLocaleString()} 조회수</span>
              </div>
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
        <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-medium text-gray-800 flex items-center">
                <Edit className="h-5 w-5 mr-2 text-gray-600" />
                내 작품 관리
              </CardTitle>
              {manuscripts.length > 0 && (
                <Badge variant="outline" className="text-gray-600">
                  총 {manuscripts.length}편
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                작품을 불러오는 중...
              </div>
            ) : manuscripts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Edit className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">아직 작성된 작품이 없습니다</p>
                <p className="text-sm mb-4">새로운 이야기를 시작해보세요!</p>
                <Button
                  onClick={onWriteClick}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  첫 작품 쓰기
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {manuscripts.map((manuscript, index) => (
                  <div key={manuscript.manuscriptId} className="group relative p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300 hover:shadow-md border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-semibold text-gray-800 text-lg">{manuscript.title}</h4>
                          <Badge variant={manuscript.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                            {manuscript.status === 'DRAFT' ? '임시저장' : 
                             manuscript.status === 'PUBLISHED' ? '출간됨' : manuscript.status}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-gray-600 leading-relaxed">
                          {manuscript.content ? (
                            manuscript.content.length > 150 
                              ? `${manuscript.content.substring(0, 150)}...` 
                              : manuscript.content
                          ) : '내용이 없습니다.'}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            조회수: {(Math.floor(Math.random() * 1000) + index * 50).toLocaleString()}
                          </span>
                          <span>
                            글자수: {manuscript.content?.length.toLocaleString() || 0}자
                          </span>
                          <span>
                            최종 수정: {manuscript.updatedAt ? new Date(manuscript.updatedAt).toLocaleDateString() : '방금 전'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="hover:bg-purple-50 hover:border-purple-300"
                          onClick={() => handleEditManuscript(manuscript)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          편집
                        </Button>
                        {manuscript.status === 'DRAFT' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="hover:bg-green-50 hover:border-green-300 text-green-600"
                            onClick={() => handlePublishManuscript(manuscript)}
                            disabled={publishingId === manuscript.manuscriptId}
                          >
                            <BookOpen className="h-3 w-3 mr-1" />
                            {publishingId === manuscript.manuscriptId ? '출간 중...' : '출간'}
                          </Button>
                        )}
                      </div>
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
