// MCP Client for connecting to Supabase MCP server
import axios from 'axios';

const MCP_SERVER_URL = 'http://localhost:3030';

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

class MCPClient {
  private baseURL: string;

  constructor(baseURL: string = MCP_SERVER_URL) {
    this.baseURL = baseURL;
  }

  // Contacts API
  async getContacts(): Promise<Contact[]> {
    try {
      const response = await axios.get(`${this.baseURL}/api/contacts`);
      return response.data;
    } catch (error) {
      console.error('Error fetching contacts:', error);
      throw error;
    }
  }

  async getContact(id: string): Promise<Contact> {
    try {
      const response = await axios.get(`${this.baseURL}/api/contacts/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching contact:', error);
      throw error;
    }
  }

  async createContact(contact: Omit<Contact, 'id' | 'created_at' | 'updated_at'>): Promise<Contact> {
    try {
      const response = await axios.post(`${this.baseURL}/api/contacts`, contact);
      return response.data;
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error;
    }
  }

  async updateContact(id: string, contact: Partial<Contact>): Promise<Contact> {
    try {
      const response = await axios.put(`${this.baseURL}/api/contacts/${id}`, contact);
      return response.data;
    } catch (error) {
      console.error('Error updating contact:', error);
      throw error;
    }
  }

  async deleteContact(id: string): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/api/contacts/${id}`);
    } catch (error) {
      console.error('Error deleting contact:', error);
      throw error;
    }
  }

  // Tasks API
  async getTasks(): Promise<Task[]> {
    try {
      const response = await axios.get(`${this.baseURL}/api/tasks`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  }

  async getTask(id: string): Promise<Task> {
    try {
      const response = await axios.get(`${this.baseURL}/api/tasks/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching task:', error);
      throw error;
    }
  }

  async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    try {
      const response = await axios.post(`${this.baseURL}/api/tasks`, task);
      return response.data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  async updateTask(id: string, task: Partial<Task>): Promise<Task> {
    try {
      const response = await axios.put(`${this.baseURL}/api/tasks/${id}`, task);
      return response.data;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  async deleteTask(id: string): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/api/tasks/${id}`);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  // Activities API
  async getActivities(): Promise<Activity[]> {
    try {
      const response = await axios.get(`${this.baseURL}/api/activities`);
      return response.data;
    } catch (error) {
      console.error('Error fetching activities:', error);
      throw error;
    }
  }

  async getActivity(id: string): Promise<Activity> {
    try {
      const response = await axios.get(`${this.baseURL}/api/activities/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching activity:', error);
      throw error;
    }
  }

  async createActivity(activity: Omit<Activity, 'id' | 'created_at'>): Promise<Activity> {
    try {
      const response = await axios.post(`${this.baseURL}/api/activities`, activity);
      return response.data;
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error;
    }
  }

  async updateActivity(id: string, activity: Partial<Activity>): Promise<Activity> {
    try {
      const response = await axios.put(`${this.baseURL}/api/activities/${id}`, activity);
      return response.data;
    } catch (error) {
      console.error('Error updating activity:', error);
      throw error;
    }
  }

  async deleteActivity(id: string): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/api/activities/${id}`);
    } catch (error) {
      console.error('Error deleting activity:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await axios.get(`${this.baseURL}/api/health`);
      return response.data;
    } catch (error) {
      console.error('Error checking server health:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const mcpClient = new MCPClient();
export default mcpClient;