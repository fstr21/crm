// Mock data for CRM dashboard
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

export const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@techcorp.com',
    company: 'TechCorp Inc.',
    phone: '+1 (555) 123-4567',
    status: 'hot',
    value: 25000,
    createdAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael@startupxyz.com',
    company: 'StartupXYZ',
    phone: '+1 (555) 234-5678',
    status: 'warm',
    value: 12000,
    createdAt: new Date('2024-01-20')
  },
  {
    id: '3',
    name: 'Emily Davis',
    email: 'emily@abcindustries.com',
    company: 'ABC Industries',
    phone: '+1 (555) 345-6789',
    status: 'hot',
    value: 35000,
    createdAt: new Date('2024-01-25')
  },
  {
    id: '4',
    name: 'Robert Smith',
    email: 'robert@globaltech.com',
    company: 'Global Tech Solutions',
    phone: '+1 (555) 456-7890',
    status: 'cold',
    value: 8000,
    createdAt: new Date('2024-02-01')
  },
  {
    id: '5',
    name: 'Lisa Wong',
    email: 'lisa@innovateplus.com',
    company: 'Innovate Plus',
    phone: '+1 (555) 567-8901',
    status: 'warm',
    value: 18000,
    createdAt: new Date('2024-02-05')
  }
];

export const mockDeals: Deal[] = [
  {
    id: '1',
    title: 'Enterprise Software License',
    value: 25000,
    stage: 'negotiation',
    contactId: '1',
    createdAt: new Date('2024-01-15'),
    closeDate: new Date('2024-02-28')
  },
  {
    id: '2',
    title: 'Cloud Migration Project',
    value: 12000,
    stage: 'proposal',
    contactId: '2',
    createdAt: new Date('2024-01-20'),
    closeDate: new Date('2024-03-15')
  },
  {
    id: '3',
    title: 'Security Audit & Implementation',
    value: 35000,
    stage: 'qualified',
    contactId: '3',
    createdAt: new Date('2024-01-25'),
    closeDate: new Date('2024-04-01')
  },
  {
    id: '4',
    title: 'Training & Support Package',
    value: 8000,
    stage: 'lead',
    contactId: '4',
    createdAt: new Date('2024-02-01'),
    closeDate: new Date('2024-03-30')
  },
  {
    id: '5',
    title: 'Custom Development',
    value: 18000,
    stage: 'closed-won',
    contactId: '5',
    createdAt: new Date('2024-02-05'),
    closeDate: new Date('2024-02-20')
  }
];

export const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'call',
    title: 'Discovery Call with Sarah Johnson',
    description: 'Discussed requirements for enterprise software license',
    contactId: '1',
    dealId: '1',
    userId: 'user-1',
    createdAt: new Date('2024-02-10T10:00:00')
  },
  {
    id: '2',
    type: 'email',
    title: 'Proposal sent to Michael Chen',
    description: 'Sent detailed proposal for cloud migration project',
    contactId: '2',
    dealId: '2',
    userId: 'user-1',
    createdAt: new Date('2024-02-09T14:30:00')
  },
  {
    id: '3',
    type: 'meeting',
    title: 'Security Briefing with Emily Davis',
    description: 'Presented security audit findings and recommendations',
    contactId: '3',
    dealId: '3',
    userId: 'user-2',
    createdAt: new Date('2024-02-08T16:00:00')
  },
  {
    id: '4',
    type: 'note',
    title: 'Follow-up required',
    description: 'Need to schedule demo for next week',
    contactId: '4',
    dealId: '4',
    userId: 'user-1',
    createdAt: new Date('2024-02-07T09:15:00')
  },
  {
    id: '5',
    type: 'call',
    title: 'Project kickoff call',
    description: 'Started custom development project with Lisa Wong',
    contactId: '5',
    dealId: '5',
    userId: 'user-2',
    createdAt: new Date('2024-02-06T11:00:00')
  }
];

// Dashboard statistics
export const getDashboardStats = () => {
  const totalRevenue = mockDeals
    .filter(deal => deal.stage === 'closed-won')
    .reduce((sum, deal) => sum + deal.value, 0);
  
  const activeDeals = mockDeals.filter(deal => 
    !['closed-won', 'closed-lost'].includes(deal.stage)
  ).length;
  
  const newContacts = mockContacts.filter(contact => 
    contact.createdAt >= new Date('2024-02-01')
  ).length;
  
  const conversionRate = (mockDeals.filter(d => d.stage === 'closed-won').length / mockDeals.length) * 100;

  return {
    totalRevenue,
    activeDeals,
    newContacts,
    conversionRate: Math.round(conversionRate * 10) / 10
  };
};

// Activity data for charts
export const getActivityData = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(day => ({
    name: day,
    calls: Math.floor(Math.random() * 20) + 5,
    emails: Math.floor(Math.random() * 30) + 10,
    meetings: Math.floor(Math.random() * 8) + 2
  }));
};

// Revenue data for charts
export const getRevenueData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  return months.map(month => ({
    name: month,
    revenue: Math.floor(Math.random() * 5000) + 3000,
    deals: Math.floor(Math.random() * 30) + 15
  }));
};