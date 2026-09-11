import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { Toaster } from "./components/ui/Toaster";
import { AuthBootstrap } from "./components/auth/AuthBootstrap";
import { OrganizationProvider } from "./contexts/OrganizationContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30_000,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthBootstrap />
      <OrganizationProvider>
        <RouterProvider router={router} />
      </OrganizationProvider>
      <Toaster />
    </QueryClientProvider>
  );
}
