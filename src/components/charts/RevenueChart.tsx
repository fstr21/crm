'use client'

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import { useContacts, useTasks } from '@/lib/dataService';

export default function RevenueChart() {
  const { data: contacts, isLoading: contactsLoading } = useContacts();
  const { data: tasks, isLoading: tasksLoading } = useTasks();
  
  const isLoading = contactsLoading || tasksLoading;
  const hasData = (contacts && contacts.length > 0) || (tasks && tasks.length > 0);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Performance Overview</h3>
          <p className="text-sm text-gray-500">Track your CRM metrics and progress</p>
        </div>
        {hasData && (
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Contacts</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Tasks</span>
            </div>
          </div>
        )}
      </div>
      
      {isLoading ? (
        <div className="h-[300px] flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading performance data...</div>
        </div>
      ) : !hasData ? (
        <div className="h-[300px] flex flex-col items-center justify-center text-center">
          <ChartBarIcon className="w-16 h-16 text-gray-300 mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Data to Display</h4>
          <p className="text-gray-500 text-sm mb-4">Start adding contacts and tasks to see your performance metrics.</p>
          <div className="flex gap-2">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
              Add Contact
            </button>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors">
              Add Task
            </button>
          </div>
        </div>
      ) : (
        <div className="h-[300px] flex flex-col items-center justify-center text-center">
          <ChartBarIcon className="w-16 h-16 text-gray-300 mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">Charts Coming Soon</h4>
          <p className="text-gray-500 text-sm">Performance charts will be available when you have more data.</p>
          <p className="text-gray-400 text-xs mt-2">Continue adding contacts, tasks, and activities to unlock insights.</p>
        </div>
      )}
    </div>
  );
}