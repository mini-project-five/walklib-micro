import React from 'react';
import { ArrowLeft, User, Eye, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Book } from '@/services/api';

interface SimpleBookViewerProps {
  book: Book;
  onBack: () => void;
}

const SimpleBookViewer: React.FC<SimpleBookViewerProps> = ({ book, onBack }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              뒤로가기
            </Button>
            <div className="text-sm text-gray-600">
              WalkLib - 도서 뷰어
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* 책 정보 카드 */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-6">
              {/* 표지 이미지 */}
              <div className="w-48 h-64 mx-auto md:mx-0 flex-shrink-0">
                {book.coverImage ? (
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-full h-full object-cover rounded-lg shadow-md"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400">표지 없음</span>
                  </div>
                )}
              </div>

              {/* 책 정보 */}
              <div className="flex-1">
                <CardTitle className="text-2xl mb-4">{book.title}</CardTitle>
                
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <User className="h-4 w-4 mr-2" />
                    <span>작가 ID: {book.authorId}</span>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <Badge variant={book.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                      {book.status === 'PUBLISHED' ? '출간됨' : '미출간'}
                    </Badge>
                    
                    {book.isBestseller && (
                      <Badge variant="destructive">
                        <Heart className="h-3 w-3 mr-1" />
                        베스트셀러
                      </Badge>
                    )}
                  </div>
                  
                  {book.viewCount !== undefined && (
                    <div className="flex items-center text-gray-600">
                      <Eye className="h-4 w-4 mr-2" />
                      <span>조회수: {book.viewCount.toLocaleString()}회</span>
                    </div>
                  )}
                  
                  {book.createdAt && (
                    <div className="text-sm text-gray-500">
                      작성일: {new Date(book.createdAt).toLocaleDateString()}
                    </div>
                  )}
                  
                  {book.publishedAt && (
                    <div className="text-sm text-gray-500">
                      출간일: {new Date(book.publishedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* 내용 */}
        <Card>
          <CardHeader>
            <CardTitle>작품 내용</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              {book.content ? (
                book.content.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 leading-relaxed text-gray-700">
                    {paragraph.trim() || '\u00A0'}
                  </p>
                ))
              ) : (
                <p className="text-gray-500 italic">내용이 없습니다.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SimpleBookViewer;
