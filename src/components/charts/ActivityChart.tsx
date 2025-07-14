'use client'

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import { useActivities } from '@/lib/dataService';

export default function ActivityChart() {
  const { data: activities, isLoading } = useActivities();
  
  const hasActivities = activities && activities.length > 0;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Activity Summary</h3>
          <p className="text-sm text-gray-500">Track your communication activities</p>
        </div>
        {hasActivities && (
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Calls</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Emails</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Meetings</span>
            </div>
          </div>
        )}
      </div>
      
      {isLoading ? (
        <div className="h-[250px] flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading activity data...</div>
        </div>
      ) : !hasActivities ? (
        <div className="h-[250px] flex flex-col items-center justify-center text-center">
          <ChartBarIcon className="w-16 h-16 text-gray-300 mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Activities Yet</h4>
          <p className="text-gray-500 text-sm mb-4">Start logging your customer interactions to see activity patterns.</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
            Add Activity
          </button>
        </div>
      ) : (
        <div className="h-[250px] flex flex-col items-center justify-center text-center">
          <ChartBarIcon className="w-16 h-16 text-gray-300 mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">Charts Coming Soon</h4>
          <p className="text-gray-500 text-sm">Activity charts will be available when you have more data.</p>
          <p className="text-gray-400 text-xs mt-2">
            You have {activities?.length || 0} activit{activities?.length === 1 ? 'y' : 'ies'} logged.
          </p>
        </div>
      )}
    </div>
  );
}