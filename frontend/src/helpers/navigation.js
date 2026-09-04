import { can } from '../policies/defineAbility';

const isAllowed = (user, item) => {
  if (!item?.permission) return true;
  return can(user, item.permission.action, item.permission.subject);
};

export const filterNavigation = (menu, user) =>
  (menu || [])
    .map((item) => {
      if (item.type === 'link') {
        return isAllowed(user, item) ? item : null;
      }

      if (item.type === 'group') {
        const items = (item.items || [])
          .map((sub) => {
            if (sub.children) {
              const children = sub.children.filter((child) => isAllowed(user, child));
              if (!children.length) return null;
              return { ...sub, children };
            }
            return isAllowed(user, sub) ? sub : null;
          })
          .filter(Boolean);

        if (!items.length) return null;
        return { ...item, items };
      }

      return item;
    })
    .filter(Boolean);
