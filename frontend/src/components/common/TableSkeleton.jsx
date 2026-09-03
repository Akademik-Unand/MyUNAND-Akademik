import { Skeleton } from '../ui/Skeleton';

/**
 * Table-shaped skeleton matching DataTable layout.
 */
export const TableSkeleton = ({ rows = 6, cols = 5 }) => {
  return (
    <div className="w-full overflow-x-auto">
      <table className="table table-sm w-full">
        <thead>
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i}>
                <Skeleton className="h-3 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c}>
                  <Skeleton className="h-4 w-full" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
