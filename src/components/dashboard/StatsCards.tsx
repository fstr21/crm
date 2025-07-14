'use client'

import React from 'react';
import { 
  CurrencyDollarIcon,
  BriefcaseIcon,
  UserPlusIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { getDashboardStats } from '@/lib/mockData';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
}

function StatCard({ title, value, change, changeType, icon: Icon, iconBg }: StatCardProps) {
  const changeColorClass = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600'
  }[changeType];

  const changePrefix = changeType === 'positive' ? '+' : changeType === 'negative' ? '-' : '';

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          <p className={`text-sm font-medium ${changeColorClass} flex items-center`}>
            {changePrefix}{change}
            <span className="text-gray-500 ml-1">vs last month</span>
          </p>
        </div>
        <div className={`p-3 rounded-lg ${iconBg}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function StatsCards() {
  const dashboardStats = getDashboardStats();
  
  const stats = [
    {
      title: 'Total Revenue',
      value: `$${dashboardStats.totalRevenue.toLocaleString()}`,
      change: '12.5%',
      changeType: 'positive' as const,
      icon: CurrencyDollarIcon,
      iconBg: 'bg-gradient-to-r from-green-500 to-emerald-600'
    },
    {
      title: 'Active Deals',
      value: dashboardStats.activeDeals.toString(),
      change: '8.2%',
      changeType: 'positive' as const,
      icon: BriefcaseIcon,
      iconBg: 'bg-gradient-to-r from-blue-500 to-cyan-600'
    },
    {
      title: 'New Contacts',
      value: `+${dashboardStats.newContacts}`,
      change: '15.3%',
      changeType: 'positive' as const,
      icon: UserPlusIcon,
      iconBg: 'bg-gradient-to-r from-purple-500 to-pink-600'
    },
    {
      title: 'Conversion Rate',
      value: `${dashboardStats.conversionRate}%`,
      change: '2.1%',
      changeType: 'positive' as const,
      icon: ChartBarIcon,
      iconBg: 'bg-gradient-to-r from-orange-500 to-red-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}