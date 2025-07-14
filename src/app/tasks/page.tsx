'use client'

import React, { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import TasksList from '@/components/tasks/TasksList';
import TaskForm from '@/components/tasks/TaskForm';
import { useTasks } from '@/lib/dataService';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function TasksPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const { data: tasks, isLoading, error } = useTasks();

  const handleCreateTask = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  const handleEditTask = (task: any) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTask(null);
  };

  if (error) {
    return (
      <DashboardLayout title="Tasks">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          <h3 className="font-bold">Error loading tasks</h3>
          <p>Unable to connect to the server. Please check if the MCP server is running.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Tasks">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
            <p className="text-gray-600">Manage your tasks and activities</p>
          </div>
          <button
            onClick={handleCreateTask}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add Task</span>
          </button>
        </div>

        {/* Tasks List */}
        <TasksList
          tasks={tasks || []}
          isLoading={isLoading}
          onEditTask={handleEditTask}
        />

        {/* Task Form Modal */}
        {isFormOpen && (
          <TaskForm
            task={editingTask}
            onClose={handleCloseForm}
          />
        )}
      </div>
    </DashboardLayout>
  );
}