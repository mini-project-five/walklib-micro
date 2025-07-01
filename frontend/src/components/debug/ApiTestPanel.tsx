import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { userApi, bookApi, authorApi } from '@/lib/api';

export const ApiTestPanel = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [authors, setAuthors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userApi.getUsers();
      setUsers((response as any)._embedded?.users || []);
    } catch (err) {
      setError('사용자 데이터를 가져오는데 실패했습니다: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await bookApi.getBooks();
      setBooks((response as any)._embedded?.books || []);
    } catch (err) {
      setError('도서 데이터를 가져오는데 실패했습니다: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuthors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authorApi.getAuthors();
      setAuthors((response as any)._embedded?.authors || []);
    } catch (err) {
      setError('작가 데이터를 가져오는데 실패했습니다: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>백엔드 API 연동 테스트</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={fetchUsers} disabled={loading}>
              사용자 목록 가져오기
            </Button>
            <Button onClick={fetchBooks} disabled={loading}>
              도서 목록 가져오기
            </Button>
            <Button onClick={fetchAuthors} disabled={loading}>
              작가 목록 가져오기
            </Button>
          </div>

          {loading && <p className="text-blue-600">로딩 중...</p>}
          {error && <p className="text-red-600">{error}</p>}

          {users.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">사용자 목록</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {users.map((user, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded">
                      <p><strong>이름:</strong> {user.userName}</p>
                      <p><strong>이메일:</strong> {user.email}</p>
                      <p><strong>역할:</strong> {user.role}</p>
                      <p><strong>KT 고객:</strong> {user.isKtCustomer ? '예' : '아니오'}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {books.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">도서 목록</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {books.map((book, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded">
                      <p><strong>제목:</strong> {book.title}</p>
                      <p><strong>가격:</strong> {book.price}원</p>
                      <p><strong>베스트셀러:</strong> {book.isBestseller ? '예' : '아니오'}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {authors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">작가 목록</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {authors.map((author, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded">
                      <p><strong>이름:</strong> {author.name}</p>
                      <p><strong>펜네임:</strong> {author.penName}</p>
                      <p><strong>이메일:</strong> {author.email}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
