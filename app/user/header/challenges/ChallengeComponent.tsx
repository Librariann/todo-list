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
        <h2 className="friendly-heading text-xl font-bold text-foreground">{title}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{comment}</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : challengeOptions.length === 0 ? (
        <div className="flex items-center justify-center rounded-2xl border border-border bg-muted/50 py-10">
          <p className="text-sm text-muted-foreground">새로운 도전을 준비하고 있어요</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {challengeOptions.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>
      )}
    </div>
  );
}
