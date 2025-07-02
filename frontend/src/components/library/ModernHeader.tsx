
import { Search, User, LogOut, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ModernHeaderProps {
  user: any;
  points: number; // coins → points 변경
  isSubscribed: boolean;
  onPaymentClick: () => void;
  onLogout: () => void;
}

export const ModernHeader = ({ 
  user, 
  points, // coins → points 변경
  isSubscribed, 
  onPaymentClick, 
  onLogout 
}: ModernHeaderProps) => {
  return (
    <header className="bg-white/90 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">걷</span>
            </div>
            <h1 className="text-xl font-light text-gray-800">걷다가, 서재</h1>
          </div>

          {/* Center Search */}
          <div className="hidden md:flex items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="작품이나 작가를 검색해보세요..."
                className="pl-10 pr-4 py-2 w-80 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Subscription Badge */}
            {isSubscribed && (
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
                프리미엄
              </Badge>
            )}

            {/* Coins */}
            <Button
              variant="outline"
              onClick={onPaymentClick}
              className="flex items-center space-x-2 bg-white/50 backdrop-blur-sm border-amber-200 hover:bg-amber-50 hover:border-amber-300 transition-all duration-200"
            >
              <Coins className="h-4 w-4 text-amber-600" />
              <span className="font-medium text-blue-700">🎯 {points}P</span> {/* 코인 → 포인트로 변경 */}
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="flex items-center space-x-2 bg-white/50 backdrop-blur-sm hover:bg-gray-100 transition-all duration-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="hidden sm:inline text-gray-700 font-medium">{user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white/95 backdrop-blur-sm border-gray-200/50">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onPaymentClick}>
                  <Coins className="mr-2 h-4 w-4" />
                  코인 충전
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};
