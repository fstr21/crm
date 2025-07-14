'use client'

import React, { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ActivitiesList from '@/components/activities/ActivitiesList';
import ActivityForm from '@/components/activities/ActivityForm';
import { useActivities } from '@/lib/dataService';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function ActivitiesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const { data: activities, isLoading, error } = useActivities();

  const handleCreateActivity = () => {
    setEditingActivity(null);
    setIsFormOpen(true);
  };

  const handleEditActivity = (activity: any) => {
    setEditingActivity(activity);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingActivity(null);
  };

  if (error) {
    return (
      <DashboardLayout title="Activities">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          <h3 className="font-bold">Error loading activities</h3>
          <p>Unable to connect to the server. Please check if the MCP server is running.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Activities">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Activities</h1>
            <p className="text-gray-600">Track all your customer interactions</p>
          </div>
          <button
            onClick={handleCreateActivity}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add Activity</span>
          </button>
        </div>

        {/* Activities List */}
        <ActivitiesList
          activities={activities || []}
          isLoading={isLoading}
          onEditActivity={handleEditActivity}
        />

        {/* Activity Form Modal */}
        {isFormOpen && (
          <ActivityForm
            activity={editingActivity}
            onClose={handleCloseForm}
          />
        )}
      </div>
    </DashboardLayout>
  );
}