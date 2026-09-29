export const deriveTotalCapacity = (internal, cross) => {
  if (internal === "" || internal == null || cross === "" || cross == null) return null;
  return Number(internal || 0) + Number(cross || 0);
};

export const totalCapacityLabel = (internal, cross) => {
  const total = deriveTotalCapacity(internal, cross);
  return total == null ? "Tanpa batas" : total.toLocaleString("id-ID");
};
