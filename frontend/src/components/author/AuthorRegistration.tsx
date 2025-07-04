import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { authorAPI } from '../../services/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { User, FileText, Send } from 'lucide-react';

const AuthorRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    authorName: '',
    email: '',
    authorPassword: '',
    realName: '',
    introduction: '',
    portfolio: '',
    genre: '',
    experience: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      // 기본 정보 검증
      if (!formData.authorName || !formData.email || !formData.authorPassword || !formData.realName) {
        toast.error('필수 정보를 모두 입력해주세요.');
        return;
      }
      if (!formData.email.includes('@')) {
        toast.error('올바른 이메일 주소를 입력해주세요.');
        return;
      }
      if (formData.authorPassword.length < 6) {
        toast.error('비밀번호는 6자 이상이어야 합니다.');
        return;
      }
    }
    setCurrentStep(prev => prev + 1);
  };

  const handlePreviousStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!formData.introduction || !formData.portfolio || !formData.genre) {
      toast.error('모든 정보를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const authorData = {
        authorName: formData.authorName,
        email: formData.email,
        authorPassword: formData.authorPassword,
        realName: formData.realName,
        introduction: `${formData.introduction}\n\n[장르] ${formData.genre}\n[경험] ${formData.experience}\n\n[포트폴리오]\n${formData.portfolio}`
      };

      await authorAPI.register(authorData);
      toast.success('작가 등록 신청이 완료되었습니다! 관리자 승인을 기다려주세요.');
      navigate('/');
    } catch (error) {
      console.error('작가 등록 실패:', error);
      toast.error('작가 등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <User className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-medium">기본 정보</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="authorName">필명 *</Label>
          <Input
            id="authorName"
            name="authorName"
            type="text"
            value={formData.authorName}
            onChange={handleInputChange}
            placeholder="작가로 활동할 필명을 입력하세요"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="realName">실명 *</Label>
          <Input
            id="realName"
            name="realName"
            type="text"
            value={formData.realName}
            onChange={handleInputChange}
            placeholder="본명을 입력하세요"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="email">이메일 *</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="연락 가능한 이메일을 입력하세요"
          required
        />
      </div>

      <div>
        <Label htmlFor="authorPassword">비밀번호 *</Label>
        <Input
          id="authorPassword"
          name="authorPassword"
          type="password"
          value={formData.authorPassword}
          onChange={handleInputChange}
          placeholder="6자 이상의 비밀번호를 입력하세요"
          required
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-medium">작가 정보</h3>
      </div>

      <div>
        <Label htmlFor="introduction">자기소개 *</Label>
        <Textarea
          id="introduction"
          name="introduction"
          value={formData.introduction}
          onChange={handleInputChange}
          placeholder="자신을 소개하는 글을 작성해주세요 (200자 이상 권장)"
          rows={4}
          required
        />
        <p className="text-sm text-gray-500 mt-1">
          현재 {formData.introduction.length}자
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="genre">주요 장르 *</Label>
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
            <option value="에세이">에세이</option>
            <option value="기타">기타</option>
          </select>
        </div>

        <div>
          <Label htmlFor="experience">작가 경험</Label>
          <select
            id="experience"
            name="experience"
            value={formData.experience}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">경험을 선택하세요</option>
            <option value="신인 작가">신인 작가</option>
            <option value="1년 미만">1년 미만</option>
            <option value="1-3년">1-3년</option>
            <option value="3-5년">3-5년</option>
            <option value="5년 이상">5년 이상</option>
          </select>
        </div>
      </div>

      <div>
        <Label htmlFor="portfolio">포트폴리오 *</Label>
        <Textarea
          id="portfolio"
          name="portfolio"
          value={formData.portfolio}
          onChange={handleInputChange}
          placeholder="기존 작품이나 글쓰기 경험을 소개해주세요. 발표된 작품이 있다면 제목과 플랫폼을 명시해주세요."
          rows={6}
          required
        />
        <p className="text-sm text-gray-500 mt-1">
          기존 작품, 수상 경력, 관련 활동 등을 자유롭게 작성해주세요.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              작가 등록 신청
            </CardTitle>
            <div className="flex justify-center mt-4">
              <div className="flex items-center space-x-4">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300'
                }`}>
                  1
                </div>
                <div className={`w-16 h-1 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300'
                }`}>
                  2
                </div>
              </div>
            </div>
            <p className="text-center text-sm text-gray-600 mt-2">
              {currentStep === 1 ? '기본 정보 입력' : '작가 정보 및 포트폴리오'}
            </p>
          </CardHeader>
          
          <CardContent>
            {currentStep === 1 ? renderStep1() : renderStep2()}
            
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                disabled={isSubmitting}
              >
                취소
              </Button>
              
              <div className="flex gap-2">
                {currentStep > 1 && (
                  <Button
                    variant="outline"
                    onClick={handlePreviousStep}
                    disabled={isSubmitting}
                  >
                    이전
                  </Button>
                )}
                
                {currentStep < 2 ? (
                  <Button onClick={handleNextStep} disabled={isSubmitting}>
                    다음
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting}
                    className="flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {isSubmitting ? '신청 중...' : '등록 신청'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">안내사항</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 작가 등록 신청 후 관리자 승인이 필요합니다.</li>
            <li>• 승인까지 1-3일 정도 소요될 수 있습니다.</li>
            <li>• 승인 완료 시 이메일로 안내해드립니다.</li>
            <li>• 승인 후 작가 전용 기능을 이용할 수 있습니다.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AuthorRegistration;
