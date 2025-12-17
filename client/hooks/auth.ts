import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/shared/api';
import { store } from '@/client/store';
import { setCurrentUser } from '@/client/store/slices/userSlice';
import { setCurrentOrganization } from '@/client/store/slices/organizationSlice';
import { setCurrentOrganizationUnit } from '@/client/store/slices/organizationUnitSlice';
import { useAppDispatch } from '@/client/store/hooks';
import { clearAllData } from '@/client/store';

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { identifier: string; password: string }) => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Login failed');
      return res.json();
    },
    onSuccess: () => {
      // Invalidate and refetch current user, organization, and organization unit
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['currentOrganization'] });
      queryClient.invalidateQueries({ queryKey: ['currentOrganizationUnit'] });
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: { email: string; username: string; password: string; brandName: string }) =>
      api.post('/auth/register', data).then(res => res.data),
  });
}

export function useLogout() {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: () => api.post('/auth/logout').then(res => res.data),
    onSuccess: () => {
      dispatch(clearAllData());
    },
  });
}

export function useCheckAuth() {
  return useQuery({
    queryKey: ['auth'],
    queryFn: () => api.get('/auth/check').then(res => res.data),
    retry: false,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

export function useGetCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const res = await api.get('/auth/me');
      const user = res.data;
      store.dispatch(setCurrentUser(user));
      return user;
    },
    enabled: false,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

export function useGetCurrentOrganization() {
  return useQuery({
    queryKey: ['currentOrganization'],
    queryFn: async () => {
      const res = await fetch('/api/organizations/current', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch organization');
      const reader = res.body?.getReader();
      if (!reader) throw new Error('No stream available');
      const { done, value } = await reader.read();
      if (done) throw new Error('Stream ended prematurely');
      const organization = JSON.parse(new TextDecoder().decode(value));
      store.dispatch(setCurrentOrganization(organization));
      return organization;
    },
    enabled: false,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

export function useGetCurrentOrganizationUnit() {
  return useQuery({
    queryKey: ['currentOrganizationUnit'],
    queryFn: async () => {
      const res = await fetch('/api/organization_units/current', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch organization unit');
      const reader = res.body?.getReader();
      if (!reader) throw new Error('No stream available');
      const { done, value } = await reader.read();
      if (done) throw new Error('Stream ended prematurely');
      const organizationUnit = JSON.parse(new TextDecoder().decode(value));
      store.dispatch(setCurrentOrganizationUnit(organizationUnit));
      return organizationUnit;
    },
    enabled: false,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}