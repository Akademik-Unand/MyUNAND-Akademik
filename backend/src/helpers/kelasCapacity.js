'use strict';

// NULL means the participant group is unbounded; in that case the combined
// capacity must remain unbounded (stored as 0 by the existing class logic).
const deriveTotalCapacity = (internal, cross) => {
  if (internal === null || internal === undefined || cross === null || cross === undefined) return 0;
  return Number(internal || 0) + Number(cross || 0);
};

module.exports = { deriveTotalCapacity };
