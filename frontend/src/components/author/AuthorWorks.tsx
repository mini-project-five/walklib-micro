import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit, Eye, Trash2, Calendar, BookOpen, FileText, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface Work {
  id: string;
  title: string;
  genre: string;
  content: string;
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'published' | 'reviewing';
  wordCount: number;
}

interface AuthorWorksProps {
  user: any;
  onBack: () => void;
  onNewWork: () => void;
  onEditWork: (work: Work) => void;
}

export const AuthorWorks = ({ user, onBack, onNewWork, onEditWork }: AuthorWorksProps) => {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const handleLogout = () => {
    localStorage.removeItem('walkingLibraryUser');
    window.location.reload();
  };

  useEffect(() => {
    // 로컬 스토리지에서 작품 목록 로드
    const loadWorks = () => {
      try {
        const savedWorks = localStorage.getItem(`authorWorks_${user?.id || 'guest'}`);
        if (savedWorks) {
          setWorks(JSON.parse(savedWorks));
        }
      } catch (error) {
        console.error('작품 목록 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWorks();
  }, [user?.id]);

  const handleDeleteWork = (workId: string) => {
    const updatedWorks = works.filter(work => work.id !== workId);
    setWorks(updatedWorks);
    localStorage.setItem(`authorWorks_${user?.id || 'guest'}`, JSON.stringify(updatedWorks));
    
    toast({
      title: "작품이 삭제되었습니다",
      description: "선택한 작품이 영구적으로 삭제되었습니다.",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">초안</Badge>;
      case 'published':
        return <Badge variant="default">출간됨</Badge>;
      case 'reviewing':
        return <Badge variant="outline">검토중</Badge>;
      default:
        return <Badge variant="secondary">초안</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 mx-auto text-purple-500 animate-pulse mb-4" />
          <p className="text-gray-600">작품 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              작가 센터로 돌아가기
            </Button>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user?.penName || user?.name}</span>
              <Button 
                variant="ghost" 
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700"
              >
                <LogOut className="h-4 w-4 mr-2" />
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-light text-gray-800 mb-2">내 작품 목록</h1>
            <p className="text-gray-600">총 {works.length}개의 작품이 있습니다</p>
          </div>
          
          <Button
            onClick={onNewWork}
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            새 작품 집필
          </Button>
        </div>

        {/* Works Grid */}
        {works.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
            <CardContent className="py-16 text-center">
              <BookOpen className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-600 mb-2">아직 작품이 없습니다</h3>
              <p className="text-gray-500 mb-6">첫 번째 작품을 만들어보세요!</p>
              <Button
                onClick={onNewWork}
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                새 작품 집필하기
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {works.map((work) => (
              <Card 
                key={work.id} 
                className="bg-white/80 backdrop-blur-sm border-gray-200/50 hover:shadow-lg transition-all duration-200 group"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-lg font-medium text-gray-800 line-clamp-2 group-hover:text-purple-700 transition-colors">
                      {work.title}
                    </CardTitle>
                    {getStatusBadge(work.status)}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <FileText className="h-3 w-3 mr-1" />
                      {work.wordCount.toLocaleString()}자
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {work.genre}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {/* Cover Preview */}
                  {work.coverImage ? (
                    <div className="aspect-[3/4] mb-4 bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src={work.coverImage} 
                        alt={work.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="aspect-[3/4] mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Content Preview */}
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                    {work.content.length > 100 ? `${work.content.substring(0, 100)}...` : work.content}
                  </p>
                  
                  {/* Dates */}
                  <div className="space-y-1 mb-4 text-xs text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      생성: {formatDate(work.createdAt)}
                    </div>
                    {work.updatedAt !== work.createdAt && (
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        수정: {formatDate(work.updatedAt)}
                      </div>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      onClick={() => onEditWork(work)}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      편집
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        // 작품 상세 보기 기능 (향후 구현)
                        toast({
                          title: "상세 보기",
                          description: "작품 상세 보기 기능이 곧 추가됩니다.",
                        });
                      }}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (confirm('정말로 이 작품을 삭제하시겠습니까?')) {
                          handleDeleteWork(work.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-700 hover:border-red-300"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
