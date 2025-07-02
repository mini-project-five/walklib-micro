import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { authorAPI } from '@/services/api';
import { Author } from '@/services/api';
import { CheckCircle, XCircle, Clock, Users, PenTool, BookOpen } from 'lucide-react';

interface AdminAuthorApprovalProps {
  onBack: () => void;
}

export const AdminAuthorApproval = ({ onBack }: AdminAuthorApprovalProps) => {
  const [pendingAuthors, setPendingAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchPendingAuthors = async () => {
    try {
      setLoading(true);
      // 작가 승인 대기 목록 조회 API (authorAPI 사용)
      const authors = await authorAPI.getPendingAuthors();
      setPendingAuthors(authors);
    } catch (error) {
      console.error('작가 승인 대기 목록 조회 실패:', error);
      setMessage('목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAuthor = async (authorId: number, authorName: string) => {
    try {
      // 작가 승인 API 호출
      await authorAPI.approveAuthor(authorId);
      setMessage(`${authorName}님이 작가로 승인되었습니다.`);
      fetchPendingAuthors(); // 목록 새로고침
    } catch (error) {
      console.error('작가 승인 실패:', error);
      setMessage('승인 처리에 실패했습니다.');
    }
  };

  const handleRejectAuthor = async (authorId: number, authorName: string) => {
    try {
      // 작가 거절 API 호출
      await authorAPI.rejectAuthor(authorId);
      setMessage(`${authorName}님의 작가 신청이 거절되었습니다.`);
      fetchPendingAuthors(); // 목록 새로고침
    } catch (error) {
      console.error('작가 거절 실패:', error);
      setMessage('거절 처리에 실패했습니다.');
    }
  };

  useEffect(() => {
    fetchPendingAuthors();
  }, []);

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-full">
              <PenTool className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">작가 승인 관리</h1>
              <p className="text-gray-600">작가 신청을 승인하거나 거절할 수 있습니다.</p>
            </div>
          </div>
          <Button onClick={onBack} variant="outline">
            돌아가기
          </Button>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg text-purple-800">
            {message}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Clock className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600">승인 대기</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingAuthors.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Users className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">전체 신청</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingAuthors.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <BookOpen className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">처리 필요</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingAuthors.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Authors List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PenTool className="w-5 h-5" />
              <span>작가 승인 대기 목록</span>
              <Badge variant="secondary">{pendingAuthors.length}건</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">목록을 불러오는 중...</p>
              </div>
            ) : pendingAuthors.length === 0 ? (
              <div className="text-center py-8">
                <PenTool className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">현재 작가 승인 요청이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingAuthors.map((author) => (
                  <div
                    key={author.authorId}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {author.authorName?.charAt(0) || 'A'}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{author.authorName}</h3>
                          <p className="text-sm text-gray-600">{author.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>작가 ID: {author.authorId}</span>
                        <Badge variant="outline" className="text-purple-600 border-purple-200">
                          작가 승인 대기
                        </Badge>
                        <span className="text-xs text-gray-500">
                          실명: {author.realName}
                        </span>
                      </div>
                      {/* 작가 소개가 있다면 표시 */}
                      {author.introduction && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                          <span className="font-medium">작가 소개: </span>
                          {author.introduction}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleApproveAuthor(author.authorId!, author.authorName)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        승인
                      </Button>
                      <Button
                        onClick={() => handleRejectAuthor(author.authorId!, author.authorName)}
                        size="sm"
                        variant="destructive"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        거절
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
