// Data service layer using React Query for CRM operations
import { useQuery, useMutation, useQueryClient } from 'react-query';
import mcpClient, { Contact, Task, Activity } from './mcpClient';

// Query keys
export const QUERY_KEYS = {
  CONTACTS: 'contacts',
  CONTACT: 'contact',
  TASKS: 'tasks',
  TASK: 'task',
  ACTIVITIES: 'activities',
  ACTIVITY: 'activity',
  HEALTH: 'health',
} as const;

// Contacts hooks
export function useContacts() {
  return useQuery({
    queryKey: [QUERY_KEYS.CONTACTS],
    queryFn: () => mcpClient.getContacts(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useContact(id: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.CONTACT, id],
    queryFn: () => mcpClient.getContact(id),
    enabled: !!id,
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (contact: Omit<Contact, 'id' | 'created_at' | 'updated_at'>) =>
      mcpClient.createContact(contact),
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.CONTACTS]);
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...contact }: { id: string } & Partial<Contact>) =>
      mcpClient.updateContact(id, contact),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries([QUERY_KEYS.CONTACTS]);
      queryClient.invalidateQueries([QUERY_KEYS.CONTACT, variables.id]);
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => mcpClient.deleteContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.CONTACTS]);
    },
  });
}

// Tasks hooks
export function useTasks() {
  return useQuery({
    queryKey: [QUERY_KEYS.TASKS],
    queryFn: () => mcpClient.getTasks(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.TASK, id],
    queryFn: () => mcpClient.getTask(id),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) =>
      mcpClient.createTask(task),
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.TASKS]);
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...task }: { id: string } & Partial<Task>) =>
      mcpClient.updateTask(id, task),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries([QUERY_KEYS.TASKS]);
      queryClient.invalidateQueries([QUERY_KEYS.TASK, variables.id]);
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => mcpClient.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.TASKS]);
    },
  });
}

// Activities hooks
export function useActivities() {
  return useQuery({
    queryKey: [QUERY_KEYS.ACTIVITIES],
    queryFn: () => mcpClient.getActivities(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useActivity(id: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.ACTIVITY, id],
    queryFn: () => mcpClient.getActivity(id),
    enabled: !!id,
  });
}

export function useCreateActivity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (activity: Omit<Activity, 'id' | 'created_at'>) =>
      mcpClient.createActivity(activity),
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.ACTIVITIES]);
    },
  });
}

export function useUpdateActivity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...activity }: { id: string } & Partial<Activity>) =>
      mcpClient.updateActivity(id, activity),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries([QUERY_KEYS.ACTIVITIES]);
      queryClient.invalidateQueries([QUERY_KEYS.ACTIVITY, variables.id]);
    },
  });
}

export function useDeleteActivity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => mcpClient.deleteActivity(id),
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.ACTIVITIES]);
    },
  });
}

// Health check hook
export function useHealthCheck() {
  return useQuery({
    queryKey: [QUERY_KEYS.HEALTH],
    queryFn: () => mcpClient.healthCheck(),
    refetchInterval: 30000, // Check every 30 seconds
    retry: 1,
  });
}