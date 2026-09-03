/**
 * Read-only key/value rows used inside detail drawers.
 */
export const DetailList = ({ items = [] }) => {
  return (
    <dl className="space-y-3">
      {items.map((item) => (
        <div key={item.label} className="grid grid-cols-3 gap-2 text-sm">
          <dt className="text-base-content/60 col-span-1">{item.label}</dt>
          <dd className="col-span-2 font-medium text-base-content break-words">
            {item.value ?? '—'}
          </dd>
        </div>
      ))}
    </dl>
  );
};
