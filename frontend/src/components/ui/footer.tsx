
import { Heart, BookOpen, Users, Award } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 브랜드 소개 */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">걷</span>
              </div>
              <h3 className="text-xl font-light">걷다가, 서재</h3>
            </div>
            <p className="text-gray-300 leading-relaxed">
              당신의 일상에 영감을 주는<br />
              디지털 독서 공간
            </p>
            <div className="flex items-center space-x-1 text-pink-400">
              <Heart className="h-4 w-4 fill-current" />
              <span className="text-sm">독서를 사랑하는 모든 이들과 함께</span>
            </div>
          </div>

          {/* 서비스 통계 */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium">서재 현황</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <BookOpen className="h-5 w-5 text-amber-400" />
                <div>
                  <div className="text-2xl font-bold text-amber-400">12,847</div>
                  <div className="text-sm text-gray-400">소장 작품</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-blue-400" />
                <div>
                  <div className="text-2xl font-bold text-blue-400">35,291</div>
                  <div className="text-sm text-gray-400">활성 독자</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Award className="h-5 w-5 text-green-400" />
                <div>
                  <div className="text-2xl font-bold text-green-400">2,134</div>
                  <div className="text-sm text-gray-400">등록 작가</div>
                </div>
              </div>
            </div>
          </div>

          {/* 인기 장르 */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium">인기 장르</h4>
            <div className="space-y-2">
              {[
                { genre: '로맨스', percentage: 28 },
                { genre: '판타지', percentage: 22 },
                { genre: '미스터리', percentage: 18 },
                { genre: '시', percentage: 15 },
                { genre: '에세이', percentage: 17 }
              ].map((item) => (
                <div key={item.genre} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">{item.genre}</span>
                    <span className="text-amber-400">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1">
                    <div 
                      className="bg-gradient-to-r from-amber-500 to-orange-500 h-1 rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 서포트 */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium">고객 지원</h4>
            <div className="space-y-3 text-gray-300">
              <div>
                <div className="font-medium text-white">고객센터</div>
                <div className="text-sm">평일 09:00 - 18:00</div>
                <div className="text-amber-400">1588-1234</div>
              </div>
              <div>
                <div className="font-medium text-white">이메일 문의</div>
                <div className="text-amber-400">support@walklib.com</div>
              </div>
              <div>
                <div className="font-medium text-white">작가 지원</div>
                <div className="text-amber-400">writer@walklib.com</div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © 2024 걷다가, 서재. 모든 권리 보유.
            </div>
            <div className="flex space-x-6 text-sm text-gray-400">
              <button className="hover:text-white transition-colors">이용약관</button>
              <button className="hover:text-white transition-colors">개인정보처리방침</button>
              <button className="hover:text-white transition-colors">저작권 정책</button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
