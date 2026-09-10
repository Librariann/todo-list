import { Plus } from 'lucide-react';

interface TaskSectionHeaderProps {
  title: string;
  description: string;
  addLabel: string;
  onAdd: () => void;
  showAdd?: boolean;
}

interface TaskErrorStateProps {
  title: string;
  description: string;
  onRetry: () => void;
  compact?: boolean;
}

export function TaskSectionHeader({
  title,
  description,
  addLabel,
  onAdd,
  showAdd = true,
}: TaskSectionHeaderProps) {
  return (
    <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
      <div>
        <h2 className="friendly-heading text-2xl font-bold text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {showAdd ? (
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
          aria-label={addLabel}
        >
          <Plus className="h-5 w-5" />
        </button>
      ) : null}
    </div>
  );
}

export function TaskLoadingState({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-8 text-center">
      <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      <p className="text-sm text-muted-foreground">{label} 로딩 중...</p>
    </div>
  );
}

export function TaskEmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-8 text-center">
      <p className="font-medium text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function TaskErrorState({
  title,
  description,
  onRetry,
  compact = false,
}: TaskErrorStateProps) {
  return (
    <div
      role="alert"
      className={`border border-destructive/20 bg-destructive/5 ${
        compact
          ? 'flex flex-col gap-3 rounded-xl px-4 py-4 sm:flex-row sm:items-center sm:justify-between'
          : 'rounded-lg p-8 text-center'
      }`}
    >
      <div className={compact ? 'min-w-0' : undefined}>
        <p className="font-semibold text-foreground">{title}</p>
        <p className="mt-1 break-keep text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className={`inline-flex min-h-11 items-center justify-center rounded-xl border border-destructive/25 bg-card px-4 text-sm font-bold text-destructive transition-colors hover:bg-destructive/10 ${
          compact ? 'shrink-0' : 'mt-5'
        }`}
      >
        다시 불러오기
      </button>
    </div>
  );
}
