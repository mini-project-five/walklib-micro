
import { useState } from 'react';
import { ArrowLeft, Save, Sparkles, Image, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface AuthorEditorProps {
  user: any;
  onBack: () => void;
}

export const AuthorEditor = ({ user, onBack }: AuthorEditorProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPolishing, setIsPolishing] = useState(false);
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const [generatedCover, setGeneratedCover] = useState<string>('');
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
      const OPENAI_API_KEY = import.meta.env.VITE_CHAT_API_KEY;
      const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions';

      const prompt = `다음 글과 같은 언어로 작가의 고유한 문체로 통일하고 오탈자를 수정하여 매끄럽게 다듬어 주세요: ${content}`;

      const response = await fetch(OPENAI_CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'user', content: prompt }
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API 오류: ${response.statusText}`);
      }

      const data = await response.json();
      const polishedText = data.choices?.[0]?.message?.content;

      if (polishedText) {
        setContent(polishedText);
        toast({
          title: "AI 다듬기 완료!",
          description: "작품이 더욱 세련되게 다듬어졌습니다.",
        });
      } else {
        throw new Error('다듬기 결과를 받지 못했습니다.');
      }
    } catch (error) {
      toast({
        title: "AI 다듬기 실패",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsPolishing(false);
    }
  };

  const handleGenerateCover = async () => {
    console.log('API Key:', import.meta.env.VITE_CHAT_API_KEY);

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
      const OPENAI_API_KEY = import.meta.env.VITE_CHAT_API_KEY;
      const OPENAI_IMAGE_URL = 'https://api.openai.com/v1/images/generations';

      const prompt = `Create a professional book cover design for:
Title: ${title}
Description: ${content}
The cover should be modern, eye-catching, and suitable for publication.`;

      const response = await fetch(OPENAI_IMAGE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: prompt,
          n: 1,
          size: '1024x1024',
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API 오류: ${response.statusText}`);
      }

      const data = await response.json();
      const imageUrl = data.data?.[0]?.url;

      if (imageUrl) {
        setGeneratedCover(imageUrl);
        toast({
          title: "AI 표지 생성 완료!",
          description: "작품에 어울리는 표지가 생성되었습니다.",
        });
      } else {
        throw new Error('이미지 생성에 실패했습니다.');
      }
    } catch (error) {
      toast({
        title: "AI 표지 생성 실패",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsGeneratingCover(false);
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

    toast({
      title: "작품이 저장되었습니다!",
      description: "작가 센터에서 확인할 수 있습니다.",
    });
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
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
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
                <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                  {generatedCover ? (
                    <img
                      src={generatedCover}
                      alt={title || 'AI 생성 표지'}
                      className="max-h-[400px] max-w-full object-contain rounded-xl mx-auto"
                    />
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
