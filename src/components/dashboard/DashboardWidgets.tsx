'use client'

import React from 'react';
import { 
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import RevenueChart from '../charts/RevenueChart';
import ActivityChart from '../charts/ActivityChart';
import { useContacts, useActivities, useTasks } from '@/lib/dataService';

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

// Helper function to calculate time ago
const getTimeAgo = (date: string) => {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return 'Just now';
};

function WelcomeCard() {
  const { data: tasks } = useTasks();
  const { data: activities } = useActivities();
  
  const todayTasks = tasks?.filter(task => {
    if (!task.due_date) return false;
    const today = new Date().toDateString();
    return new Date(task.due_date).toDateString() === today;
  }).length || 0;
  
  const recentActivities = activities?.filter(activity => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(activity.created_at) >= today;
  }).length || 0;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Welcome to your CRM</h2>
          <p className="text-blue-100 mb-4">
            {todayTasks > 0 || recentActivities > 0 
              ? `You have ${todayTasks} task${todayTasks !== 1 ? 's' : ''} due today and ${recentActivities} recent activit${recentActivities !== 1 ? 'ies' : 'y'}.`
              : 'Start by adding your contacts, tasks, and activities.'
            }
          </p>
          <div className="flex gap-2">
            <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors text-sm">
              Add Contact
            </button>
            <button className="bg-blue-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-800 transition-colors text-sm">
              Add Task
            </button>
          </div>
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
  const { data: activities, isLoading } = useActivities();
  
  const recentActivities = activities?.slice(0, 4) || [];
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call':
        return <PhoneIcon className="w-4 h-4" />;
      case 'email':
        return <EnvelopeIcon className="w-4 h-4" />;
      case 'meeting':
        return <CalendarIcon className="w-4 h-4" />;
      case 'note':
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
      case 'note':
        return 'bg-orange-100 text-orange-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start space-x-3 animate-pulse">
              <div className="w-8 h-8 bg-gray-300 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
        {recentActivities.length > 0 && (
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View All
          </button>
        )}
      </div>
      
      {recentActivities.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircleIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500 text-sm">No recent activities</p>
          <p className="text-gray-400 text-xs">Start by adding some activities</p>
        </div>
      ) : (
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
                  <span>{getTimeAgo(activity.created_at)}</span>
                  <span className="mx-1">•</span>
                  <span>User {activity.user_id}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TopContactsCard() {
  const { data: contacts, isLoading } = useContacts();
  
  const topContacts = contacts?.slice(0, 3) || [];
  
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

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Contacts</h3>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 animate-pulse">
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Contacts</h3>
        {topContacts.length > 0 && (
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View All
          </button>
        )}
      </div>
      
      {topContacts.length === 0 ? (
        <div className="text-center py-8">
          <UserIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500 text-sm">No contacts yet</p>
          <p className="text-gray-400 text-xs">Add your first contact to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {topContacts.map((contact) => (
            <div key={contact.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {contact.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                  <p className="text-xs text-gray-500">{contact.company || 'No company'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {contact.value ? `$${contact.value.toLocaleString()}` : '-'}
                </p>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(contact.status)}`}>
                  {contact.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function QuickStatsCard() {
  const { data: tasks, isLoading: tasksLoading } = useTasks();
  const { data: activities, isLoading: activitiesLoading } = useActivities();
  
  const isLoading = tasksLoading || activitiesLoading;
  
  // Calculate real quick stats
  const todayTasks = tasks?.filter(task => {
    if (!task.due_date) return false;
    const today = new Date().toDateString();
    return new Date(task.due_date).toDateString() === today;
  }).length || 0;
  
  const weeklyMeetings = activities?.filter(activity => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return activity.type === 'meeting' && new Date(activity.created_at) >= weekAgo;
  }).length || 0;
  
  const weeklyCalls = activities?.filter(activity => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return activity.type === 'call' && new Date(activity.created_at) >= weekAgo;
  }).length || 0;
  
  const pendingTasks = tasks?.filter(task => task.status === 'pending').length || 0;

  const stats = [
    { label: 'Tasks Due Today', value: isLoading ? '...' : todayTasks.toString(), color: 'text-red-600' },
    { label: 'Meetings This Week', value: isLoading ? '...' : weeklyMeetings.toString(), color: 'text-blue-600' },
    { label: 'Calls This Week', value: isLoading ? '...' : weeklyCalls.toString(), color: 'text-green-600' },
    { label: 'Pending Tasks', value: isLoading ? '...' : pendingTasks.toString(), color: 'text-orange-600' }
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