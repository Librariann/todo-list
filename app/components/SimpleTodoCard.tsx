'use client';

import { Todo, TodoStatus } from '../types/todo';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Trash2 } from "lucide-react";

interface SimpleTodoCardProps {
  todo: Todo;
  onStatusChange: (id: string, status: TodoStatus) => void;
  onDelete?: (id: string) => void;
}

export default function SimpleTodoCard({ todo, onStatusChange, onDelete }: SimpleTodoCardProps) {
  const isDone = todo.status === TodoStatus.DONE;

  return (
    <Card className={`
      group relative p-4 hover:shadow-md transition-all duration-200 border-l-4
      ${isDone
        ? 'border-l-amber-500 opacity-70'
        : todo.status === TodoStatus.IN_PROGRESS
        ? 'border-l-primary'
        : 'border-l-stone-300 dark:border-l-stone-600'
      }
    `}>
      <div className="flex items-center gap-3">
        {/* 체크박스 */}
        <Button
          onClick={() => {
            if (todo.status === TodoStatus.DONE) {
              onStatusChange(todo.id, TodoStatus.TODO);
            } else {
              onStatusChange(todo.id, TodoStatus.DONE);
            }
          }}
          variant="ghost"
          size="sm"
          className={`
            flex-shrink-0 w-6 h-6 rounded-full border-2 p-0
            ${isDone
              ? 'bg-amber-500 border-amber-500 hover:bg-amber-600'
              : 'border-stone-300 dark:border-stone-600 hover:border-primary dark:hover:border-primary'
            }
          `}
        >
          {isDone && <Check className="w-4 h-4 text-white" />}
        </Button>

        {/* 제목 */}
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium text-foreground ${isDone ? 'line-through opacity-60' : ''}`}>
            {todo.title}
          </h3>
        </div>

        {/* 진행 중 버튼 */}
        {!isDone && (
          <Badge
            onClick={() => {
              const newStatus = todo.status === TodoStatus.IN_PROGRESS 
                ? TodoStatus.TODO 
                : TodoStatus.IN_PROGRESS;
              onStatusChange(todo.id, newStatus);
            }}
            variant={todo.status === TodoStatus.IN_PROGRESS ? "default" : "outline"}
            className="cursor-pointer hover:opacity-80 transition-opacity"
          >
            {todo.status === TodoStatus.IN_PROGRESS ? '🚀 진행중' : '시작'}
          </Badge>
        )}
        {onDelete && (
          <Button
            onClick={() => onDelete(todo.id)}
            variant="ghost"
            size="sm"
            className="flex-shrink-0 w-7 h-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </Card>
  );
}
