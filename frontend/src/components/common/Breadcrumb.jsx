import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export const Breadcrumb = ({ items = [] }) => {
  return (
    <nav className="text-xs breadcrumbs py-0 text-base-content/60">
      <ul>
        <li>
          <Link to="/" className="inline-flex items-center gap-1 hover:text-primary transition-colors">
            <Home size={13} />
            <span>Dashboard</span>
          </Link>
        </li>
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={idx}>
              {isLast || !item.path ? (
                <span className="font-semibold text-base-content">{item.label}</span>
              ) : (
                <Link to={item.path} className="hover:text-primary transition-colors">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
