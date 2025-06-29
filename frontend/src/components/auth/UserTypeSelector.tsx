
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, PenTool, User, Sparkles } from 'lucide-react';

interface UserTypeSelectorProps {
  onSelectType: (type: 'reader' | 'author') => void;
}

export const UserTypeSelector = ({ onSelectType }: UserTypeSelectorProps) => {
  const [selectedType, setSelectedType] = useState<'reader' | 'author' | null>(null);

  const handleSelect = (type: 'reader' | 'author') => {
    setSelectedType(type);
    setTimeout(() => onSelectType(type), 300);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-50 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full opacity-50 blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <BookOpen className="h-16 w-16 text-indigo-600" />
              <Sparkles className="h-6 w-6 text-purple-500 absolute -top-2 -right-2 animate-pulse" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
            걷다가, 서재
          </h1>
          <p className="text-xl text-gray-600 font-light">
            어떤 방식으로 서재를 이용하시겠어요?
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Reader Card */}
          <Card 
            className={`cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl border-2 group ${
              selectedType === 'reader' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'
            }`}
            onClick={() => handleSelect('reader')}
          >
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-6 transition-transform duration-300">
                  <User className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">독자로 시작</h3>
                <p className="text-gray-600 leading-relaxed">
                  다양한 작품을 읽고 즐기며<br />
                  새로운 세계를 탐험하세요
                </p>
              </div>
              
              <div className="space-y-3 text-sm text-gray-500">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                  <span>무제한 작품 열람</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                  <span>맞춤 추천 시스템</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                  <span>독서 기록 관리</span>
                </div>
              </div>

              <Button className="w-full mt-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-3 rounded-xl transition-all duration-300">
                독자로 시작하기
              </Button>
            </CardContent>
          </Card>

          {/* Author Card */}
          <Card 
            className={`cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl border-2 group ${
              selectedType === 'author' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
            }`}
            onClick={() => handleSelect('author')}
          >
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-6 transition-transform duration-300">
                  <PenTool className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">작가로 시작</h3>
                <p className="text-gray-600 leading-relaxed">
                  당신의 이야기를 세상에 전하고<br />
                  독자들과 소통하세요
                </p>
              </div>
              
              <div className="space-y-3 text-sm text-gray-500">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>작품 출간 및 관리</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>독자 통계 분석</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>수익 창출 기회</span>
                </div>
              </div>

              <Button className="w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-medium py-3 rounded-xl transition-all duration-300">
                작가로 시작하기
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
