'use client';

import { Reward } from '../types/todo';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface RewardShopProps {
  rewards: Reward[];
  userPoints: number;
  onClaim: (reward: Reward) => void;
}

export default function RewardShop({ rewards, userPoints, onClaim }: RewardShopProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">🎁 보상 상점</CardTitle>
          <Badge className="bg-primary text-primary-foreground px-4 py-2 text-base font-bold">
            ⭐ {userPoints} 포인트
          </Badge>
        </div>
      </CardHeader>
      <CardContent>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {rewards.map((reward) => {
            const canAfford = userPoints >= reward.value;
            
            return (
              <Card
                key={reward.id}
                className={`
                  relative border-2 transition-all duration-200
                  ${
                    canAfford
                      ? 'border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 hover:shadow-lg hover:scale-105'
                      : 'border-muted-foreground/20 bg-muted opacity-60'
                  }
                `}
              >
                {/* 아이콘 */}
                <div className="text-center mb-3 p-4">
                  <span className="text-5xl">{reward.iconUrl}</span>
                </div>

                {/* 정보 */}
                <div className="text-center mb-3 px-4">
                  <h3 className="font-bold text-foreground mb-1">
                    {reward.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {reward.description}
                  </p>
                </div>

                {/* 가격 */}
                <div className="flex items-center justify-center gap-1 mb-3 px-4">
                  <Badge variant="secondary" className="text-primary font-bold">
                    ⭐ {reward.value} 포인트
                  </Badge>
                </div>

                {/* 구매 버튼 */}
                <div className="px-4 pb-4">
                  <Button
                    onClick={() => canAfford && onClaim(reward)}
                    disabled={!canAfford}
                    className="w-full"
                    variant={canAfford ? "default" : "secondary"}
                  >
                    {canAfford ? '교환하기' : '포인트 부족'}
                  </Button>
                </div>

                {/* 부족한 포인트 표시 */}
                {!canAfford && (
                  <Badge className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-xs font-bold">
                    -{reward.value - userPoints}
                  </Badge>
                )}
             </Card>
           );
         })}
        </div>

        {/* 더 많은 보상 추가 예정 메시지 */}
        <div className="mt-6 p-4 bg-muted rounded-lg border">
          <p className="text-sm text-center text-muted-foreground">
            🎯 더 많은 보상이 곧 추가됩니다! 계속 할 일을 완료하고 포인트를 모아보세요.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
