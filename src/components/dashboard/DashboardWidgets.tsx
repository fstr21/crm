'use client'

import React from 'react';
import { 
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import RevenueChart from '../charts/RevenueChart';
import ActivityChart from '../charts/ActivityChart';
import { mockContacts, mockActivities, getDashboardStats } from '@/lib/mockData';

interface RecentActivity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'deal';
  title: string;
  description: string;
  time: string;
  user: string;
}

interface Contact {
  id: string;
  name: string;
  company: string;
  email: string;
  status: 'hot' | 'warm' | 'cold';
  value: string;
}

// Convert mock activities to dashboard format
const recentActivities: RecentActivity[] = mockActivities.slice(0, 4).map(activity => {
  const timeAgo = () => {
    const now = new Date();
    const diff = now.getTime() - activity.createdAt.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  return {
    id: activity.id,
    type: activity.type === 'note' ? 'deal' : activity.type,
    title: activity.title,
    description: activity.description,
    time: timeAgo(),
    user: activity.userId === 'user-1' ? 'John Doe' : 'Jane Smith'
  };
});

// Use top 3 contacts from mock data
const recentContacts: Contact[] = mockContacts.slice(0, 3).map(contact => ({
  id: contact.id,
  name: contact.name,
  company: contact.company,
  email: contact.email,
  status: contact.status,
  value: `$${contact.value.toLocaleString()}`
}));

function WelcomeCard() {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Welcome back, John!</h2>
          <p className="text-blue-100 mb-4">You have 12 new leads and 5 meetings today.</p>
          <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors">
            View Schedule
          </button>
        </div>
        <div className="hidden md:block">
          <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <UserIcon className="w-12 h-12 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

function RecentActivitiesCard() {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call':
        return <PhoneIcon className="w-4 h-4" />;
      case 'email':
        return <EnvelopeIcon className="w-4 h-4" />;
      case 'meeting':
        return <CalendarIcon className="w-4 h-4" />;
      case 'deal':
        return <CheckCircleIcon className="w-4 h-4" />;
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'call':
        return 'bg-blue-100 text-blue-600';
      case 'email':
        return 'bg-green-100 text-green-600';
      case 'meeting':
        return 'bg-purple-100 text-purple-600';
      case 'deal':
        return 'bg-orange-100 text-orange-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          View All
        </button>
      </div>
      
      <div className="space-y-4">
        {recentActivities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {activity.title}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {activity.description}
              </p>
              <div className="flex items-center mt-1 text-xs text-gray-400">
                <span>{activity.time}</span>
                <span className="mx-1">•</span>
                <span>{activity.user}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TopContactsCard() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hot':
        return 'bg-red-100 text-red-800';
      case 'warm':
        return 'bg-yellow-100 text-yellow-800';
      case 'cold':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Top Contacts</h3>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          View All
        </button>
      </div>
      
      <div className="space-y-4">
        {recentContacts.map((contact) => (
          <div key={contact.id} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {contact.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                <p className="text-xs text-gray-500">{contact.company}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">{contact.value}</p>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(contact.status)}`}>
                {contact.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuickStatsCard() {
  const stats = [
    { label: 'Tasks Due Today', value: '8', color: 'text-red-600' },
    { label: 'Meetings This Week', value: '24', color: 'text-blue-600' },
    { label: 'Calls Scheduled', value: '12', color: 'text-green-600' },
    { label: 'Follow-ups Pending', value: '6', color: 'text-orange-600' }
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Quick Stats</h3>
        <ArrowTrendingUpIcon className="w-5 h-5 text-gray-400" />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardWidgets() {
  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <WelcomeCard />
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart />
        <ActivityChart />
      </div>
      
      {/* Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <RecentActivitiesCard />
        <TopContactsCard />
        <QuickStatsCard />
      </div>
    </div>
  );
}