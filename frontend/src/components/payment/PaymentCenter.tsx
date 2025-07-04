
import { useState } from 'react';
import { ArrowLeft, CreditCard, Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { subscriptionAPI, pointAPI } from '@/services/api';

interface PaymentCenterProps {
  user: any;
  coins: number;
  isSubscribed: boolean;
  onBack: () => void;
  onPaymentSuccess: (type: 'coin' | 'subscription', amount?: number) => void;
}

export const PaymentCenter = ({ user, coins, isSubscribed, onBack, onPaymentSuccess }: PaymentCenterProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCoinPurchase = async (amount: number, price: number) => {
    setIsProcessing(true);
    
    try {
      // Call point purchase API
      const response = await fetch('http://20.249.140.195:8080/points/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.userId || user.id,  // fallback to user.id if userId is missing
          amount: amount
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        onPaymentSuccess('coin', amount);
        toast.success(`${amount}코인이 충전되었습니다!`);
      } else {
        toast.error(data.error || '코인 충전에 실패했습니다.');
      }
    } catch (error) {
      console.error('Coin purchase error:', error);
      toast.error('코인 충전 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubscription = async () => {
    setIsProcessing(true);
    
    try {
      // 디버깅을 위한 로그
      console.log('PaymentCenter user object:', user);
      console.log('user.userId:', user.userId);
      console.log('user.id:', user.id);
      // Call subscription activation API
      const response = await fetch('http://20.249.140.195:8080/subscriptions/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.userId || user.id,  // fallback to user.id if userId is missing
          planType: 'PREMIUM'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        onPaymentSuccess('subscription');
        toast.success('프리미엄 구독이 시작되었습니다!');
      } else {
        toast.error(data.error || '구독 신청에 실패했습니다.');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('구독 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const coinPackages = [
    { amount: 10, price: 1200, popular: false },
    { amount: 50, price: 5500, popular: true },
    { amount: 100, price: 10000, popular: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              서재로 돌아가기
            </Button>
            <h1 className="text-xl font-light text-gray-800">코인 충전소</h1>
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-gray-600">보유 코인:</span>
              <Badge variant="outline" className="font-medium">🪙 {coins}</Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Premium Subscription Banner */}
        {!isSubscribed && (
          <Card className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white border-0 overflow-hidden relative">
            <div className="absolute inset-0 bg-black/10"></div>
            <CardContent className="p-8 relative z-10">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Crown className="h-6 w-6" />
                    <h2 className="text-2xl font-bold">프리미엄 구독</h2>
                    <Sparkles className="h-5 w-5 animate-pulse" />
                  </div>
                  <p className="text-amber-100 text-lg">
                    월 9,900원으로 모든 작품을 무제한으로 읽어보세요
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-amber-100">
                    <span>✓ 무제한 작품 열람</span>
                    <span>✓ 광고 없는 경험</span>
                    <span>✓ 신작 우선 공개</span>
                  </div>
                </div>
                <Button 
                  onClick={handleSubscription}
                  disabled={isProcessing}
                  className="bg-white text-orange-600 hover:bg-orange-50 px-8 py-4 text-lg font-semibold rounded-xl"
                >
                  {isProcessing ? '처리 중...' : '구독하기'}
                </Button>
              </div>
            </CardContent>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          </Card>
        )}

        {/* Subscription Status */}
        {isSubscribed && (
          <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Crown className="h-6 w-6" />
                <h3 className="text-xl font-semibold">프리미엄 구독 중</h3>
              </div>
              <p className="text-green-100">모든 작품을 무제한으로 즐기고 계세요!</p>
            </CardContent>
          </Card>
        )}

        {/* Coin Packages */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-light text-gray-800">코인 충전</h2>
            <p className="text-gray-600">작품 한 편당 10코인이 필요해요</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {coinPackages.map((pkg) => (
              <Card 
                key={pkg.amount} 
                className={`relative bg-white/80 backdrop-blur-sm border transition-all duration-300 hover:scale-105 ${
                  pkg.popular 
                    ? 'border-amber-400 ring-2 ring-amber-400/20' 
                    : 'border-gray-200/50 hover:border-amber-300'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-amber-500 text-white px-3 py-1">인기</Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="text-4xl mb-2">🪙</div>
                  <CardTitle className="text-2xl font-bold text-gray-800">
                    {pkg.amount} 코인
                  </CardTitle>
                  <p className="text-3xl font-bold text-amber-600">
                    ₩{pkg.price.toLocaleString()}
                  </p>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3 mb-6">
                    <div className="text-sm text-gray-600 text-center">
                      작품 {Math.floor(pkg.amount / 10)}편 열람 가능
                    </div>
                    {pkg.amount >= 50 && (
                      <div className="text-xs text-green-600 text-center font-medium">
                        + 보너스 혜택 포함
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    onClick={() => handleCoinPurchase(pkg.amount, pkg.price)}
                    disabled={isProcessing}
                    className={`w-full py-3 rounded-xl font-medium transition-all duration-300 ${
                      pkg.popular
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : 'bg-gray-800 hover:bg-gray-900 text-white'
                    }`}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    {isProcessing ? '처리 중...' : '충전하기'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Payment Info */}
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-800 mb-4">결제 안내</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• 구매한 코인은 환불되지 않습니다</p>
              <p>• 구독은 언제든지 해지할 수 있습니다</p>
              <p>• 결제 문의는 고객센터로 연락해주세요</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
