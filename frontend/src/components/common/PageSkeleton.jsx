import { Skeleton } from '../ui/Skeleton';
import { Card } from '../ui/Card';
import { TableSkeleton } from './TableSkeleton';

/**
 * Page-level skeleton: header, optional filter card, then table/cards.
 */
export const PageSkeleton = ({ showFilter = true, cards = 0, tableCols = 5 }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-3 w-72" />
        </div>
        <Skeleton className="h-8 w-36" />
      </div>

      {showFilter && (
        <Card>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </Card>
      )}

      {cards > 0 ? (
        <div className="space-y-4">
          {Array.from({ length: cards }).map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-5 w-24 mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <TableSkeleton cols={tableCols} />
        </Card>
      )}
    </div>
  );
};
