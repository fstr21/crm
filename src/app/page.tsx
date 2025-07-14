'use client'

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import StatsCards from '@/components/dashboard/StatsCards';
import DashboardWidgets from '@/components/dashboard/DashboardWidgets';
import { useHealthCheck } from '@/lib/dataService';

export default function Home() {
  const { data: healthData, isLoading: healthLoading, error: healthError } = useHealthCheck();

  return (
    <DashboardLayout title="Dashboard">
      {/* MCP Server Status Banner */}
      <div className={`border px-4 py-3 rounded-lg mb-6 ${
        healthError 
          ? 'bg-red-100 border-red-400 text-red-700'
          : healthLoading
          ? 'bg-yellow-100 border-yellow-400 text-yellow-700'
          : 'bg-green-100 border-green-400 text-green-700'
      }`}>
        <p className="font-bold">
          {healthError ? '❌ MCP Server Disconnected' : healthLoading ? '🔄 Checking MCP Server...' : '✅ MCP Server Connected'}
        </p>
        <p className="text-sm">
          {healthError 
            ? 'Unable to connect to the Supabase MCP server. Please ensure it\'s running on port 3030.'
            : healthLoading
            ? 'Verifying connection to the backend services...'
            : `Connected to Supabase MCP server. Last check: ${healthData?.timestamp ? new Date(healthData.timestamp).toLocaleTimeString() : 'now'}`
          }
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards />
      
      {/* Dashboard Widgets */}
      <DashboardWidgets />
    </DashboardLayout>
  )
}
