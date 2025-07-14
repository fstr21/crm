// Mock data types for CRM - kept for reference and potential future development
// Most mock data has been removed in favor of real API integration

export interface Contact {
  id: string;
  name: string;
  email: string;
  company: string;
  phone?: string;
  status: 'hot' | 'warm' | 'cold';
  value: number;
  createdAt: Date;
}

export interface Deal {
  id: string;
  title: string;
  value: number;
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  contactId: string;
  createdAt: Date;
  closeDate?: Date;
}

export interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note';
  title: string;
  description: string;
  contactId?: string;
  dealId?: string;
  userId: string;
  createdAt: Date;
}

// Note: Mock data arrays removed - using real API data instead
// All dashboard components now use real data from the MCP server