import type { TaskTabType } from '@/app/types/navigation';

interface TaskTabsProps {
  activeTab: TaskTabType;
  onChange: (tab: TaskTabType) => void;
}

const tabs: Array<{ key: TaskTabType; label: string; description: string }> = [
  { key: 'habits', label: '습관', description: '매일 이어가는 행동' },
  { key: 'todos', label: '할 일', description: '오늘과 앞으로의 일' },
  { key: 'goals', label: '목표', description: '길게 보고 가는 방향' },
];

export default function TaskTabs({ activeTab, onChange }: TaskTabsProps) {
  return (
    <nav
      className="mb-5 grid grid-cols-3 overflow-hidden rounded-[1.35rem] border border-[#26302a]/12 bg-[#f4f1e8] dark:border-border dark:bg-muted"
      aria-label="작업 공간"
    >
      {tabs.map((tab, index) => {
        const isActive = activeTab === tab.key;

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`relative min-h-[4.5rem] px-3 text-left transition-colors sm:min-h-20 sm:px-5 ${
              index > 0 ? 'border-l border-[#26302a]/10 dark:border-border' : ''
            } ${
              isActive
                ? 'bg-[#e4eddf] text-[#216c40] dark:bg-secondary dark:text-primary'
                : 'text-[#687169] hover:bg-white/60 dark:text-muted-foreground dark:hover:bg-card'
            }`}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="block text-base font-bold sm:text-lg">{tab.label}</span>
            <span className="mt-1 hidden text-xs font-medium opacity-75 sm:block">
              {tab.description}
            </span>
            {isActive ? (
              <span className="absolute inset-x-4 bottom-0 h-1 rounded-t-full bg-[#2e8c54] dark:bg-primary" />
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}
