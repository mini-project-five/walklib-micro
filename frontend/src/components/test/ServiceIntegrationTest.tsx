import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface ServiceTestProps {
  onBack: () => void;
}

export const ServiceIntegrationTest = ({ onBack }: ServiceTestProps) => {
  const [testResults, setTestResults] = useState<Record<string, 'pending' | 'success' | 'error'>>({});
  const [testLogs, setTestLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '테스트사용자',
    email: 'test@example.com'
  });

  const addLog = (message: string) => {
    setTestLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const updateTestResult = (testName: string, result: 'success' | 'error') => {
    setTestResults(prev => ({ ...prev, [testName]: result }));
  };

  const apiCall = async (url: string, options: RequestInit = {}) => {
    const response = await fetch(`http://localhost:8080${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  };

  const runComprehensiveTest = async () => {
    setIsRunning(true);
    setTestResults({});
    setTestLogs([]);
    
    try {
      // 1. 사용자 생성 테스트
      addLog('새 사용자 생성 시작...');
      setTestResults(prev => ({ ...prev, 'user-create': 'pending' }));
      
      const newUser = await apiCall('/users', {
        method: 'POST',
        body: JSON.stringify({
          userName: newUserData.name,
          email: newUserData.email,
          userPassword: 123456,
          isKtCustomer: false,
          role: 'USER'
        })
      });
      
      addLog(`사용자 생성 성공: ${newUser.userName} (ID: ${newUser.id})`);
      updateTestResult('user-create', 'success');
      
      // 2. 포인트 충전 테스트
      addLog('포인트 충전 시작...');
      setTestResults(prev => ({ ...prev, 'point-charge': 'pending' }));
      
      const pointCharge = await apiCall('/points', {
        method: 'POST',
        body: JSON.stringify({
          userId: newUser.id,
          amount: 1000,
          description: '테스트 포인트 충전'
        })
      });
      
      addLog(`포인트 충전 성공: ${pointCharge.amount}P`);
      updateTestResult('point-charge', 'success');
      
      // 3. 작가 생성 테스트
      addLog('새 작가 등록 시작...');
      setTestResults(prev => ({ ...prev, 'author-create': 'pending' }));
      
      const newAuthor = await apiCall('/authors', {
        method: 'POST',
        body: JSON.stringify({
          authorName: '테스트작가',
          email: 'testauthor@example.com',
          introduction: '테스트용 작가입니다',
          authorPassword: 789456,
          realName: '김테스트'
        })
      });
      
      addLog(`작가 등록 성공: ${newAuthor.authorName} (ID: ${newAuthor.id})`);
      updateTestResult('author-create', 'success');
      
      // 4. 도서 생성 테스트
      addLog('새 도서 등록 시작...');
      setTestResults(prev => ({ ...prev, 'book-create': 'pending' }));
      
      const newBook = await apiCall('/books', {
        method: 'POST',
        body: JSON.stringify({
          title: '테스트 소설',
          authorId: newAuthor.id,
          status: 'AVAILABLE',
          price: 500
        })
      });
      
      addLog(`도서 등록 성공: ${newBook.title} (ID: ${newBook.id})`);
      updateTestResult('book-create', 'success');
      
      // 5. 원고 작성 테스트
      addLog('원고 작성 시작...');
      setTestResults(prev => ({ ...prev, 'manuscript-create': 'pending' }));
      
      const manuscript = await apiCall('/manuscripts', {
        method: 'POST',
        body: JSON.stringify({
          title: '테스트 원고',
          content: '이것은 테스트용 원고 내용입니다.',
          authorId: newAuthor.id,
          status: 'DRAFT'
        })
      });
      
      addLog(`원고 작성 성공: ${manuscript.title} (ID: ${manuscript.id})`);
      updateTestResult('manuscript-create', 'success');
      
      // 6. 구독 생성 테스트
      addLog('구독 서비스 등록 시작...');
      setTestResults(prev => ({ ...prev, 'subscription-create': 'pending' }));
      
      const subscription = await apiCall('/subscriptions', {
        method: 'POST',
        body: JSON.stringify({
          userId: newUser.id,
          subscriptionType: 'PREMIUM',
          status: 'ACTIVE'
        })
      });
      
      addLog(`구독 등록 성공: ${subscription.subscriptionType} (ID: ${subscription.id})`);
      updateTestResult('subscription-create', 'success');
      
      // 7. 전체 데이터 조회 테스트
      addLog('전체 데이터 조회 테스트...');
      setTestResults(prev => ({ ...prev, 'data-retrieval': 'pending' }));
      
      const [users, books, authors, points, subscriptions, manuscripts] = await Promise.all([
        apiCall('/users'),
        apiCall('/books'),
        apiCall('/authors'),
        apiCall('/points'),
        apiCall('/subscriptions'),
        apiCall('/manuscripts')
      ]);
      
      addLog(`데이터 조회 성공:`);
      addLog(`- 사용자: ${users._embedded?.users?.length || 0}명`);
      addLog(`- 도서: ${books._embedded?.books?.length || 0}권`);
      addLog(`- 작가: ${authors._embedded?.authors?.length || 0}명`);
      addLog(`- 포인트 내역: ${points._embedded?.pointLists?.length || 0}건`);
      addLog(`- 구독: ${subscriptions._embedded?.subscriptions?.length || 0}건`);
      addLog(`- 원고: ${manuscripts._embedded?.manuscripts?.length || 0}건`);
      
      updateTestResult('data-retrieval', 'success');
      
      addLog('모든 테스트가 성공적으로 완료되었습니다!');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      addLog(`테스트 실패: ${errorMessage}`);
      
      // 실패한 테스트 단계 표시
      const currentTests = Object.keys(testResults);
      const lastTest = currentTests[currentTests.length - 1];
      if (lastTest && testResults[lastTest] === 'pending') {
        updateTestResult(lastTest, 'error');
      }
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: 'pending' | 'success' | 'error' | undefined) => {
    switch (status) {
      case 'pending':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />;
    }
  };

  const testSteps = [
    { key: 'user-create', name: '사용자 생성' },
    { key: 'point-charge', name: '포인트 충전' },
    { key: 'author-create', name: '작가 등록' },
    { key: 'book-create', name: '도서 등록' },
    { key: 'manuscript-create', name: '원고 작성' },
    { key: 'subscription-create', name: '구독 등록' },
    { key: 'data-retrieval', name: '데이터 조회' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            돌아가기
          </Button>
          <h1 className="text-3xl font-bold text-gray-800">서비스 통합 테스트</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* 테스트 설정 */}
          <Card>
            <CardHeader>
              <CardTitle>테스트 설정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">테스트 사용자 이름</Label>
                <Input
                  id="name"
                  value={newUserData.name}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, name: e.target.value }))}
                  disabled={isRunning}
                />
              </div>
              <div>
                <Label htmlFor="email">테스트 사용자 이메일</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
                  disabled={isRunning}
                />
              </div>
              <Button 
                onClick={runComprehensiveTest}
                disabled={isRunning}
                className="w-full"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    테스트 실행 중...
                  </>
                ) : (
                  '통합 테스트 시작'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* 테스트 상태 */}
          <Card>
            <CardHeader>
              <CardTitle>테스트 진행 상황</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testSteps.map((step) => (
                  <div key={step.key} className="flex items-center space-x-3">
                    {getStatusIcon(testResults[step.key])}
                    <span className={`${
                      testResults[step.key] === 'success' ? 'text-green-700' :
                      testResults[step.key] === 'error' ? 'text-red-700' :
                      testResults[step.key] === 'pending' ? 'text-blue-700' :
                      'text-gray-500'
                    }`}>
                      {step.name}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 테스트 로그 */}
        {testLogs.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>테스트 로그</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
                {testLogs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
