export function SchedulingSkeleton() {
  return (
    <div className="space-y-5" aria-label="Memuat penjadwalan">
      <div className="skeleton h-8 w-72" />
      <div className="grid grid-cols-2 gap-4">
        <div className="skeleton h-12" />
        <div className="skeleton h-12" />
      </div>
      <div className="skeleton h-10 w-full" />
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="skeleton h-12 w-full" />
      ))}
    </div>
  );
}
