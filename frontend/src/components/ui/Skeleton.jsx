/**
 * Atomic skeleton placeholder. Shape follows the content it replaces.
 */
export const Skeleton = ({ className = '', ...props }) => {
  return <div className={`skeleton ${className}`} {...props} />;
};
