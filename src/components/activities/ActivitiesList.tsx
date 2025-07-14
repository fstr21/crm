'use client'

import React from 'react';
import { Activity } from '@/lib/mcpClient';
import { useDeleteActivity } from '@/lib/dataService';
import { 
  PencilIcon, 
  TrashIcon, 
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface ActivitiesListProps {
  activities: Activity[];
  isLoading: boolean;
  onEditActivity: (activity: Activity) => void;
}

export default function ActivitiesList({ activities, isLoading, onEditActivity }: ActivitiesListProps) {
  const deleteActivityMutation = useDeleteActivity();

  const handleDeleteActivity = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      try {
        await deleteActivityMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting activity:', error);
      }
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call':
        return <PhoneIcon className="w-5 h-5" />;
      case 'email':
        return <EnvelopeIcon className="w-5 h-5" />;
      case 'meeting':
        return <CalendarIcon className="w-5 h-5" />;
      case 'note':
        return <DocumentTextIcon className="w-5 h-5" />;
      default:
        return <DocumentTextIcon className="w-5 h-5" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'call':
        return 'bg-green-100 text-green-800';
      case 'email':
        return 'bg-blue-100 text-blue-800';
      case 'meeting':
        return 'bg-purple-100 text-purple-800';
      case 'note':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex space-x-4">
              <div className="rounded-full bg-gray-300 h-10 w-10"></div>
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="text-gray-300 mb-6">
          <DocumentTextIcon className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">No activities yet</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Keep track of all your customer interactions. Log calls, meetings, emails, and notes to maintain a complete history.
        </p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
          Log Your First Activity
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Activity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {activities.map((activity) => (
              <tr key={activity.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </div>
                      {activity.description && (
                        <div className="text-sm text-gray-500 mt-1">
                          {activity.description}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActivityColor(activity.type)}`}>
                    {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {activity.user_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(activity.created_at), 'MMM d, yyyy HH:mm')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEditActivity(activity)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded"
                      title="Edit activity"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteActivity(activity.id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded"
                      title="Delete activity"
                      disabled={deleteActivityMutation.isLoading}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}