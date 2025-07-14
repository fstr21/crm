'use client'

import React from 'react';
import { Activity } from '@/lib/mcpClient';
import { useCreateActivity, useUpdateActivity, useContacts, useTasks } from '@/lib/dataService';
import { useForm } from 'react-hook-form';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ActivityFormProps {
  activity?: Activity | null;
  onClose: () => void;
}

type ActivityFormData = {
  type: 'call' | 'email' | 'meeting' | 'note';
  title: string;
  description?: string;
  contact_id?: string;
  task_id?: string;
  user_id: string;
};

export default function ActivityForm({ activity, onClose }: ActivityFormProps) {
  const createActivityMutation = useCreateActivity();
  const updateActivityMutation = useUpdateActivity();
  const { data: contacts } = useContacts();
  const { data: tasks } = useTasks();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ActivityFormData>({
    defaultValues: activity ? {
      type: activity.type,
      title: activity.title,
      description: activity.description || '',
      contact_id: activity.contact_id || '',
      task_id: activity.task_id || '',
      user_id: activity.user_id,
    } : {
      type: 'note',
      user_id: 'current-user', // In a real app, this would come from auth context
    },
  });

  const onSubmit = async (data: ActivityFormData) => {
    try {
      const activityData = {
        ...data,
        contact_id: data.contact_id || undefined,
        task_id: data.task_id || undefined,
      };

      if (activity) {
        await updateActivityMutation.mutateAsync({
          id: activity.id,
          ...activityData,
        });
      } else {
        await createActivityMutation.mutateAsync(activityData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving activity:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-medium text-gray-900">
            {activity ? 'Edit Activity' : 'Add New Activity'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Type *
            </label>
            <select
              {...register('type', { required: 'Type is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="call">Call</option>
              <option value="email">Email</option>
              <option value="meeting">Meeting</option>
              <option value="note">Note</option>
            </select>
            {errors.type && (
              <p className="text-red-600 text-sm mt-1">{errors.type.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              {...register('title', { required: 'Title is required' })}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter activity title"
            />
            {errors.title && (
              <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter activity description"
            />
          </div>

          <div>
            <label htmlFor="contact_id" className="block text-sm font-medium text-gray-700 mb-1">
              Related Contact
            </label>
            <select
              {...register('contact_id')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a contact</option>
              {contacts?.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.name} - {contact.company}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="task_id" className="block text-sm font-medium text-gray-700 mb-1">
              Related Task
            </label>
            <select
              {...register('task_id')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a task</option>
              {tasks?.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="user_id" className="block text-sm font-medium text-gray-700 mb-1">
              User ID *
            </label>
            <input
              {...register('user_id', { required: 'User ID is required' })}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter user ID"
            />
            {errors.user_id && (
              <p className="text-red-600 text-sm mt-1">{errors.user_id.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : activity ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}