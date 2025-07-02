import React, { useState, useEffect } from 'react';
import { Book, BookPlus, User, LogOut, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BookList from '../books/BookList';
import { AuthorEditor } from './AuthorEditor';
import { bookAPI, manuscriptAPI, Book as BookType, Manuscript } from '@/services/api';

interface AuthorDashboardProps {
  user: any;
  onBack: () => void;
  onBookSelect?: (book: BookType) => void;
}

export const AuthorDashboard = ({ user, onBack, onBookSelect }: AuthorDashboardProps) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showEditor, setShowEditor] = useState(false);
  const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
  const [publishedBooks, setPublishedBooks] = useState<BookType[]>([]);
  const [draftBooks, setDraftBooks] = useState<BookType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadAuthorData();
    }
  }, [activeTab, user.authorId]);

  const loadAuthorData = async () => {
    try {
      setLoading(true);
      
      // 작가의 모든 책 조회
      const allBooks = await bookAPI.getByAuthor(user.authorId);
      
      // 출간된 책과 초안 분리
      const published = allBooks.filter(book => book.status === 'PUBLISHED');
      const drafts = allBooks.filter(book => book.status === 'DRAFT');
      
      setPublishedBooks(published);
      setDraftBooks(drafts);
      
      // 원고 조회
      const authorManuscripts = await manuscriptAPI.getByAuthor(user.authorId);
      setManuscripts(authorManuscripts);
      
    } catch (error) {
      console.error('작가 데이터 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('walkingLibraryUser');
    window.location.reload();
  };

  if (showEditor) {
    return <AuthorEditor user={user} onBack={() => setShowEditor(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                뒤로가기
              </Button>
              <h1 className="text-2xl font-bold text-gray-800">WalkLib - 작가</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">환영합니다, {user.authorName}님</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">대시보드</TabsTrigger>
            <TabsTrigger value="published">출간 도서</TabsTrigger>
            <TabsTrigger value="drafts">초안</TabsTrigger>
            <TabsTrigger value="manuscripts">원고</TabsTrigger>
          </TabsList>

          {/* 대시보드 */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* 통계 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">출간 도서</CardTitle>
                  <Book className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{publishedBooks.length}</div>
                  <p className="text-xs text-muted-foreground">
                    독자들이 읽을 수 있는 책
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">작업 중인 초안</CardTitle>
                  <BookPlus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{draftBooks.length}</div>
                  <p className="text-xs text-muted-foreground">
                    출간 준비 중인 책
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">저장된 원고</CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{manuscripts.length}</div>
                  <p className="text-xs text-muted-foreground">
                    작성 중인 원고
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* 액션 버튼 */}
            <div className="flex justify-center">
              <Button onClick={() => setShowEditor(true)} size="lg" className="px-8">
                <BookPlus className="h-5 w-5 mr-2" />
                새 작품 쓰기
              </Button>
            </div>

            {/* 최근 작업 */}
            <Card>
              <CardHeader>
                <CardTitle>최근 작업</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">로딩 중...</div>
                ) : (
                  <div className="space-y-4">
                    {[...publishedBooks, ...draftBooks].slice(0, 3).map((book) => (
                      <div key={book.bookId} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{book.title}</h4>
                          <p className="text-sm text-gray-600">
                            상태: {book.status === 'PUBLISHED' ? '출간됨' : '초안'}
                          </p>
                        </div>
                        <div className="text-sm text-gray-500">
                          {book.createdAt && new Date(book.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                    {[...publishedBooks, ...draftBooks].length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        아직 작성한 작품이 없습니다.
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 출간 도서 탭 */}
          <TabsContent value="published">
            <BookList 
              authorId={user.authorId}
              showOnlyPublished={true}
              title="내가 출간한 도서"
              onBookSelect={onBookSelect}
            />
          </TabsContent>

          {/* 초안 탭 */}
          <TabsContent value="drafts">
            <BookList 
              authorId={user.authorId}
              showOnlyPublished={false}
              title="작업 중인 초안"
              onBookSelect={onBookSelect}
            />
          </TabsContent>

          {/* 원고 탭 */}
          <TabsContent value="manuscripts">
            <Card>
              <CardHeader>
                <CardTitle>저장된 원고</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">로딩 중...</div>
                ) : manuscripts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    저장된 원고가 없습니다.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {manuscripts.map((manuscript) => (
                      <div key={manuscript.manuscriptId} className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">{manuscript.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          상태: {manuscript.status === 'PUBLISHED' ? '출간됨' : '작성 중'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {manuscript.updatedAt && 
                            `수정일: ${new Date(manuscript.updatedAt).toLocaleDateString()}`
                          }
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AuthorDashboard;
