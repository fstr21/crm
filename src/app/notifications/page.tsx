'use client'

import React, { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { 
  BellIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  CogIcon,
  XMarkIcon,
  EllipsisVerticalIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

export default function NotificationsPage() {
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'task',
      title: 'Task Overdue',
      message: 'Follow up with Sarah Johnson is 2 days overdue',
      time: '2 hours ago',
      read: false,
      priority: 'high',
      icon: ClipboardDocumentListIcon,
      actionable: true
    },
    {
      id: 2,
      type: 'contact',
      title: 'New Contact Added',
      message: 'Michael Chen was added to your contact list',
      time: '4 hours ago',
      read: false,
      priority: 'medium',
      icon: UserGroupIcon,
      actionable: false
    },
    {
      id: 3,
      type: 'system',
      title: 'Weekly Report Ready',
      message: 'Your weekly CRM performance report is available for download',
      time: '1 day ago',
      read: true,
      priority: 'low',
      icon: InformationCircleIcon,
      actionable: true
    },
    {
      id: 4,
      type: 'task',
      title: 'Task Completed',
      message: 'Email campaign for Q4 launch has been marked as complete',
      time: '1 day ago',
      read: true,
      priority: 'low',
      icon: CheckCircleIcon,
      actionable: false
    },
    {
      id: 5,
      type: 'system',
      title: 'Storage Warning',
      message: 'Your account is approaching the storage limit (85% used)',
      time: '2 days ago',
      read: false,
      priority: 'high',
      icon: ExclamationTriangleIcon,
      actionable: true
    },
    {
      id: 6,
      type: 'contact',
      title: 'Contact Activity',
      message: 'John Smith opened your last email 3 times',
      time: '3 days ago',
      read: true,
      priority: 'medium',
      icon: UserGroupIcon,
      actionable: true
    }
  ]);

  const filters = [
    { value: 'all', label: 'All', count: notifications.length },
    { value: 'unread', label: 'Unread', count: notifications.filter(n => !n.read).length },
    { value: 'task', label: 'Tasks', count: notifications.filter(n => n.type === 'task').length },
    { value: 'contact', label: 'Contacts', count: notifications.filter(n => n.type === 'contact').length },
    { value: 'system', label: 'System', count: notifications.filter(n => n.type === 'system').length }
  ];

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'task': return 'text-purple-600 bg-purple-100';
      case 'contact': return 'text-green-600 bg-green-100';
      case 'system': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <DashboardLayout title="Notifications">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600">Stay updated with important alerts and system updates</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={markAllAsRead}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Mark All Read
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
              <CogIcon className="w-5 h-5" />
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
              </div>
              <BellIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-red-600">{notifications.filter(n => !n.read).length}</p>
              </div>
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-orange-600">{notifications.filter(n => n.priority === 'high').length}</p>
              </div>
              <ExclamationTriangleIcon className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Actionable</p>
                <p className="text-2xl font-bold text-green-600">{notifications.filter(n => n.actionable).length}</p>
              </div>
              <ClipboardDocumentListIcon className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className="lg:w-64">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <FunnelIcon className="w-5 h-5 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  {filters.map((filterOption) => (
                    <button
                      key={filterOption.value}
                      onClick={() => setFilter(filterOption.value)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                        filter === filterOption.value
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-sm font-medium">{filterOption.label}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        filter === filterOption.value
                          ? 'bg-blue-200 text-blue-800'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {filterOption.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {filter === 'all' ? 'All Notifications' : 
                   filter === 'unread' ? 'Unread Notifications' :
                   filter.charAt(0).toUpperCase() + filter.slice(1) + ' Notifications'}
                </h3>
                <p className="text-sm text-gray-600">
                  {filteredNotifications.length} {filteredNotifications.length === 1 ? 'notification' : 'notifications'}
                </p>
              </div>
              
              <div className="divide-y divide-gray-200">
                {filteredNotifications.length === 0 ? (
                  <div className="p-12 text-center">
                    <BellIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                    <p className="text-gray-500">You're all caught up! No {filter} notifications to show.</p>
                  </div>
                ) : (
                  filteredNotifications.map((notification) => {
                    const Icon = notification.icon;
                    return (
                      <div
                        key={notification.id}
                        className={`p-6 hover:bg-gray-50 transition-colors ${
                          !notification.read ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getTypeColor(notification.type)}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h4 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                    {notification.title}
                                  </h4>
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                  )}
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                                    {notification.priority}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                                <p className="text-xs text-gray-500">{notification.time}</p>
                              </div>
                              
                              <div className="flex items-center space-x-2 ml-4">
                                {notification.actionable && (
                                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                    View
                                  </button>
                                )}
                                {!notification.read && (
                                  <button
                                    onClick={() => markAsRead(notification.id)}
                                    className="text-gray-400 hover:text-gray-600"
                                    title="Mark as read"
                                  >
                                    <CheckCircleIcon className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => deleteNotification(notification.id)}
                                  className="text-gray-400 hover:text-red-600"
                                  title="Delete notification"
                                >
                                  <XMarkIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings Preview */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <CogIcon className="w-6 h-6 text-purple-600 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-purple-900">Notification System Features</h3>
              <p className="text-purple-700 mt-1">
                This notification center demonstrates a comprehensive alert management system. In a full implementation, it would include:
              </p>
              <ul className="list-disc list-inside text-sm text-purple-600 mt-3 space-y-1">
                <li>Real-time push notifications and email alerts</li>
                <li>Customizable notification preferences by category</li>
                <li>Smart batching and digest options</li>
                <li>Integration with calendar and task reminders</li>
                <li>Webhook support for external system notifications</li>
                <li>Mobile app push notification sync</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}