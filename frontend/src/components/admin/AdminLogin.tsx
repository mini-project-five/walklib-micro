import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: (adminData: any) => void;
  onBackToMain: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBackToMain }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://20.249.130.200/users/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminData', JSON.stringify(data.user));
        
        console.log('관리자 로그인 성공:', data);
        onLoginSuccess(data);
      } else {
        setError(data.error || '로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('관리자 로그인 오류:', error);
      setError('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl border-0">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            관리자 로그인
          </CardTitle>
          <CardDescription className="text-gray-600">
            WalkLib 관리자 대시보드에 접속하세요
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                관리자 이메일
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="admin@walklib.com"
                className="w-full"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                비밀번호
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="관리자 비밀번호"
                  className="w-full pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 transition-colors"
                disabled={loading}
              >
                {loading ? '로그인 중...' : '관리자 로그인'}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={onBackToMain}
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                disabled={loading}
              >
                메인으로 돌아가기
              </Button>
            </div>
          </form>

          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              관리자 권한이 필요한 영역입니다
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;