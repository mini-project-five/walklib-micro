
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { BookOpen, Eye, EyeOff, ArrowLeft, Sparkles } from 'lucide-react';
import { userApi } from '@/lib/api';

interface ReaderLoginProps {
  onLogin: (userData: any) => void;
  onBack: () => void;
}

export const ReaderLogin = ({ onLogin, onBack }: ReaderLoginProps) => {
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    userPassword: '',
    userName: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const userData = {
        email: formData.email,
        userPassword: formData.userPassword,
        userName: formData.userName,
        isKtCustomer: false,
        role: 'reader'
      } as const;
    
    if (isSignup) {
      if (formData.userPassword !== formData.confirmPassword) {
        setMessage('비밀번호가 일치하지 않습니다.');
        return;
      }
      
      try {
        const res = await userApi.signup(userData)
        console.log('res:', res);
      } catch (e) {
        setMessage('가입에 실패하였습니다. 이메일과 비밀번호를 확인해주세요.');
        return;
      }
      
      setMessage('가입이 완료되었습니다. 로그인해주세요.');
      setTimeout(() => {
        setIsSignup(false);
        setMessage('');
        setFormData({ ...formData, userName: '', confirmPassword: '' });
      })
    } else {
      try {
        const res = await userApi.login(userData)
        console.log('res:', res)
      } catch (e) {
        setMessage('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
        return;
      }
      onLogin(userData);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full opacity-40 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full opacity-40 blur-3xl"></div>
      </div>
      
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-xl shadow-2xl border-0 animate-fade-in relative z-10">
        <CardHeader className="text-center space-y-6 pb-8">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="absolute left-4 top-4 text-gray-500 hover:text-gray-700 p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <Sparkles className="h-5 w-5 text-purple-500 absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              독자 {isSignup ? '가입' : '로그인'}
            </h1>
            <p className="text-sm text-gray-600 font-light">
              새로운 이야기의 세계로 떠나보세요
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {message && (
            <div className="text-center text-sm text-indigo-700 bg-indigo-50 p-4 rounded-xl border border-indigo-200">
              {message}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignup && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">이름</Label>
                <Input
                  id="name"
                  value={formData.userName}
                  onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                  className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl h-12"
                  required
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">이메일</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl h-12"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">비밀번호</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.userPassword}
                  onChange={(e) => setFormData({ ...formData, userPassword: e.target.value })}
                  className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl h-12 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            
            {isSignup && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">비밀번호 확인</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl h-12"
                  required
                />
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-3 rounded-xl transition-all duration-300 font-medium h-12"
            >
              {isSignup ? '가입하기' : '로그인'}
            </Button>
          </form>
          
          <div className="text-center">
            <button
              onClick={() => {
                setIsSignup(!isSignup);
                setMessage('');
                setFormData({ userName: '', email: '', userPassword: '', confirmPassword: '' });
              }}
              className="text-sm text-gray-600 hover:text-indigo-600 transition-colors font-medium"
            >
              {isSignup ? '이미 회원이신가요? 로그인' : '아직 회원이 아니신가요? 회원가입'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
