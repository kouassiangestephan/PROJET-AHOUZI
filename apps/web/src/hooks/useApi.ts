import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export function useList<T>(endpoint: string, params?: Record<string, any>) {
  return useQuery<{ data: T[]; pagination?: any }>({
    queryKey: [endpoint, params],
    queryFn: async () => {
      const res = await api.get(endpoint, { params });
      return res.data;
    },
  });
}

export function useOne<T>(endpoint: string, id?: string) {
  return useQuery<{ data: T }>({
    queryKey: [endpoint, id],
    queryFn: async () => {
      const res = await api.get(`${endpoint}/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreate<T>(endpoint: string) {
  const queryClient = useQueryClient();
  return useMutation<{ data: T; message: string }, Error, Partial<T>>({
    mutationFn: async (data) => {
      const res = await api.post(endpoint, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [endpoint] });
    },
  });
}

export function useUpdate<T>(endpoint: string) {
  const queryClient = useQueryClient();
  return useMutation<{ data: T; message: string }, Error, { id: string; data: Partial<T> }>({
    mutationFn: async ({ id, data }) => {
      const res = await api.patch(`${endpoint}/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [endpoint] });
    },
  });
}

export function useAction(endpoint: string) {
  const queryClient = useQueryClient();
  return useMutation<any, Error, { id: string; action: string; data?: any }>({
    mutationFn: async ({ id, action, data }) => {
      const res = await api.patch(`${endpoint}/${id}/${action}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [endpoint] });
    },
  });
}
