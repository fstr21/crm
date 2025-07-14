'use client'

import React from 'react';
import { 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  type?: 'default' | 'coming-soon' | 'maintenance';
}

export default function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction,
  type = 'default'
}: EmptyStateProps) {
  const getIcon = () => {
    if (Icon) return Icon;
    
    switch (type) {
      case 'coming-soon':
        return InformationCircleIcon;
      case 'maintenance':
        return WrenchScrewdriverIcon;
      default:
        return ExclamationTriangleIcon;
    }
  };

  const IconComponent = getIcon();

  const getIconColor = () => {
    switch (type) {
      case 'coming-soon':
        return 'text-blue-300';
      case 'maintenance':
        return 'text-orange-300';
      default:
        return 'text-gray-300';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-12 text-center">
      <div className={`mb-6 ${getIconColor()}`}>
        <IconComponent className="w-16 h-16 mx-auto" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      {actionLabel && onAction && (
        <button 
          onClick={onAction}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}