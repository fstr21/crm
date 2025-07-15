'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import AuthGuard from '@/components/auth/AuthGuard'
import SignupForm from '@/components/auth/SignupForm'

export default function SignupPage() {
  const router = useRouter()

  const handleSignupSuccess = () => {
    router.push('/auth/login')
  }

  const handleSwitchToLogin = () => {
    router.push('/auth/login')
  }

  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Join CRM
            </h1>
            <p className="text-gray-600">
              Create your account to start managing your customer relationships
            </p>
          </div>

          <SignupForm
            onSuccess={handleSignupSuccess}
            onSwitchToLogin={handleSwitchToLogin}
          />
        </div>
      </div>
    </AuthGuard>
  )
}