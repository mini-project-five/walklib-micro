
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { PenTool, Eye, EyeOff, ArrowLeft, Sparkles } from 'lucide-react';
import { authorAPI, Author } from '@/services/api';

interface AuthorLoginProps {
  onLogin: (userData: any) => void;
  onBack: () => void;
}

export const AuthorLogin = ({ onLogin, onBack }: AuthorLoginProps) => {
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    penName: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isSignup) {
        if (formData.password !== formData.confirmPassword) {
          setMessage('비밀번호가 일치하지 않습니다.');
          setLoading(false);
          return;
        }
        
        // Create new author
        const newAuthor: Author = {
          authorName: formData.penName,
          email: formData.email,
          introduction: `안녕하세요, ${formData.penName}입니다.`,
          authorPassword: formData.password,
          realName: formData.name,
        };
        
        const createdAuthor = await authorAPI.create(newAuthor);
        setMessage('작가 가입이 완료되었습니다. 로그인해주세요.');
        
        setTimeout(() => {
          setIsSignup(false);
          setMessage('');
          setFormData({ name: '', email: '', password: '', confirmPassword: '', penName: '' });
        }, 1500);
      } else {
        // Login - find author by email
        try {
          const authors = await authorAPI.getAll();
          
          // Find approved author first, then pending, then rejected
          const matchingAuthors = authors.filter(a => a.email === formData.email);
          const author = matchingAuthors.find(a => a.authorRegisterStatus === 'APPROVED') ||
                         matchingAuthors.find(a => a.authorRegisterStatus === 'PENDING') ||
                         matchingAuthors[0];
          
          if (!author) {
            setMessage('등록되지 않은 이메일입니다.');
            setLoading(false);
            return;
          }
          
          if (author.authorRegisterStatus === 'PENDING') {
            setMessage('아직 승인 대기 중입니다. 잠시 후 다시 시도해주세요.');
            setLoading(false);
            return;
          }
          
          if (author.authorRegisterStatus === 'REJECTED') {
            setMessage('승인이 거절되었습니다. 관리자에게 문의하세요.');
            setLoading(false);
            return;
          }
          
          const userData = {
            id: author.authorId,
            name: author.realName,
            penName: author.authorName,
            email: author.email,
            userType: 'author',
            authorData: author,
            works: [],
            totalViews: 0
          };
          
          onLogin(userData);
        } catch (loginError) {
          setMessage('로그인 중 오류가 발생했습니다.');
        }
      }
    } catch (error) {
      console.error('API Error:', error);
      setMessage(isSignup ? '가입 중 오류가 발생했습니다.' : '로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-white to-pink-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-40 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full opacity-40 blur-3xl"></div>
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
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
                <PenTool className="h-8 w-8 text-white" />
              </div>
              <Sparkles className="h-5 w-5 text-pink-500 absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              작가 {isSignup ? '가입' : '로그인'}
            </h1>
            <p className="text-sm text-gray-600 font-light">
              당신의 이야기를 세상에 전하세요
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {message && (
            <div className="text-center text-sm text-purple-700 bg-purple-50 p-4 rounded-xl border border-purple-200">
              {message}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignup && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">실명</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl h-12"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="penName" className="text-sm font-medium text-gray-700">필명</Label>
                  <Input
                    id="penName"
                    value={formData.penName}
                    onChange={(e) => setFormData({ ...formData, penName: e.target.value })}
                    className="border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl h-12"
                    placeholder="독자들에게 보여질 이름"
                    required
                  />
                </div>
              </>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">이메일</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl h-12"
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
                  className="border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl h-12 pr-12"
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
                  className="border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl h-12"
                  required
                />
              </div>
            )}
            
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white py-3 rounded-xl transition-all duration-300 font-medium h-12 disabled:opacity-50"
            >
              {loading ? '처리 중...' : (isSignup ? '가입하기' : '로그인')}
            </Button>
          </form>
          
          <div className="text-center">
            <button
              onClick={() => {
                setIsSignup(!isSignup);
                setMessage('');
                setFormData({ name: '', email: '', password: '', confirmPassword: '', penName: '' });
              }}
              className="text-sm text-gray-600 hover:text-purple-600 transition-colors font-medium"
            >
              {isSignup ? '이미 회원이신가요? 로그인' : '아직 회원이 아니신가요? 회원가입'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
