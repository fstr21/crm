'use client'

import React, { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { 
  ChartBarIcon, 
  UserGroupIcon, 
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

export default function ReportsPage() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');

  const reportCategories = [
    {
      title: 'Contact Reports',
      icon: UserGroupIcon,
      description: 'Analyze your contact database and relationship metrics',
      reports: [
        { name: 'Contact Growth', description: 'Track new contacts over time' },
        { name: 'Contact Sources', description: 'Analyze where contacts come from' },
        { name: 'Contact Activity', description: 'See most active contacts' },
        { name: 'Contact Segments', description: 'Break down contacts by categories' }
      ]
    },
    {
      title: 'Task Reports',
      icon: ClipboardDocumentListIcon,
      description: 'Monitor task completion and productivity metrics',
      reports: [
        { name: 'Task Completion Rate', description: 'Track completed vs pending tasks' },
        { name: 'Task Distribution', description: 'See task assignment patterns' },
        { name: 'Overdue Tasks', description: 'Monitor missed deadlines' },
        { name: 'Task Performance', description: 'Analyze completion times' }
      ]
    },
    {
      title: 'Activity Reports',
      icon: DocumentTextIcon,
      description: 'Review customer interactions and engagement',
      reports: [
        { name: 'Activity Timeline', description: 'View all activities chronologically' },
        { name: 'Communication Frequency', description: 'Track interaction patterns' },
        { name: 'Activity Types', description: 'Break down by activity categories' },
        { name: 'Engagement Metrics', description: 'Measure customer engagement' }
      ]
    },
    {
      title: 'Performance Reports',
      icon: ArrowTrendingUpIcon,
      description: 'Track overall CRM performance and trends',
      reports: [
        { name: 'Productivity Dashboard', description: 'Overall team performance metrics' },
        { name: 'Conversion Rates', description: 'Track lead to customer conversion' },
        { name: 'Response Times', description: 'Monitor communication response times' },
        { name: 'Growth Trends', description: 'Analyze business growth patterns' }
      ]
    }
  ];

  const timeRanges = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' },
    { value: '1y', label: 'Last year' },
    { value: 'custom', label: 'Custom range' }
  ];

  return (
    <DashboardLayout title="Reports">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600">Generate insights from your CRM data</p>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex items-center space-x-3">
            <label className="text-sm font-medium text-gray-700">Time Range:</label>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {timeRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900">16</p>
              </div>
              <ChartBarIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900">4</p>
              </div>
              <CalendarDaysIcon className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Last Generated</p>
                <p className="text-2xl font-bold text-gray-900">Today</p>
              </div>
              <CalendarDaysIcon className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Export Format</p>
                <p className="text-2xl font-bold text-gray-900">PDF</p>
              </div>
              <ArrowDownTrayIcon className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Report Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {reportCategories.map((category, index) => {
            const Icon = category.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{category.title}</h3>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="space-y-3">
                    {category.reports.map((report, reportIndex) => (
                      <div key={reportIndex} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer group">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-900">
                            {report.name}
                          </h4>
                          <p className="text-xs text-gray-600 group-hover:text-blue-700">
                            {report.description}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                            <ArrowDownTrayIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Coming Soon Notice */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <ChartBarIcon className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900">Interactive Reports Coming Soon</h3>
              <p className="text-blue-700 mt-1">
                The reports shown above are currently in development. Soon you'll be able to generate, 
                customize, and export detailed analytics reports. Features will include:
              </p>
              <ul className="list-disc list-inside text-sm text-blue-600 mt-3 space-y-1">
                <li>Interactive charts and graphs</li>
                <li>Custom date ranges and filters</li>
                <li>Multiple export formats (PDF, Excel, CSV)</li>
                <li>Scheduled report delivery</li>
                <li>Real-time data updates</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}