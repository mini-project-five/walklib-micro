import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { bookAPI } from '../../services/api';
import { toast } from 'sonner';
import { BookOpen, Save, Send, Sparkles } from 'lucide-react';

interface WriteBookProps {
  authorId: number;
  onSuccess?: () => void;
}

const WriteBook: React.FC<WriteBookProps> = ({ authorId, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    category: 'NOVEL' as 'NOVEL' | 'ESSAY' | 'SERIES' | 'POETRY' | 'ETC',
    genre: '',
    content: '',
    summary: '',
    coverImage: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveDraft = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('제목과 내용을 입력해주세요.');
      return;
    }

    setIsSaving(true);
    try {
      const bookData = {
        title: formData.title,
        content: formData.content,
        authorId,
        status: 'DRAFT',
        category: formData.category,
        genre: formData.genre || undefined,
        summary: formData.summary || undefined,
        coverImage: formData.coverImage || undefined
      };

      await bookAPI.create(bookData);
      toast.success('초안이 저장되었습니다.');
      onSuccess?.();
    } catch (error) {
      console.error('초안 저장 실패:', error);
      toast.error('초안 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!formData.title.trim() || !formData.content.trim() || !formData.category || !formData.genre) {
      toast.error('필수 정보를 모두 입력해주세요.');
      return;
    }

    if (formData.content.length < 500) {
      toast.error('출간하려면 최소 500자 이상의 내용이 필요합니다.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. 도서 생성
      const bookData = {
        title: formData.title,
        content: formData.content,
        authorId,
        status: 'DRAFT',
        category: formData.category,
        genre: formData.genre,
        summary: formData.summary || `${formData.genre} 장르의 ${formData.title}`,
        coverImage: formData.coverImage || undefined
      };

      const createdBook = await bookAPI.create(bookData);
      
      // 2. 즉시 출간
      if (createdBook.bookId) {
        await bookAPI.publish(createdBook.bookId);
        toast.success('작품이 성공적으로 출간되었습니다!');
        onSuccess?.();
      }
    } catch (error) {
      console.error('출간 실패:', error);
      toast.error('출간 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex justify-center mb-6">
      <div className="flex items-center space-x-4">
        {[1, 2, 3].map((step) => (
          <React.Fragment key={step}>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              {step}
            </div>
            {step < 3 && (
              <div className={`w-16 h-1 ${currentStep > step ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium">작품 기본 정보</h3>
        <p className="text-sm text-gray-600">작품의 제목과 유형을 설정해주세요</p>
      </div>

      <div>
        <Label htmlFor="title">작품 제목 *</Label>
        <Input
          id="title"
          name="title"
          type="text"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="독자들의 마음을 사로잡을 제목을 입력하세요"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">작품 유형 *</Label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="NOVEL">소설</option>
            <option value="ESSAY">에세이</option>
            <option value="SERIES">연재 시리즈</option>
            <option value="POETRY">시</option>
            <option value="ETC">기타</option>
          </select>
        </div>

        <div>
          <Label htmlFor="genre">장르 *</Label>
          <select
            id="genre"
            name="genre"
            value={formData.genre}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">장르를 선택하세요</option>
            <option value="로맨스">로맨스</option>
            <option value="판타지">판타지</option>
            <option value="미스터리">미스터리</option>
            <option value="스릴러">스릴러</option>
            <option value="일상">일상</option>
            <option value="힐링">힐링</option>
            <option value="SF">SF</option>
            <option value="역사">역사</option>
            <option value="호러">호러</option>
            <option value="코미디">코미디</option>
          </select>
        </div>
      </div>

      <div>
        <Label htmlFor="summary">작품 소개</Label>
        <Textarea
          id="summary"
          name="summary"
          value={formData.summary}
          onChange={handleInputChange}
          placeholder="작품의 내용을 간단히 소개해주세요 (선택사항)"
          rows={3}
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium">작품 내용 작성</h3>
        <p className="text-sm text-gray-600">독자들에게 선보일 작품을 작성해주세요</p>
      </div>

      <div>
        <Label htmlFor="content">작품 내용 *</Label>
        <Textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleInputChange}
          placeholder="여기에 작품의 내용을 작성해주세요..."
          rows={15}
          className="min-h-[400px]"
          required
        />
        <div className="flex justify-between mt-2">
          <p className="text-sm text-gray-500">
            현재 {formData.content.length}자 {formData.content.length >= 500 ? '✅' : '(출간 최소 500자)'}
          </p>
          <div className="flex space-x-2">
            <Badge variant={formData.content.length >= 500 ? "default" : "secondary"}>
              {formData.content.length >= 500 ? '출간 가능' : '출간 준비 중'}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium">출간 준비</h3>
        <p className="text-sm text-gray-600">작품을 검토하고 출간해주세요</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            작품 미리보기
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-600">제목</Label>
            <p className="text-lg font-medium">{formData.title}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-600">유형</Label>
              <p>{formData.category}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">장르</Label>
              <p>{formData.genre}</p>
            </div>
          </div>

          {formData.summary && (
            <div>
              <Label className="text-sm font-medium text-gray-600">작품 소개</Label>
              <p className="text-sm text-gray-700">{formData.summary}</p>
            </div>
          )}

          <div>
            <Label className="text-sm font-medium text-gray-600">내용 미리보기</Label>
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded max-h-32 overflow-y-auto">
              {formData.content.substring(0, 200)}
              {formData.content.length > 200 && '...'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              총 {formData.content.length}자
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">출간 안내</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 출간된 작품은 즉시 독자들에게 공개됩니다.</li>
          <li>• 조회수가 5회 이상이면 베스트셀러로 자동 등록됩니다.</li>
          <li>• 독자들은 1,000포인트를 사용하여 작품을 열람할 수 있습니다.</li>
          <li>• 출간 후에도 작품 수정이 가능합니다.</li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <Sparkles className="h-6 w-6 text-yellow-500" />
            새 작품 작성
          </CardTitle>
          {renderStepIndicator()}
        </CardHeader>
        
        <CardContent>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          
          <div className="flex justify-between mt-8">
            <div className="flex space-x-2">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  disabled={isSubmitting || isSaving}
                >
                  이전
                </Button>
              )}
            </div>
            
            <div className="flex space-x-2">
              {/* 초안 저장 버튼 (1, 2단계에서만) */}
              {currentStep < 3 && (
                <Button
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={isSubmitting || isSaving || !formData.title.trim() || !formData.content.trim()}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? '저장 중...' : '초안 저장'}
                </Button>
              )}
              
              {currentStep < 3 ? (
                <Button 
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  disabled={
                    isSubmitting || isSaving || 
                    (currentStep === 1 && (!formData.title || !formData.category || !formData.genre)) ||
                    (currentStep === 2 && !formData.content.trim())
                  }
                >
                  다음
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={handleSaveDraft}
                    disabled={isSubmitting || isSaving}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isSaving ? '저장 중...' : '초안으로 저장'}
                  </Button>
                  <Button 
                    onClick={handlePublish}
                    disabled={isSubmitting || isSaving || formData.content.length < 500}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <Send className="h-4 w-4" />
                    {isSubmitting ? '출간 중...' : '출간하기'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WriteBook;
