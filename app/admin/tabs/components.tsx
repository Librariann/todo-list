export function Field({
  label,
  children,
  span2,
}: {
  label: string;
  children: React.ReactNode;
  span2?: boolean;
}) {
  return (
    <div className={span2 ? 'sm:col-span-2' : ''}>
      <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
      {children}
    </div>
  );
}

export function ActionBtn({
  danger,
  onClick,
  disabled,
  children,
}: {
  danger?: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors disabled:opacity-40 ${
        danger
          ? 'border-red-200 dark:border-red-900/40 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10'
          : 'border-stone-200 dark:border-white/[0.1] text-muted-foreground hover:bg-stone-50 dark:hover:bg-white/5'
      }`}
    >
      {children}
    </button>
  );
}
