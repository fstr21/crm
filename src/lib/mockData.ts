// Shared mock data store for all API routes
// This will persist during the development session

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: 'hot' | 'warm' | 'cold';
  value?: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  contact_id?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note';
  title: string;
  description?: string;
  contact_id?: string;
  task_id?: string;
  user_id: string;
  created_at: string;
}

// Mock data (will persist during development session)
export const mockContacts: Contact[] = [
  {
    id: "3b0e2fe1-f2b6-4ec3-8654-af53f03ef409",
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "+1-555-0123",
    company: "Tech Solutions Inc",
    status: "hot",
    value: 50000,
    created_at: "2024-01-10T10:00:00Z",
    updated_at: "2024-01-10T10:00:00Z"
  },
  {
    id: "7c1e3fe2-g3c7-5ed4-9765-bg64g04fg510",
    name: "Jane Doe",
    email: "jane.doe@example.com",
    phone: "+1-555-0124",
    company: "Marketing Pro",
    status: "warm",
    value: 25000,
    created_at: "2024-01-10T11:00:00Z",
    updated_at: "2024-01-10T11:00:00Z"
  },
  {
    id: "8d2f4ge3-h4d8-6fe5-a876-ch75h05gh621",
    name: "Bob Johnson",
    email: "bob.johnson@example.com",
    phone: "+1-555-0125",
    company: "Design Studio",
    status: "cold",
    value: 10000,
    created_at: "2024-01-10T12:00:00Z",
    updated_at: "2024-01-10T12:00:00Z"
  }
];

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Follow up with client',
    description: 'Call client about project status',
    status: 'pending',
    priority: 'high',
    due_date: '2024-01-15',
    contact_id: '1',
    assigned_to: 'user-1',
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-10T10:00:00Z'
  },
  {
    id: '2', 
    title: 'Prepare presentation',
    description: 'Create slides for next meeting',
    status: 'in_progress',
    priority: 'medium',
    due_date: '2024-01-20',
    contact_id: '2',
    assigned_to: 'user-1',
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-10T10:00:00Z'
  }
];

export const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'call',
    title: 'Called client about project',
    description: 'Discussed project timeline and requirements',
    contact_id: '1',
    task_id: '1',
    user_id: 'user-1',
    created_at: '2024-01-10T10:00:00Z'
  },
  {
    id: '2',
    type: 'email',
    title: 'Sent project proposal',
    description: 'Emailed detailed proposal to client',
    contact_id: '2',
    task_id: '2',
    user_id: 'user-1',
    created_at: '2024-01-10T11:00:00Z'
  }
];