
import { useState } from 'react';
import { ArrowLeft, Save, Sparkles, Image, LogOut, Wand2, BookOpen, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { aiApi } from '../../lib/api';

interface AIResponse {
  success: boolean;
  message: string;
  data?: any;
  errorCode?: string;
}

interface AuthorEditorProps {
  user: any;
  onBack: () => void;
  onSaved?: () => void;
  editingWork?: any;
}

export const AuthorEditor = ({ user, onBack, onSaved, editingWork }: AuthorEditorProps) => {
  const [title, setTitle] = useState(editingWork?.title || '');
  const [content, setContent] = useState(editingWork?.content || '');
  const [genre, setGenre] = useState(editingWork?.genre || '');
  const [isPolishing, setIsPolishing] = useState(false);
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const [generatedCover, setGeneratedCover] = useState(editingWork?.coverImage || '');
  const [aiInProgress, setAiInProgress] = useState(false);
  const { toast } = useToast();

  const handleLogout = () => {
    localStorage.removeItem('walkingLibraryUser');
    window.location.reload();
  };

  const handlePolishText = async () => {
    if (!content.trim()) {
      toast({
        title: "내용을 입력해주세요",
        description: "다듬을 텍스트 내용을 먼저 작성해주세요.",
        variant: "destructive"
      });
      return;
    }

    setIsPolishing(true);
    setAiInProgress(true);
    
    try {
      const response = await aiApi.refineText({
        originalText: content,
        genre: genre || '소설',
        style: '문학적',
        targetAudience: '성인',
        instructions: '더 생동감 있고 감정적으로 표현해주세요. 문학적 표현을 살려서 작성해주세요.'
      }) as AIResponse;

      if (response.success) {
        setContent(response.data);
        toast({
          title: "AI 다듬기 완료! ✨",
          description: "작품이 더욱 세련되게 다듬어졌습니다.",
        });
      } else {
        throw new Error(response.message || 'AI 다듬기에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('AI 다듬기 오류:', error);
      toast({
        title: "AI 다듬기 실패",
        description: error.message || "AI 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
        variant: "destructive"
      });
    } finally {
      setIsPolishing(false);
      setAiInProgress(false);
    }
  };

  const handleGenerateCover = async () => {
    if (!title.trim()) {
      toast({
        title: "제목을 입력해주세요",
        description: "표지를 생성하려면 작품 제목이 필요합니다.",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingCover(true);
    setAiInProgress(true);
    
    try {
      const response = await aiApi.generateCover({
        title: title,
        author: user?.penName || user?.realName || user?.userName || '작가',
        genre: genre || '문학',
        mood: '감성적인',
        style: '현대적이고 세련된',
        colorScheme: '따뜻한 톤',
        description: content.substring(0, 200) || '창작 문학 작품'
      }) as AIResponse;

      if (response.success) {
        setGeneratedCover(response.data);
        toast({
          title: "AI 표지 생성 완료! 🎨",
          description: "작품에 어울리는 표지가 생성되었습니다.",
        });
      } else {
        throw new Error(response.message || 'AI 표지 생성에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('AI 표지 생성 오류:', error);
      toast({
        title: "AI 표지 생성 실패",
        description: error.message || "AI 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingCover(false);
      setAiInProgress(false);
    }
  };

  const handleQuickPolish = async (selectedText: string) => {
    if (!selectedText.trim()) return;
    
    setAiInProgress(true);
    try {
      const response = await aiApi.refineText({
        originalText: selectedText,
        genre: genre || '소설',
        style: '문학적',
        targetAudience: '성인',
        instructions: '선택된 부분만 더 세련되게 다듬어주세요.'
      }) as AIResponse;

      if (response.success) {
        // 선택된 텍스트를 다듬어진 텍스트로 교체
        const newContent = content.replace(selectedText, response.data);
        setContent(newContent);
        toast({
          title: "선택 부분 다듬기 완료! ✨",
          description: "선택하신 부분이 세련되게 다듬어졌습니다.",
        });
      }
    } catch (error: any) {
      toast({
        title: "AI 다듬기 실패",
        description: error.message || "잠시 후 다시 시도해주세요.",
        variant: "destructive"
      });
    } finally {
      setAiInProgress(false);
    }
  };

  const handleSave = () => {
    if (!title || !content) {
      toast({
        title: "필수 항목을 입력해주세요",
        description: "제목과 내용을 모두 작성해주세요.",
        variant: "destructive"
      });
      return;
    }

    try {
      // 기존 작품 목록 가져오기
      const existingWorks = JSON.parse(localStorage.getItem(`authorWorks_${user?.id || 'guest'}`) || '[]');
      
      const now = new Date().toISOString();
      const wordCount = content.replace(/\s/g, '').length;
      
      const workData = {
        id: editingWork?.id || `work_${Date.now()}`,
        title,
        genre: genre || '기타',
        content,
        coverImage: generatedCover,
        createdAt: editingWork?.createdAt || now,
        updatedAt: now,
        status: 'draft' as const,
        wordCount
      };

      let updatedWorks;
      if (editingWork) {
        // 기존 작품 수정
        updatedWorks = existingWorks.map((work: any) => 
          work.id === editingWork.id ? workData : work
        );
      } else {
        // 새 작품 추가
        updatedWorks = [...existingWorks, workData];
      }

      // 로컬 스토리지에 저장
      localStorage.setItem(`authorWorks_${user?.id || 'guest'}`, JSON.stringify(updatedWorks));

      toast({
        title: "작품이 저장되었습니다! 📚",
        description: `"${title}"이(가) 성공적으로 저장되었습니다.`,
      });

      // 작품 목록 페이지로 이동
      if (onSaved) {
        setTimeout(() => {
          onSaved();
        }, 1000);
      }
    } catch (error) {
      console.error('작품 저장 실패:', error);
      toast({
        title: "저장 실패",
        description: "작품 저장 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive"
      });
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
                <CardTitle className="text-2xl font-light text-gray-800">새 작품 집필</CardTitle>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">장르</label>
                  <Input
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    placeholder="예: 로맨스, 판타지, 스릴러, 문학소설..."
                    className="border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">작품 내용</label>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Wand2 className="h-3 w-3" />
                      <span>AI가 도와드릴게요!</span>
                    </div>
                  </div>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onMouseUp={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      const selectedText = target.value.substring(target.selectionStart, target.selectionEnd);
                      if (selectedText && selectedText.length > 10) {
                        // 선택된 텍스트가 있을 때 다듬기 버튼 활성화 힌트
                        target.title = "선택한 부분을 AI로 다듬으려면 'Ctrl + Enter'를 누르세요";
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.ctrlKey && e.key === 'Enter') {
                        const target = e.target as HTMLTextAreaElement;
                        const selectedText = target.value.substring(target.selectionStart, target.selectionEnd);
                        if (selectedText && selectedText.length > 10) {
                          e.preventDefault();
                          handleQuickPolish(selectedText);
                        }
                      }
                    }}
                    placeholder="당신의 이야기를 들려주세요... 
AI가 문체를 더욱 세련되게 다듬어드릴 수 있습니다.

💡 팁: 특정 부분을 선택한 후 Ctrl+Enter로 그 부분만 AI 다듬기 가능!"
                    className="min-h-96 resize-none border-gray-200 focus:border-purple-500 focus:ring-purple-500 leading-relaxed"
                  />
                </div>
                
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
                  <div className="flex items-center mb-3">
                    <Sparkles className="h-5 w-5 text-purple-600 mr-2" />
                    <span className="font-medium text-gray-800">AI 창작 도구</span>
                  </div>
                  
                  <div className="bg-white/70 p-3 rounded-lg mb-3 text-xs text-gray-600">
                    <div className="flex items-center mb-1">
                      <Wand2 className="h-3 w-3 mr-1" />
                      <span className="font-medium">빠른 부분 다듬기:</span>
                    </div>
                    <span>텍스트를 선택한 후 <kbd className="bg-gray-200 px-1 rounded text-xs">Ctrl + Enter</kbd>로 선택 부분만 AI 다듬기!</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={handlePolishText}
                      disabled={isPolishing || aiInProgress || !content.trim()}
                      className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      {isPolishing ? 'AI가 다듬는 중...' : 'AI로 전체 다듬기'}
                    </Button>
                    
                    <Button
                      onClick={handleGenerateCover}
                      disabled={isGeneratingCover || aiInProgress || !title.trim()}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg"
                    >
                      <Palette className="h-4 w-4 mr-2" />
                      {isGeneratingCover ? 'AI가 생성 중...' : 'AI 표지 생성'}
                    </Button>
                  </div>
                  
                  {aiInProgress && (
                    <div className="mt-3 text-sm text-gray-600 animate-pulse">
                      💫 AI가 열심히 작업 중입니다... 잠시만 기다려주세요!
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end">
                  <Button
                    onClick={handleSave}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    저장하기
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
                    <div className="w-full h-full relative">
                      <img 
                        src={generatedCover} 
                        alt={`${title} 표지`}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `
                              <div class="text-center text-gray-500 p-4">
                                <div class="text-4xl mb-2">🎨</div>
                                <p class="text-sm font-medium">${title || '제목'}</p>
                                <p class="text-xs text-gray-400 mt-2">AI 생성 표지</p>
                              </div>
                            `;
                          }
                        }}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                        <p className="text-white font-bold text-sm">{title || '제목'}</p>
                        <p className="text-white/80 text-xs">{user?.penName || user?.realName || '작가'}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">
                      <Image className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">AI 표지 생성을<br />클릭해보세요</p>
                      <p className="text-xs text-gray-400 mt-1">실제 AI가 제작합니다</p>
                    </div>
                  )}
                </div>
                
                {generatedCover && (
                  <div className="space-y-2 mt-4">
                    <Button
                      onClick={handleGenerateCover}
                      variant="outline"
                      className="w-full"
                      disabled={isGeneratingCover || aiInProgress}
                    >
                      <Palette className="h-4 w-4 mr-2" />
                      다른 스타일로 재생성
                    </Button>
                    
                    <div className="text-xs text-gray-500 text-center">
                      AI가 생성한 고품질 표지 이미지
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
