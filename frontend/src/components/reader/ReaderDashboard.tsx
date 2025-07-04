import React from 'react';
import BookList from '../books/BookList';
import { Book } from '../../services/api';

interface ReaderDashboardProps {
  onBookSelect?: (book: Book) => void;
}

const ReaderDashboard: React.FC<ReaderDashboardProps> = ({ onBookSelect }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">WalkLib - 독자</h1>
            <nav className="flex space-x-6">
              <a href="#" className="text-gray-600 hover:text-gray-800">홈</a>
              <a href="#" className="text-gray-600 hover:text-gray-800">내 서재</a>
              <a href="#" className="text-gray-600 hover:text-gray-800">구독</a>
              <a href="#" className="text-gray-600 hover:text-gray-800">로그아웃</a>
            </nav>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="py-8">
        {/* 환영 메시지 */}
        <section className="max-w-6xl mx-auto px-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-2">안녕하세요, 독자님!</h2>
            <p className="text-gray-600">
              새로운 웹소설을 탐험해보세요. 다양한 작가들의 흥미진진한 이야기가 여러분을 기다리고 있습니다.
            </p>
          </div>
        </section>

        {/* 출간된 도서 목록 */}
        <section>
          <BookList 
            showOnlyPublished={true}
            title="최신 출간 도서"
            onBookSelect={onBookSelect}
          />
        </section>
      </main>
    </div>
  );
};

export default ReaderDashboard;
