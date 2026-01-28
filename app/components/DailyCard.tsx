'use client';

import { DailyFrequency } from '../types/todo';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

interface DailyWithCompletion {
  id: string;
  title: string;
  frequency: DailyFrequency;
  completedDates: string[];
  streak: number;
  createdAt: Date;
  completed: boolean; // 선택된 날짜의 완료 여부
}

interface DailyCardProps {
  daily: DailyWithCompletion;
  onToggle: (id: string) => void;
}

export default function DailyCard({ daily, onToggle }: DailyCardProps) {
  const getFrequencyText = (frequency: DailyFrequency) => {
    switch (frequency) {
      case DailyFrequency.DAILY:
        return '매일';
      case DailyFrequency.WEEKLY:
        return '매주';
      case DailyFrequency.MONTHLY:
        return '매월';
      default:
        return '';
    }
  };

  return (
    <Card className={`
      group relative p-4 hover:shadow-md transition-all duration-200 border-l-4
      ${daily.completed 
        ? 'border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20' 
        : 'border-l-blue-500'
      }
    `}>
      <div className="flex items-center gap-3">
        {/* 체크박스 */}
        <Button
          onClick={() => onToggle(daily.id)}
          variant="ghost"
          size="sm"
          className={`
            flex-shrink-0 w-6 h-6 rounded border-2 p-0
            ${daily.completed 
              ? 'bg-emerald-500 border-emerald-500 hover:bg-emerald-600' 
              : 'border-muted-foreground hover:border-blue-500'
            }
          `}
        >
          {daily.completed && <Check className="w-4 h-4 text-white" />}
        </Button>

        {/* 제목 */}
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium text-foreground ${daily.completed ? 'line-through opacity-70' : ''}`}>
            {daily.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs">
              {getFrequencyText(daily.frequency)}
            </Badge>
            {daily.streak > 0 && (
              <Badge variant="outline" className="text-xs bg-orange-50 dark:bg-orange-900/15 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800/30">
                🔥 {daily.streak}일 연속
              </Badge>
            )}
          </div>
        </div>

      </div>
    </Card>
  );
}
