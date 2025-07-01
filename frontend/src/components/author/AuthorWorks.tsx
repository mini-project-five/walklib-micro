import { useState, useEffect } from 'react';
import { Search, Filter, Edit, Trash2, Eye, Plus, LogOut, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { manuscriptApi, authApi } from '@/lib/api';
import { useUserInfo, getUserDisplayName, getUserRoleText } from '@/hooks/useUserInfo';

interface AuthorWorksProps {
  user: any;
  onBack: () => void;
  onEditWork: (workId: string) => void;
  onCreateWork: () => void;
}

export const AuthorWorks = ({ user, onBack, onEditWork, onCreateWork }: AuthorWorksProps) => {
  const { userInfo } = useUserInfo();
  const [works, setWorks] = useState<any[]>([]);
  const [filteredWorks, setFilteredWorks] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workToDelete, setWorkToDelete] = useState<any>(null);

  // 작품 목록 로드
  const loadWorks = async () => {
    try {
      setLoading(true);
      // 실제 API 호출 시도
      const response = await manuscriptApi.getManuscripts();
      const manuscripts = Array.isArray(response) ? response : [];
      // 현재 사용자의 원고만 필터링
      const userWorks = manuscripts.filter((ms: any) => ms.authorId === (userInfo?.id || user?.id));
      setWorks(userWorks);
    } catch (error) {
      console.error('API 호출 실패, 로컬 스토리지 사용:', error);
      // API 실패시 로컬 스토리지에서 로드
      const savedWorks = JSON.parse(localStorage.getItem(`authorWorks_${userInfo?.id || user?.id || 'guest'}`) || '[]');
      setWorks(savedWorks);
    } finally {
      setLoading(false);
    }
  };

  // 작품 삭제
  const handleDeleteWork = async (workId: string) => {
    try {
      // 실제 API 호출 시도
      await manuscriptApi.deleteManuscript(workId);
      // API 성공시 상태 업데이트
      setWorks(works.filter(work => work.id !== workId));
    } catch (error) {
      console.error('API 삭제 실패, 로컬 스토리지에서 삭제:', error);
      // API 실패시 로컬 스토리지에서 삭제
      const updatedWorks = works.filter(work => work.id !== workId);
      setWorks(updatedWorks);
      localStorage.setItem(`authorWorks_${userInfo?.id || user?.id || 'guest'}`, JSON.stringify(updatedWorks));
    }
    
    setDeleteDialogOpen(false);
    setWorkToDelete(null);
  };

  // 로그아웃 처리
  const handleLogout = () => {
    authApi.logout();
    onBack();
  };

  // 검색 및 필터링
  useEffect(() => {
    let filtered = works;

    if (searchTerm) {
      filtered = filtered.filter(work => 
        work.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        work.genre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(work => work.status === statusFilter);
    }

    setFilteredWorks(filtered);
  }, [works, searchTerm, statusFilter]);

  useEffect(() => {
    loadWorks();
  }, [userInfo?.id, user?.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'reviewing': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return '출간됨';
      case 'reviewing': return '검토중';
      case 'draft': return '초안';
      default: return '미정';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={onBack}
                className="text-gray-600 hover:text-gray-800"
              >
                ← 작가 센터
              </Button>
              <div className="flex flex-col">
                <h1 className="text-xl font-light text-gray-800">작품 관리</h1>
                <p className="text-xs text-gray-500">
                  {getUserDisplayName(userInfo || user)} | {getUserRoleText(userInfo || user)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">
                  {getUserDisplayName(userInfo || user)}
                </p>
                <p className="text-xs text-gray-500">
                  {(userInfo || user)?.email}
                </p>
              </div>
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
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="작품명 또는 장르로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/80 backdrop-blur-sm border-gray-200/50"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-md border border-gray-200/50 bg-white/80 backdrop-blur-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">모든 상태</option>
              <option value="draft">초안</option>
              <option value="reviewing">검토중</option>
              <option value="published">출간됨</option>
            </select>
          </div>

          <Button 
            onClick={onCreateWork}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white whitespace-nowrap shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Plus className="h-4 w-4 mr-2" />
            새 작품 만들기
          </Button>
        </div>

        {/* Works Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">작품 목록을 불러오는 중...</p>
          </div>
        ) : filteredWorks.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
            <CardContent className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                {works.length === 0 ? '아직 작품이 없습니다' : '검색 결과가 없습니다'}
              </h3>
              <p className="text-gray-600 mb-6">
                {works.length === 0 ? '첫 번째 작품을 만들어보세요!' : '다른 검색어를 시도해보세요.'}
              </p>
              {works.length === 0 && (
                <Button 
                  onClick={onCreateWork}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  첫 작품 만들기
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorks.map((work) => (
              <Card key={work.id} className="bg-white/80 backdrop-blur-sm border-gray-200/50 hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-medium text-gray-800 mb-1">
                        {work.title}
                      </CardTitle>
                      <Badge className={`text-xs ${getStatusColor(work.status)}`}>
                        {getStatusText(work.status)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>장르:</span>
                      <span className="font-medium">{work.genre}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>글자 수:</span>
                      <span className="font-medium">{(work.wordCount || 0).toLocaleString()}자</span>
                    </div>
                    <div className="flex justify-between">
                      <span>수정일:</span>
                      <span className="font-medium">
                        {new Date(work.updatedAt || work.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    {work.views && (
                      <div className="flex justify-between">
                        <span>조회수:</span>
                        <span className="font-medium">{work.views.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditWork(work.id)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      편집
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setWorkToDelete(work);
                        setDeleteDialogOpen(true);
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>작품 삭제</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600">
                "<strong>{workToDelete?.title}</strong>" 작품을 정말로 삭제하시겠습니까?
              </p>
              <p className="text-sm text-red-600">
                이 작업은 되돌릴 수 없습니다.
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                >
                  취소
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => workToDelete && handleDeleteWork(workToDelete.id)}
                >
                  삭제
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
