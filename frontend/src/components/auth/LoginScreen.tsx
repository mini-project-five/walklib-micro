
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { BookOpen, Eye, EyeOff, Loader2 } from 'lucide-react';
import { userAPI, User } from '@/services/api';

interface LoginScreenProps {
  onLogin: (userData: any) => void;
}

export const LoginScreen = ({ onLogin }: LoginScreenProps) => {
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    
    try {
      if (isSignup) {
        if (formData.password !== formData.confirmPassword) {
          setMessage('비밀번호가 일치하지 않습니다.');
          setIsLoading(false);
          return;
        }
        
        // Create new user via API
        const userData: Omit<User, 'userId'> = {
          userName: formData.name,
          email: formData.email,
          userPassword: formData.password,
          role: 'READER'
        };
        
        await userAPI.create(userData);
        
        setMessage('가입이 완료되었습니다. 로그인해주세요.');
        setTimeout(() => {
          setIsSignup(false);
          setMessage('');
          setFormData({ ...formData, name: '', confirmPassword: '' });
        }, 1500);
      } else {
        // Login via API
        const user = await userAPI.login(formData.email, formData.password);
        
        if (user) {
          // Transform user data for component compatibility
          const userData = {
            id: user.userId,
            name: user.userName,
            email: user.email,
            role: user.role,
            status: user.status,
            coins: 100, // Default for now
            isSubscribed: false // Default for now
          };
          
          onLogin(userData);
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setMessage(error instanceof Error ? error.message : '로그인/회원가입 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 relative overflow-hidden">
      {/* Background Book Image */}
      <div 
        className="absolute inset-0 opacity-10 bg-cover bg-center"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />
      
      <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-2xl border-0 animate-fade-in">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="flex justify-center">
            <BookOpen className="h-12 w-12 text-amber-700" />
          </div>
          <h1 className="text-3xl font-light text-gray-800 tracking-wide">
            걷다가, 서재
          </h1>
          <p className="text-sm text-gray-600 font-light">
            지적인 영감을 주는 디지털 서재
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {message && (
            <div className="text-center text-sm text-amber-700 bg-amber-50 p-3 rounded-lg">
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
                  className="border-0 bg-gray-50 focus:bg-white transition-colors"
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
                className="border-0 bg-gray-50 focus:bg-white transition-colors"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">비밀번호</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="border-0 bg-gray-50 focus:bg-white transition-colors pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                  className="border-0 bg-gray-50 focus:bg-white transition-colors"
                  required
                />
              </div>
            )}
            
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white py-3 rounded-lg transition-colors font-medium"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isSignup ? '가입 중...' : '로그인 중...'}
                </>
              ) : (
                isSignup ? '가입하기' : '로그인'
              )}
            </Button>
          </form>
          
          <div className="text-center">
            <button
              onClick={() => {
                setIsSignup(!isSignup);
                setMessage('');
                setFormData({ name: '', email: '', password: '', confirmPassword: '' });
              }}
              className="text-sm text-gray-600 hover:text-amber-700 transition-colors"
            >
              {isSignup ? '이미 회원이신가요? 로그인' : '아직 회원이 아니신가요? 회원가입'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
