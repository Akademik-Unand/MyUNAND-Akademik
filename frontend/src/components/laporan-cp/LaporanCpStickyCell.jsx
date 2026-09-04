export const LaporanCpStickyCell = ({ rowSpan, children, style, className = '' }) => (
  <td
    rowSpan={rowSpan > 1 ? rowSpan : undefined}
    className={`align-top max-w-xs bg-base-100 ${className}`}
  >
    <div className="sticky z-20 bg-base-100 py-2" style={style}>
      {children}
    </div>
  </td>
);
