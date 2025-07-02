
import { useState } from 'react';
import { ArrowLeft, Save, Sparkles, Image, LogOut, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { manuscriptAPI, aiAPI, bookAPI, Manuscript } from '@/services/api';

interface AuthorEditorProps {
  user: any;
  onBack: () => void;
  editingManuscript?: Manuscript;
}

export const AuthorEditor = ({ user, onBack, editingManuscript }: AuthorEditorProps) => {
  const [title, setTitle] = useState(editingManuscript?.title || '');
  const [content, setContent] = useState(editingManuscript?.content || '');
  const [isPolishing, setIsPolishing] = useState(false);
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const [generatedCover, setGeneratedCover] = useState(editingManuscript?.coverImageUrl || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [currentManuscriptId, setCurrentManuscriptId] = useState(editingManuscript?.manuscriptId);
  const { toast } = useToast();

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

    setIsPolishing(true);
    
    try {
      const response = await aiAPI.polishText(title, content);
      
      setTitle(response.polishedTitle || title);
      setContent(response.polishedContent || content);
      
      toast({
        title: "AI 다듬기 완료!",
        description: "작품이 더욱 세련되게 다듬어졌습니다.",
      });
    } catch (error) {
      toast({
        title: "AI 다듬기 실패",
        description: error instanceof Error ? error.message : "다시 시도해주세요.",
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

    setIsGeneratingCover(true);
    
    try {
      const response = await aiAPI.generateCover(title);
      
      // Use actual image URL if available, fallback to emoji
      setGeneratedCover(response.coverImageUrl || response.coverEmoji || '📚');
      
      toast({
        title: "AI 표지 생성 완료!",
        description: "작품에 어울리는 표지가 생성되었습니다.",
      });
    } catch (error) {
      toast({
        title: "AI 표지 생성 실패",
        description: error instanceof Error ? error.message : "다시 시도해주세요.",
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

    const authorId = user.authorData?.authorId || user.id;
    
    if (!authorId) {
      toast({
        title: "사용자 정보 오류",
        description: "사용자 ID를 찾을 수 없습니다. 다시 로그인해주세요.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);

    try {
      if (editingManuscript?.manuscriptId) {
        // 편집 모드: 기존 manuscript 업데이트
        const updatedData = {
          title,
          content,
          coverImageUrl: generatedCover || undefined
        };
        
        await manuscriptAPI.update(editingManuscript.manuscriptId, updatedData);
        
        toast({
          title: "작품이 수정되었습니다!",
          description: "작가 센터에서 새로고침 버튼을 눌러 확인해보세요.",
        });
      } else {
        // 새 작성 모드
        const manuscriptData: Omit<Manuscript, 'manuscriptId'> = {
          authorId: Number(authorId),
          title,
          content,
          status: 'DRAFT',
          coverImageUrl: generatedCover || undefined
        };
        
        const savedManuscript = await manuscriptAPI.create(manuscriptData);
        
        // 저장된 manuscript의 ID를 저장
        if (savedManuscript.manuscriptId) {
          setCurrentManuscriptId(savedManuscript.manuscriptId);
        }
        
        toast({
          title: "작품이 저장되었습니다!",
          description: "작가 센터에서 새로고침 버튼을 눌러 확인해보세요.",
        });
      }

      // Keep form content after saving (don't clear)
      
    } catch (error) {
      toast({
        title: "저장 실패",
        description: error instanceof Error ? error.message : "작품 저장 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!title || !content) {
      toast({
        title: "필수 항목을 입력해주세요",
        description: "제목과 내용을 모두 작성해주세요.",
        variant: "destructive"
      });
      return;
    }

    // 먼저 저장이 필요한 경우 저장
    let manuscriptIdToPublish = currentManuscriptId || editingManuscript?.manuscriptId;
    
    if (!manuscriptIdToPublish) {
      toast({
        title: "먼저 저장해주세요",
        description: "발행하기 전에 작품을 저장해야 합니다.",
        variant: "destructive"
      });
      return;
    }

    setIsPublishing(true);

    try {
      // 1. Manuscript 상태를 PENDING_PUBLICATION으로 업데이트
      await manuscriptAPI.requestPublication(manuscriptIdToPublish);
      
      // 2. Book 생성을 위한 데이터 준비
      const bookData = {
        authorId: user.authorData?.authorId || user.id,
        title,
        description: content.substring(0, 200) + '...', // 내용의 일부를 설명으로
        content,
        coverImageUrl: generatedCover || undefined,
        category: 'GENERAL',
        price: 10, // 기본 가격
        viewCount: 0,
        publishedDate: new Date().toISOString()
      };
      
      // 3. Book 생성
      await bookAPI.create(bookData);
      
      toast({
        title: "작품이 발행되었습니다!",
        description: "독자들이 이제 작품을 읽을 수 있습니다.",
      });
      
      // 발행 후 작가 센터로 돌아가기
      setTimeout(() => {
        onBack();
      }, 1500);
      
    } catch (error) {
      toast({
        title: "발행 실패",
        description: error instanceof Error ? error.message : "작품 발행 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
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
                  {editingManuscript ? '작품 편집' : '새 작품 집필'}
                </CardTitle>
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
                
                <div className="flex flex-wrap gap-4">
                  <Button
                    onClick={handlePolishText}
                    disabled={isPolishing}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {isPolishing ? 'AI가 다듬는 중...' : 'AI로 다듬기'}
                  </Button>
                  
                  <Button
                    onClick={handleGenerateCover}
                    disabled={isGeneratingCover}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                  >
                    <Image className="h-4 w-4 mr-2" />
                    {isGeneratingCover ? 'AI가 생성 중...' : 'AI 표지 생성'}
                  </Button>
                  
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white disabled:opacity-50"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? '저장 중...' : '저장하기'}
                  </Button>
                  
                  <Button
                    onClick={handlePublish}
                    disabled={isPublishing || isSaving}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white disabled:opacity-50"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isPublishing ? '발행 중...' : '발행하기'}
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
                    <div className="text-center w-full h-full relative">
                      {generatedCover.startsWith('http') ? (
                        <>
                          <img 
                            src={generatedCover} 
                            alt="AI 생성 표지" 
                            className="w-full h-full object-cover rounded-xl"
                            onError={(e) => {
                              // Fallback to emoji if image fails to load
                              const target = e.target as HTMLElement;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'block';
                            }}
                          />
                          <div className="hidden text-6xl mb-4">📚</div>
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
                            <p className="text-sm font-medium truncate">{title || '제목'}</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-6xl mb-4">{generatedCover}</div>
                          <p className="text-sm text-gray-600 font-medium">{title || '제목'}</p>
                        </>
                      )}
                    </div>
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
