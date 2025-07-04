
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { BookOpen, Eye, EyeOff, ArrowLeft, Sparkles, Info } from 'lucide-react';
import { userAPI, User } from '@/services/api';

interface ReaderLoginProps {
  onLogin: (userData: any) => void;
  onBack: () => void;
}

export const ReaderLogin = ({ onLogin, onBack }: ReaderLoginProps) => {
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [errorType, setErrorType] = useState<'error' | 'success' | 'info'>('info');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isSignup) {
        if (formData.password !== formData.confirmPassword) {
          setMessage('비밀번호가 일치하지 않습니다.');
          setErrorType('error');
          setLoading(false);
          return;
        }
        
        // Create new user
        const newUser: Omit<User, 'userId'> = {
          userName: formData.name,
          email: formData.email,
          userPassword: formData.password,
          role: 'READER'
        };
        
        const createdUser = await userAPI.create(newUser);
        setMessage('가입이 완료되었습니다. 로그인해주세요.');
        setErrorType('success');
        
        setTimeout(() => {
          setIsSignup(false);
          setMessage('');
          setFormData({ name: '', email: '', password: '', confirmPassword: '' });
        }, 1500);
      } else {
        // Login using API
        setMessage('로그인 중...');
        setErrorType('info');
        
        const loginResponse = await userAPI.login(formData.email, formData.password);
        
        const user = loginResponse.user || loginResponse;
        const userData = {
          userId: user.userId,  // userId로 통일
          id: user.userId,      // 기존 호환성을 위해 id도 유지
          name: user.userName,
          email: user.email,
          coins: 100,
          isSubscribed: false,
          userType: 'reader',
          userData: user
        };
        
        setMessage('로그인 성공! 이동 중...');
        setErrorType('success');
        
        setTimeout(() => {
          onLogin(userData);
        }, 500);
      }
    } catch (error: any) {
      console.error('API Error:', error);
      setErrorType('error');
      
      // Extract error message from API response
      let errorMessage = '';
      if (error.message && error.message.includes('API Error:')) {
        try {
          const errorText = error.message.split('API Error:')[1];
          if (errorText.includes('{')) {
            const errorJson = JSON.parse(errorText.split(' - ')[1] || '{}');
            errorMessage = errorJson.error || errorJson.message;
          }
        } catch (parseError) {
          errorMessage = error.message;
        }
      } else {
        errorMessage = error.message;
      }
      
      setMessage(errorMessage || (isSignup ? '가입 중 오류가 발생했습니다.' : '로그인 중 오류가 발생했습니다.'));
    } finally {
      setLoading(false);
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
            <div className={`text-center text-sm p-4 rounded-xl border ${
              errorType === 'error' 
                ? 'text-red-700 bg-red-50 border-red-200' 
                : errorType === 'success'
                ? 'text-green-700 bg-green-50 border-green-200'
                : 'text-indigo-700 bg-indigo-50 border-indigo-200'
            }`}>
              {message}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignup && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">이름</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
            
            <div className="space-y-2 relative">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">비밀번호</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
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
              
              {/* Password Requirements Tooltip */}
              {passwordFocused && isSignup && (
                <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-white border border-indigo-200 rounded-xl shadow-lg z-10 animate-fade-in">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-indigo-500" />
                    <span className="text-sm font-medium text-gray-700">비밀번호 요구조건</span>
                  </div>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        formData.password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'
                      }`}></span>
                      최소 8자 이상
                    </li>
                    <li className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        /[a-z]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'
                      }`}></span>
                      소문자 포함
                    </li>
                    <li className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        /[A-Z]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'
                      }`}></span>
                      대문자 포함
                    </li>
                    <li className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        /\d/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'
                      }`}></span>
                      숫자 포함
                    </li>
                    <li className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        /[@$!%*?&]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'
                      }`}></span>
                      특수문자 포함 (@$%*?&)
                    </li>
                  </ul>
                </div>
              )}
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
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-3 rounded-xl transition-all duration-300 font-medium h-12 disabled:opacity-50"
            >
              {loading && (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {loading ? (isSignup ? '가입 중...' : '로그인 중...') : (isSignup ? '가입하기' : '로그인')}
            </Button>
          </form>
          
          <div className="text-center">
            <button
              onClick={() => {
                setIsSignup(!isSignup);
                setMessage('');
                setFormData({ name: '', email: '', password: '', confirmPassword: '' });
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
