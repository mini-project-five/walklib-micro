import { useState, useEffect } from 'react';
import { Save, ArrowLeft, Wand2, ImageIcon, LogOut, Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { manuscriptApi, aiApi, authApi } from '@/lib/api';
import { useUserInfo, getUserDisplayName } from '@/hooks/useUserInfo';

interface AuthorEditorProps {
  user: any;
  workId?: string;
  onBack: () => void;
}

export const AuthorEditor = ({ user, workId, onBack }: AuthorEditorProps) => {
  const { userInfo } = useUserInfo();
  const currentUser = userInfo || user;
  const displayName = getUserDisplayName(currentUser);
  
  const [work, setWork] = useState({
    id: workId || `work_${Date.now()}`,
    title: '',
    content: '',
    genre: '',
    status: 'draft' as 'draft' | 'reviewing' | 'published',
    authorId: currentUser?.id || 'guest',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    wordCount: 0,
    views: 0,
    coverImage: ''
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiType, setAiType] = useState<'refine' | 'cover'>('refine');
  const [selectedText, setSelectedText] = useState('');
  const [aiOptions, setAiOptions] = useState({
    genre: '',
    style: '',
    targetAudience: '',
    instructions: '',
    mood: '',
    colorScheme: ''
  });

  // 작품 로드
  useEffect(() => {
    if (workId && workId !== `work_${Date.now()}`) {
      loadWork();
    }
  }, [workId]);

  const loadWork = async () => {
    try {
      // 실제 API 호출 시도
      const response = await manuscriptApi.getManuscript(workId!);
      setWork(response as any);
    } catch (error) {
      console.error('API 호출 실패, 로컬 스토리지에서 로드:', error);
      // API 실패시 로컬 스토리지에서 로드
      const savedWorks = JSON.parse(localStorage.getItem(`authorWorks_${currentUser?.id || 'guest'}`) || '[]');
      const foundWork = savedWorks.find((w: any) => w.id === workId);
      if (foundWork) {
        setWork(foundWork);
      }
    }
  };

  // 글자 수 계산
  useEffect(() => {
    const wordCount = work.content.replace(/\s/g, '').length;
    setWork(prev => ({ ...prev, wordCount }));
  }, [work.content]);

  // 작품 저장
  const handleSave = async () => {
    if (!work.title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    setIsSaving(true);
    try {
      const updatedWork = {
        ...work,
        updatedAt: new Date().toISOString()
      };

      if (workId && workId !== work.id) {
        // 기존 작품 수정
        await manuscriptApi.updateManuscript(workId, updatedWork);
      } else {
        // 새 작품 생성
        await manuscriptApi.createManuscript(updatedWork);
      }
      
      // API 성공시
      alert('작품이 저장되었습니다.');
    } catch (error) {
      console.error('API 저장 실패, 로컬 스토리지에 저장:', error);
      // API 실패시 로컬 스토리지에 저장
      const savedWorks = JSON.parse(localStorage.getItem(`authorWorks_${currentUser?.id || 'guest'}`) || '[]');
      const existingIndex = savedWorks.findIndex((w: any) => w.id === work.id);
      
      if (existingIndex >= 0) {
        savedWorks[existingIndex] = { ...work, updatedAt: new Date().toISOString() };
      } else {
        savedWorks.push({ ...work, updatedAt: new Date().toISOString() });
      }
      
      localStorage.setItem(`authorWorks_${currentUser?.id || 'guest'}`, JSON.stringify(savedWorks));
      alert('작품이 로컬에 저장되었습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // AI 텍스트 다듬기
  const handleRefineText = async () => {
    const textToRefine = selectedText.trim() || work.content.trim();
    
    if (!textToRefine) {
      alert('다듬을 텍스트가 없습니다.');
      return;
    }

    setIsAiProcessing(true);
    try {
      // 백엔드 API 시도
      const response = await aiApi.refineText({
        originalText: textToRefine,
        genre: aiOptions.genre || work.genre,
        style: aiOptions.style,
        targetAudience: aiOptions.targetAudience,
        instructions: aiOptions.instructions
      });
      
      console.log('Text refine response:', response);
      // 선택된 텍스트를 개선된 텍스트로 교체
      const refinedText = (response as any)?.data || (response as any)?.refinedText || response;
      
      if (selectedText.trim()) {
        // 선택된 텍스트가 있으면 교체
        const newContent = work.content.replace(selectedText, refinedText);
        setWork(prev => ({ ...prev, content: newContent }));
      } else {
        // 선택된 텍스트가 없으면 전체 내용 교체
        setWork(prev => ({ ...prev, content: refinedText }));
      }
      
      alert('텍스트가 다듬어졌습니다.');
      setAiDialogOpen(false);
    } catch (error) {
      console.error('백엔드 API 실패, 직접 OpenAI 호출 시도:', error);
      try {
        // 직접 OpenAI API 호출
        const refinedText = await aiApi.refineTextDirect(textToRefine, {
          genre: aiOptions.genre || work.genre,
          style: aiOptions.style,
          targetAudience: aiOptions.targetAudience,
          instructions: aiOptions.instructions
        });
        
        if (selectedText.trim()) {
          // 선택된 텍스트가 있으면 교체
          const newContent = work.content.replace(selectedText, refinedText);
          setWork(prev => ({ ...prev, content: newContent }));
        } else {
          // 선택된 텍스트가 없으면 전체 내용 교체
          setWork(prev => ({ ...prev, content: refinedText }));
        }
        
        alert('텍스트가 다듬어졌습니다.');
        setAiDialogOpen(false);
      } catch (directError) {
        console.error('직접 AI 호출도 실패:', directError);
        alert('AI 서비스에 연결할 수 없습니다. 나중에 다시 시도해주세요.');
      }
    } finally {
      setIsAiProcessing(false);
    }
  };

  // AI 표지 생성
  const handleGenerateCover = async () => {
    if (!work.title.trim()) {
      alert('작품 제목을 먼저 입력해주세요.');
      return;
    }

    setIsAiProcessing(true);
    try {
      // 백엔드 API 시도
      const response = await aiApi.generateCover({
        title: work.title,
        author: user?.name || user?.penName || '작가',
        genre: work.genre || aiOptions.genre,
        mood: aiOptions.mood,
        style: aiOptions.style,
        colorScheme: aiOptions.colorScheme,
        description: work.content.substring(0, 200)
      });
      
      console.log('Cover generation response:', response);
      // API 응답에서 이미지 URL 추출
      const imageUrl = (response as any)?.data || (response as any)?.imageUrl || response;
      setWork(prev => ({ ...prev, coverImage: imageUrl }));
      alert('표지가 생성되었습니다.');
      setAiDialogOpen(false);
    } catch (error) {
      console.error('백엔드 API 실패, 직접 OpenAI 호출 시도:', error);
      try {
        // 직접 OpenAI API 호출
        const imageUrl = await aiApi.generateCoverDirect({
          title: work.title,
          author: user?.name || user?.penName || '작가',
          genre: work.genre || aiOptions.genre,
          mood: aiOptions.mood,
          style: aiOptions.style,
          colorScheme: aiOptions.colorScheme,
          description: work.content.substring(0, 200)
        });
        
        setWork(prev => ({ ...prev, coverImage: imageUrl }));
        alert('표지가 생성되었습니다.');
        setAiDialogOpen(false);
      } catch (directError) {
        console.error('직접 AI 호출도 실패:', directError);
        alert('AI 서비스에 연결할 수 없습니다. 나중에 다시 시도해주세요.');
      }
    } finally {
      setIsAiProcessing(false);
    }
  };

  // 텍스트 선택 감지
  const handleTextSelection = () => {
    const selection = window.getSelection();
    const selected = selection?.toString() || '';
    setSelectedText(selected);
  };

  // 로그아웃 처리
  const handleLogout = () => {
    authApi.logout();
    onBack();
  };

  // 상태 변경
  const handleStatusChange = (newStatus: typeof work.status) => {
    setWork(prev => ({ ...prev, status: newStatus }));
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
                <ArrowLeft className="h-5 w-5 mr-2" />
                돌아가기
              </Button>
              <h1 className="text-xl font-light text-gray-800">
                {workId && workId !== work.id ? '작품 수정' : '새 작품 작성'}
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    저장 중...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    저장하기
                  </>
                )}
              </Button>
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Work Info */}
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-gray-800">작품 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">제목</Label>
                  <Input
                    id="title"
                    value={work.title}
                    onChange={(e) => setWork(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="작품 제목을 입력하세요"
                    className="bg-white/80 backdrop-blur-sm border-gray-200/50"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="genre">장르</Label>
                    <Input
                      id="genre"
                      value={work.genre}
                      onChange={(e) => setWork(prev => ({ ...prev, genre: e.target.value }))}
                      placeholder="예: 로맨스, 판타지"
                      className="bg-white/80 backdrop-blur-sm border-gray-200/50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">상태</Label>
                    <select
                      id="status"
                      value={work.status}
                      onChange={(e) => handleStatusChange(e.target.value as typeof work.status)}
                      className="w-full px-3 py-2 rounded-md border border-gray-200/50 bg-white/80 backdrop-blur-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="draft">초안</option>
                      <option value="reviewing">검토중</option>
                      <option value="published">출간됨</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content Editor */}
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium text-gray-800">내용</CardTitle>
                  <div className="flex items-center space-x-4">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {work.wordCount.toLocaleString()}자
                    </Badge>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        setAiType('refine');
                        setAiDialogOpen(true);
                      }}
                      className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <Wand2 className="h-4 w-4 mr-2" />
                      AI 텍스트 다듬기
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={work.content}
                  onChange={(e) => setWork(prev => ({ ...prev, content: e.target.value }))}
                  onMouseUp={handleTextSelection}
                  onKeyUp={handleTextSelection}
                  placeholder="작품 내용을 작성하세요..."
                  className="min-h-[400px] bg-white/80 backdrop-blur-sm border-gray-200/50 resize-none focus:ring-2 focus:ring-purple-500"
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Cover Image */}
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium text-gray-800">표지</CardTitle>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      setAiType('cover');
                      setAiDialogOpen(true);
                    }}
                    className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    AI 표지 생성
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {work.coverImage ? (
                  <div className="space-y-3">
                    <img
                      src={work.coverImage}
                      alt="작품 표지"
                      className="w-full aspect-[3/4] object-cover rounded-lg border border-gray-200"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-200 hover:border-blue-300 text-blue-700 hover:text-blue-800 transition-all duration-300"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = work.coverImage;
                        link.download = `${work.title || 'cover'}.png`;
                        link.click();
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      표지 다운로드
                    </Button>
                  </div>
                ) : (
                  <div className="aspect-[3/4] bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center hover:from-purple-50 hover:to-pink-50 hover:border-purple-300 transition-all duration-300 cursor-pointer"
                       onClick={() => {
                         setAiType('cover');
                         setAiDialogOpen(true);
                       }}>
                    <div className="text-center text-gray-500 hover:text-purple-600 transition-colors duration-300">
                      <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm font-medium">표지가 없습니다</p>
                      <p className="text-xs mt-1">클릭하여 AI로 생성하기</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Work Stats */}
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-gray-800">통계</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">글자 수:</span>
                  <span className="font-medium">{work.wordCount.toLocaleString()}자</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">상태:</span>
                  <Badge className={`text-xs ${
                    work.status === 'published' ? 'bg-green-100 text-green-800' :
                    work.status === 'reviewing' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {work.status === 'published' ? '출간됨' : 
                     work.status === 'reviewing' ? '검토중' : '초안'}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">생성일:</span>
                  <span className="font-medium">
                    {new Date(work.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">수정일:</span>
                  <span className="font-medium">
                    {new Date(work.updatedAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* AI Options Dialog */}
      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {aiType === 'refine' ? 'AI 텍스트 다듬기' : 'AI 표지 생성'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {aiType === 'refine' ? (
              <>
                <div>
                  <Label>다듬을 텍스트</Label>
                  <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded border max-h-20 overflow-y-auto">
                    {selectedText ? selectedText : '선택된 텍스트가 없습니다. 전체 내용을 다듬습니다.'}
                  </p>
                  {!selectedText && work.content && (
                    <p className="text-xs text-blue-600 mt-1">
                      전체 텍스트: {work.content.length}자
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="ai-style">문체</Label>
                  <Input
                    id="ai-style"
                    value={aiOptions.style}
                    onChange={(e) => setAiOptions(prev => ({ ...prev, style: e.target.value }))}
                    placeholder="예: 격식체, 친근한 톤"
                  />
                </div>
                <div>
                  <Label htmlFor="ai-audience">대상 독자</Label>
                  <Input
                    id="ai-audience"
                    value={aiOptions.targetAudience}
                    onChange={(e) => setAiOptions(prev => ({ ...prev, targetAudience: e.target.value }))}
                    placeholder="예: 20대 여성, 청소년"
                  />
                </div>
                <div>
                  <Label htmlFor="ai-instructions">추가 지시사항</Label>
                  <Textarea
                    id="ai-instructions"
                    value={aiOptions.instructions}
                    onChange={(e) => setAiOptions(prev => ({ ...prev, instructions: e.target.value }))}
                    placeholder="특별한 요청사항이 있다면 입력하세요"
                    className="h-20"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label htmlFor="ai-mood">분위기</Label>
                  <Input
                    id="ai-mood"
                    value={aiOptions.mood}
                    onChange={(e) => setAiOptions(prev => ({ ...prev, mood: e.target.value }))}
                    placeholder="예: 신비로운, 로맨틱한, 어두운"
                  />
                </div>
                <div>
                  <Label htmlFor="ai-color">색상 테마</Label>
                  <Input
                    id="ai-color"
                    value={aiOptions.colorScheme}
                    onChange={(e) => setAiOptions(prev => ({ ...prev, colorScheme: e.target.value }))}
                    placeholder="예: 파스텔 톤, 진한 색상"
                  />
                </div>
                <div>
                  <Label htmlFor="ai-cover-style">표지 스타일</Label>
                  <Input
                    id="ai-cover-style"
                    value={aiOptions.style}
                    onChange={(e) => setAiOptions(prev => ({ ...prev, style: e.target.value }))}
                    placeholder="예: 미니멀, 일러스트, 사진"
                  />
                </div>
              </>
            )}
            
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setAiDialogOpen(false)}
                className="flex-1"
              >
                취소
              </Button>
              <Button
                onClick={aiType === 'refine' ? handleRefineText : handleGenerateCover}
                disabled={isAiProcessing}
                className={`flex-1 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
                  aiType === 'refine' 
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600' 
                    : 'bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600'
                } text-white`}
              >
                {isAiProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    처리 중...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    {aiType === 'refine' ? '텍스트 다듬기' : '표지 생성하기'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
