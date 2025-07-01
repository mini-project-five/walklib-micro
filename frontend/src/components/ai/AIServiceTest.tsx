import React, { useState } from 'react';
import { aiApi } from '../../lib/api';

interface AIServiceTestProps {}

interface AIResponse {
  success: boolean;
  message: string;
  data?: any;
  errorCode?: string;
}

const AIServiceTest: React.FC<AIServiceTestProps> = () => {
  const [activeTab, setActiveTab] = useState<'text' | 'cover'>('text');
  const [activeMode, setActiveMode] = useState<'backend' | 'direct'>('backend');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  // 텍스트 다듬기 상태
  const [textData, setTextData] = useState({
    originalText: '',
    genre: '',
    style: '',
    targetAudience: '',
    instructions: ''
  });

  // 표지 생성 상태
  const [coverData, setCoverData] = useState({
    title: '',
    author: '',
    genre: '',
    mood: '',
    style: '',
    colorScheme: '',
    description: ''
  });

  const handleRefineText = async () => {
    if (!textData.originalText.trim()) {
      setError('원본 텍스트를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');
    setResult('');

    try {
      let response;
      if (activeMode === 'backend') {
        response = await aiApi.refineText(textData) as AIResponse;
        if (response.success) {
          setResult(response.data);
        } else {
          setError(response.message || '텍스트 다듬기에 실패했습니다.');
        }
      } else {
        const refinedText = await aiApi.refineTextDirect(textData.originalText, {
          genre: textData.genre,
          style: textData.style,
          targetAudience: textData.targetAudience,
          instructions: textData.instructions
        });
        setResult(refinedText);
      }
    } catch (err: any) {
      setError(err.message || '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCover = async () => {
    if (!coverData.title.trim()) {
      setError('책 제목을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');
    setResult('');

    try {
      let response;
      if (activeMode === 'backend') {
        response = await aiApi.generateCover(coverData) as AIResponse;
        if (response.success) {
          setResult(response.data);
        } else {
          setError(response.message || '표지 생성에 실패했습니다.');
        }
      } else {
        const imageUrl = await aiApi.generateCoverDirect(coverData);
        setResult(imageUrl);
      }
    } catch (err: any) {
      setError(err.message || '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const testHealthCheck = async () => {
    setLoading(true);
    setError('');
    setResult('');

    try {
      const response = await aiApi.healthCheck();
      setResult(JSON.stringify(response, null, 2));
    } catch (err: any) {
      setError(err.message || '헬스 체크 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">AI 서비스 테스트</h2>
      
      {/* 헬스 체크 버튼 */}
      <div className="mb-6">
        <button
          onClick={testHealthCheck}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          AI 서비스 헬스 체크
        </button>
      </div>

      {/* 모드 선택 */}
      <div className="mb-6">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveMode('backend')}
            className={`px-4 py-2 rounded ${
              activeMode === 'backend'
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            백엔드 API 사용
          </button>
          <button
            onClick={() => setActiveMode('direct')}
            className={`px-4 py-2 rounded ${
              activeMode === 'direct'
                ? 'bg-purple-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            직접 OpenAI 호출
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {activeMode === 'backend' 
            ? '백엔드 서버를 통해 OpenAI API를 호출합니다.' 
            : '프론트엔드에서 직접 OpenAI API를 호출합니다.'}
        </p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveTab('text')}
          className={`px-4 py-2 rounded-t-lg ${
            activeTab === 'text'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          텍스트 다듬기
        </button>
        <button
          onClick={() => setActiveTab('cover')}
          className={`px-4 py-2 rounded-t-lg ${
            activeTab === 'cover'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          표지 생성
        </button>
      </div>

      {/* 텍스트 다듬기 탭 */}
      {activeTab === 'text' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              원본 텍스트 *
            </label>
            <textarea
              value={textData.originalText}
              onChange={(e) => setTextData({ ...textData, originalText: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-md"
              rows={6}
              placeholder="다듬고 싶은 텍스트를 입력하세요..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">장르</label>
              <input
                type="text"
                value={textData.genre}
                onChange={(e) => setTextData({ ...textData, genre: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="예: 로맨스, 판타지, 미스터리"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">스타일</label>
              <input
                type="text"
                value={textData.style}
                onChange={(e) => setTextData({ ...textData, style: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="예: 격식체, 캐주얼, 시적"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">대상 독자</label>
              <input
                type="text"
                value={textData.targetAudience}
                onChange={(e) => setTextData({ ...textData, targetAudience: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="예: 아동, 청소년, 성인"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">추가 지시사항</label>
              <input
                type="text"
                value={textData.instructions}
                onChange={(e) => setTextData({ ...textData, instructions: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="특별한 요청사항이 있다면..."
              />
            </div>
          </div>

          <button
            onClick={handleRefineText}
            disabled={loading}
            className="w-full py-3 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? '텍스트 다듬는 중...' : '텍스트 다듬기'}
          </button>
        </div>
      )}

      {/* 표지 생성 탭 */}
      {activeTab === 'cover' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                책 제목 *
              </label>
              <input
                type="text"
                value={coverData.title}
                onChange={(e) => setCoverData({ ...coverData, title: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="책 제목을 입력하세요"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">저자명</label>
              <input
                type="text"
                value={coverData.author}
                onChange={(e) => setCoverData({ ...coverData, author: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="저자명을 입력하세요"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">장르</label>
              <input
                type="text"
                value={coverData.genre}
                onChange={(e) => setCoverData({ ...coverData, genre: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="로맨스, 판타지 등"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">분위기</label>
              <input
                type="text"
                value={coverData.mood}
                onChange={(e) => setCoverData({ ...coverData, mood: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="어두운, 밝은, 신비로운"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">스타일</label>
              <input
                type="text"
                value={coverData.style}
                onChange={(e) => setCoverData({ ...coverData, style: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="미니멀, 상세함, 추상적"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">색상 구성</label>
              <input
                type="text"
                value={coverData.colorScheme}
                onChange={(e) => setCoverData({ ...coverData, colorScheme: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="따뜻한, 차가운, 단색"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">책 설명</label>
              <input
                type="text"
                value={coverData.description}
                onChange={(e) => setCoverData({ ...coverData, description: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="책 내용 간단 요약"
              />
            </div>
          </div>

          <button
            onClick={handleGenerateCover}
            disabled={loading}
            className="w-full py-3 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:opacity-50"
          >
            {loading ? '표지 생성 중...' : '표지 생성하기'}
          </button>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* 결과 표시 */}
      {result && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">결과:</h3>
          {activeTab === 'cover' ? (
            <div>
              <img 
                src={result} 
                alt="생성된 표지" 
                className="max-w-md mx-auto rounded-lg shadow-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `<p class="text-gray-600">이미지를 불러올 수 없습니다. URL: ${result}</p>`;
                  }
                }}
              />
              <p className="mt-2 text-sm text-gray-600 text-center">
                이미지 URL: <a href={result} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{result}</a>
              </p>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
              <pre className="whitespace-pre-wrap text-sm">{result}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIServiceTest;
