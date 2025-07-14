'use client'

import React from 'react';
import { 
  BellIcon, 
  MagnifyingGlassIcon,
  UserCircleIcon 
} from '@heroicons/react/24/outline';

interface HeaderProps {
  title?: string;
  showSearch?: boolean;
}

export default function Header({ title = "Dashboard", showSearch = true }: HeaderProps) {
  return (
    <header className="hidden lg:block bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left: Title and Breadcrumb */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back, John! Here's what's happening today.</p>
        </div>

        {/* Right: Search, Notifications, Profile */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          {showSearch && (
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-64"
              />
            </div>
          )}

          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <BellIcon className="w-6 h-6" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Profile */}
          <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors">
            <UserCircleIcon className="w-8 h-8 text-gray-400" />
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-gray-700">John Doe</p>
              <p className="text-xs text-gray-500">Sales Manager</p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}