/**
 * Tab pill DaisyUI 5 (`tabs-box`).
 * @param {{ items: { id: string, label: string }[], value: string, onChange: (id: string) => void }} props
 */
export const PillTabs = ({ items = [], value, onChange }) => (
  <div role="tablist" className="tabs tabs-box w-fit bg-base-200">
    {items.map((item) => (
      <button
        key={item.id}
        type="button"
        role="tab"
        className={`tab ${value === item.id ? 'tab-active' : ''}`}
        onClick={() => onChange(item.id)}
      >
        {item.label}
      </button>
    ))}
  </div>
);
