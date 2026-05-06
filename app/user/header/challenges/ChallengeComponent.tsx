import { Challenge } from '@/app/types/todo';
import ChallengeCard from './ChallengeCard';

export default function ChallengeComponent({
  title,
  challengeOptions,
  comment,
  loading = false,
}: {
  title: string;
  challengeOptions: Challenge[];
  comment: string;
  loading?: boolean;
}) {
  return (
    <div className="mb-8">
      <div className="mb-3">
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{comment}</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-24 bg-stone-100 dark:bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : challengeOptions.length === 0 ? (
        <div className="flex items-center justify-center py-10 rounded-xl border border-stone-200 dark:border-white/[0.07] bg-stone-50 dark:bg-white/[0.02]">
          <p className="text-sm text-muted-foreground">등록된 도전과제가 없습니다</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {challengeOptions.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>
      )}
    </div>
  );
}
