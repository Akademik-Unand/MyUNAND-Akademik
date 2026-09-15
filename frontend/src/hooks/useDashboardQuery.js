import { useQuery } from "@tanstack/react-query";

export const useDashboardQuery = (key, queryFn) =>
  useQuery({ queryKey: ["dashboard", key], queryFn });
