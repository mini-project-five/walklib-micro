
import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Sparkles, Image, LogOut, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { manuscriptAPI, aiAPI, Manuscript } from '@/services/api';

interface AuthorEditorProps {
  user: any;
  onBack: () => void;
  onManuscriptSaved?: () => void; // 원고 저장/출간 후 호출될 콜백
}

export const AuthorEditor = ({ user, onBack, onManuscriptSaved }: AuthorEditorProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPolishing, setIsPolishing] = useState(false);
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const [generatedCover, setGeneratedCover] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [lastSavedManuscriptId, setLastSavedManuscriptId] = useState<number | null>(null);
  const [editingManuscript, setEditingManuscript] = useState<Manuscript | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // AI 요구사항 입력용 상태
  const [polishStyle, setPolishStyle] = useState('');
  const [showPolishInput, setShowPolishInput] = useState(false);
  const [coverDescription, setCoverDescription] = useState('');
  const [showCoverInput, setShowCoverInput] = useState(false);
  
  const { toast } = useToast();

  // 편집 모드 확인 및 데이터 로드
  useEffect(() => {
    const editingData = localStorage.getItem('editingManuscript');
    if (editingData) {
      try {
        const manuscript = JSON.parse(editingData);
        setEditingManuscript(manuscript);
        setIsEditMode(true);
        setTitle(manuscript.title || '');
        setContent(manuscript.content || '');
        setGeneratedCover(manuscript.coverImage || '');
        setLastSavedManuscriptId(manuscript.manuscriptId || null);
        
        // 편집 데이터 제거
        localStorage.removeItem('editingManuscript');
      } catch (error) {
        console.error('편집 데이터 파싱 오류:', error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('walkingLibraryUser');
    window.location.reload();
  };

  const handlePolishText = async () => {
    if (!title && !content) {
      toast({
        title: "내용을 입력해주세요",
        description: "제목이나 내용을 먼저 작성해주세요.",
        variant: "destructive"
      });
      return;
    }

    if (!showPolishInput) {
      setShowPolishInput(true);
      return;
    }

    setIsPolishing(true);
    
    try {
      const contentToPolish = content || title;
      const response = await aiAPI.polishText(contentToPolish, polishStyle || undefined);
      
      if (response.success) {
        // AI가 다듬은 텍스트를 content에 적용
        setContent(response.data || content);
        
        toast({
          title: "AI 다듬기 완료!",
          description: "작품이 더욱 세련되게 다듬어졌습니다.",
        });

        // 입력창 숨기고 요구사항 초기화
        setShowPolishInput(false);
        setPolishStyle('');
      } else {
        throw new Error('AI 다듬기 실패');
      }
    } catch (error) {
      console.error('Polish text error:', error);
      toast({
        title: "AI 다듬기 실패",
        description: "다시 시도해주세요.",
        variant: "destructive"
      });
    } finally {
      setIsPolishing(false);
    }
  };

  const handleGenerateCover = async () => {
    if (!title) {
      toast({
        title: "제목을 입력해주세요",
        description: "표지를 생성하려면 작품 제목이 필요합니다.",
        variant: "destructive"
      });
      return;
    }

    if (!showCoverInput) {
      setShowCoverInput(true);
      return;
    }

    setIsGeneratingCover(true);
    
    try {
      const response = await aiAPI.generateCover(title, 'novel', coverDescription || undefined);
      
      if (response.success) {
        // Use the generated cover data (image URL)
        setGeneratedCover(response.data || '📚');
        
        toast({
          title: "AI 표지 생성 완료!",
          description: "작품에 어울리는 표지가 생성되었습니다.",
        });

        // 입력창 숨기고 요구사항 초기화
        setShowCoverInput(false);
        setCoverDescription('');
      } else {
        throw new Error('AI 표지 생성 실패');
      }
    } catch (error) {
      console.error('Generate cover error:', error);
      toast({
        title: "AI 표지 생성 실패",
        description: "다시 시도해주세요.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingCover(false);
    }
  };

  const handleSave = async () => {
    if (!title || !content) {
      toast({
        title: "필수 항목을 입력해주세요",
        description: "제목과 내용을 모두 작성해주세요.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);

    try {
      if (isEditMode && lastSavedManuscriptId) {
        // 기존 원고 수정
        const updatedManuscript = await manuscriptAPI.update(lastSavedManuscriptId, {
          title,
          content,
          coverImage: generatedCover,
          status: 'DRAFT'
        });

        toast({
          title: "작품이 수정되었습니다!",
          description: "변경사항이 저장되었습니다.",
        });
      } else {
        // 새 원고 생성
        const manuscriptData: Manuscript = {
          authorId: user.authorData?.authorId || user.id,
          title,
          content,
          status: 'DRAFT',
          coverImage: generatedCover
        };

        const savedManuscript = await manuscriptAPI.create(manuscriptData);
        setLastSavedManuscriptId(savedManuscript.manuscriptId || null);

        toast({
          title: "작품이 저장되었습니다!",
          description: "작가 센터에서 확인할 수 있습니다.",
        });
      }

      // 목록 갱신을 위한 콜백 호출
      onManuscriptSaved?.();
      
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "저장 실패",
        description: "작품 저장 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    // 저장되지 않은 상태라면 먼저 저장
    if (!lastSavedManuscriptId) {
      await handleSave();
      if (!lastSavedManuscriptId) return; // 저장 실패시 중단
    }

    setIsPublishing(true);

    try {
      const publishedBook = await manuscriptAPI.publish(lastSavedManuscriptId);

      toast({
        title: "작품이 출간되었습니다! 🎉",
        description: "독자들이 작품을 읽을 수 있습니다.",
      });

      // 폼 초기화
      setTitle('');
      setContent('');
      setGeneratedCover('');
      setLastSavedManuscriptId(null);

      // 목록 갱신을 위한 콜백 호출
      onManuscriptSaved?.();
      
    } catch (error) {
      console.error('Publish error:', error);
      toast({
        title: "출간 실패",
        description: "작품 출간 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSaveAndPublish = async () => {
    if (!title || !content) {
      toast({
        title: "필수 항목을 입력해주세요",
        description: "제목과 내용을 모두 작성해주세요.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    setIsPublishing(true);

    try {
      // 1. 먼저 저장
      const manuscriptData: Manuscript = {
        authorId: user.authorData?.authorId || user.id,
        title,
        content,
        status: 'DRAFT',
        coverImage: generatedCover
      };

      const savedManuscript = await manuscriptAPI.create(manuscriptData);
      
      // 2. 바로 출간
      const publishedBook = await manuscriptAPI.publish(savedManuscript.manuscriptId!);

      toast({
        title: "작품이 저장되고 출간되었습니다! 🎉",
        description: "독자들이 작품을 읽을 수 있습니다.",
      });

      // 폼 초기화
      setTitle('');
      setContent('');
      setGeneratedCover('');
      setLastSavedManuscriptId(null);

      // 목록 갱신을 위한 콜백 호출
      onManuscriptSaved?.();
      
    } catch (error) {
      console.error('Save and Publish error:', error);
      toast({
        title: "저장/출간 실패",
        description: "작품 저장 또는 출간 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
      setIsPublishing(false);
    }
  };

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Editor */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
              <CardHeader>
                <CardTitle className="text-2xl font-light text-gray-800">
                  {isEditMode ? '작품 편집' : '새 작품 집필'}
                </CardTitle>
                {isEditMode && editingManuscript && (
                  <p className="text-sm text-gray-600">"{editingManuscript.title}" 편집 중</p>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">작품 제목</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="작품의 제목을 입력하세요..."
                    className="text-lg font-medium border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">작품 내용</label>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="당신의 이야기를 들려주세요..."
                    className="min-h-96 resize-none border-gray-200 focus:border-purple-500 focus:ring-purple-500 leading-relaxed"
                  />
                </div>
                
                {/* AI 다듬기 요구사항 입력 */}
                {showPolishInput && (
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <label className="block text-sm font-medium text-purple-700 mb-2">
                      다듬기 스타일 (선택사항)
                    </label>
                    <Textarea
                      value={polishStyle}
                      onChange={(e) => setPolishStyle(e.target.value)}
                      placeholder="어떤 스타일로 다듬고 싶으신가요? (예: 더 감성적으로, 더 간결하게, 더 격식있게)"
                      className="mb-3 h-20 border-purple-200 focus:border-purple-500"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handlePolishText}
                        disabled={isPolishing}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        {isPolishing ? 'AI가 다듬는 중...' : '다듬기 시작'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowPolishInput(false);
                          setPolishStyle('');
                        }}
                      >
                        취소
                      </Button>
                    </div>
                  </div>
                )}

                {/* AI 표지 생성 요구사항 입력 */}
                {showCoverInput && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <label className="block text-sm font-medium text-blue-700 mb-2">
                      표지 스타일 설명 (선택사항)
                    </label>
                    <Textarea
                      value={coverDescription}
                      onChange={(e) => setCoverDescription(e.target.value)}
                      placeholder="어떤 느낌의 표지를 원하시나요? (예: 판타지 풍경, 로맨틱한 분위기, 미스터리한 느낌)"
                      className="mb-3 h-20 border-blue-200 focus:border-blue-500"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleGenerateCover}
                        disabled={isGeneratingCover}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {isGeneratingCover ? 'AI가 생성 중...' : '표지 생성'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowCoverInput(false);
                          setCoverDescription('');
                        }}
                      >
                        취소
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-4">
                  <Button
                    onClick={handlePolishText}
                    disabled={isPolishing}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {isPolishing ? 'AI가 다듬는 중...' : showPolishInput ? 'AI로 다듬기' : 'AI로 다듬기'}
                  </Button>
                  
                  <Button
                    onClick={handleGenerateCover}
                    disabled={isGeneratingCover}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                  >
                    <Image className="h-4 w-4 mr-2" />
                    {isGeneratingCover ? 'AI가 생성 중...' : showCoverInput ? 'AI 표지 생성' : 'AI 표지 생성'}
                  </Button>
                  
                  <Button
                    onClick={handleSave}
                    disabled={isSaving || isPublishing}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white disabled:opacity-50"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? '저장 중...' : (isEditMode ? '수정 저장' : '임시 저장')}
                  </Button>

                  {lastSavedManuscriptId && (
                    <Button
                      onClick={handlePublish}
                      disabled={isPublishing || isSaving}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white disabled:opacity-50"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      {isPublishing ? '출간 중...' : '출간하기'}
                    </Button>
                  )}

                  <Button
                    onClick={handleSaveAndPublish}
                    disabled={isSaving || isPublishing}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white disabled:opacity-50"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    {(isSaving || isPublishing) ? '처리 중...' : '저장 후 출간'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cover Preview */}
          <div className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-gray-800">표지 미리보기</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden">
                  {generatedCover ? (
                    // URL인지 확인하여 이미지 또는 이모지 표시
                    generatedCover.startsWith('http') ? (
                      <div className="w-full h-full relative">
                        <img 
                          src={generatedCover} 
                          alt="AI 생성 표지"
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            // 이미지 로딩 실패시 대체 이모지 표시
                            e.currentTarget.style.display = 'none';
                            const fallbackElement = e.currentTarget.nextElementSibling as HTMLElement;
                            if (fallbackElement) {
                              fallbackElement.style.display = 'block';
                            }
                          }}
                        />
                        <div 
                          className="w-full h-full flex flex-col items-center justify-center text-center"
                          style={{ display: 'none' }}
                        >
                          <div className="text-6xl mb-4">📚</div>
                          <p className="text-sm text-gray-600 font-medium px-2">{title || '제목'}</p>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-center">
                          <p className="text-sm font-medium truncate">{title || '제목'}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="text-6xl mb-4">{generatedCover}</div>
                        <p className="text-sm text-gray-600 font-medium">{title || '제목'}</p>
                      </div>
                    )
                  ) : (
                    <div className="text-center text-gray-500">
                      <Image className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">AI 표지 생성을<br />클릭해보세요</p>
                    </div>
                  )}
                </div>
                
                {generatedCover && (
                  <Button
                    onClick={handleGenerateCover}
                    variant="outline"
                    className="w-full mt-4"
                    disabled={isGeneratingCover}
                  >
                    다른 스타일로 재생성
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
