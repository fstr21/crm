'use client'

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  ChartBarIcon, 
  CreditCardIcon,
  UserGroupIcon,
  PresentationChartLineIcon,
  CogIcon,
  BellIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

interface SidebarProps {
  activeItem?: string;
  onItemClick?: (item: string) => void;
}

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: HomeIcon, href: '/' },
  { id: 'contacts', label: 'Contacts', icon: UserGroupIcon, href: '/contacts' },
  { id: 'tasks', label: 'Tasks', icon: ClipboardDocumentListIcon, href: '/tasks' },
  { id: 'activities', label: 'Activities', icon: DocumentTextIcon, href: '/activities' },
  { id: 'reports', label: 'Reports', icon: PresentationChartLineIcon, href: '/reports' },
  { id: 'billing', label: 'Billing', icon: CreditCardIcon, href: '/billing' },
  { id: 'notifications', label: 'Notifications', icon: BellIcon, href: '/notifications' },
  { id: 'settings', label: 'Settings', icon: CogIcon, href: '/settings' },
];

export default function Sidebar({ activeItem, onItemClick }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="w-64 h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 text-white flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-slate-700/50">
        <Link href="/" className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            CRM Pro
          </span>
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || activeItem === item.id;
            
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  onClick={() => onItemClick?.(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/25'
                      : 'hover:bg-slate-800/50 hover:shadow-md'
                  }`}
                >
                  <Icon 
                    className={`w-5 h-5 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                    }`} 
                  />
                  <span className={`font-medium transition-colors ${
                    isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'
                  }`}>
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/50">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">U</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">User</p>
            <p className="text-xs text-slate-400 truncate">CRM Manager</p>
          </div>
          <button className="text-slate-400 hover:text-white transition-colors">
            <CogIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}