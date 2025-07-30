import { QueryClient } from "@tanstack/react-query";

const defaultQueryFn = async ({ queryKey }: any) => {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(queryKey[0], {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    },
  });
  
  if (!response.ok) {
    throw new Error(`${response.status}: ${response.statusText}`);
  }
  
  return response.json();
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Helper function for API requests
export async function apiRequest(
  method: string,
  endpoint: string,
  body?: any
): Promise<Response> {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(endpoint, {
    method,
    headers: {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : '',
    },
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${response.status}: ${errorText}`);
  }

  return response;
}