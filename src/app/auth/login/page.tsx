'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import AuthGuard from '@/components/auth/AuthGuard'
import LoginForm from '@/components/auth/LoginForm'
import SignupForm from '@/components/auth/SignupForm'

export default function LoginPage() {
  const [showSignup, setShowSignup] = useState(false)
  const router = useRouter()

  const handleLoginSuccess = () => {
    router.push('/dashboard')
  }

  const handleSignupSuccess = () => {
    setShowSignup(false)
  }

  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to CRM
            </h1>
            <p className="text-gray-600">
              {showSignup ? 'Create your account to get started' : 'Sign in to your account'}
            </p>
          </div>

          {showSignup ? (
            <SignupForm
              onSuccess={handleSignupSuccess}
              onSwitchToLogin={() => setShowSignup(false)}
            />
          ) : (
            <LoginForm
              onSuccess={handleLoginSuccess}
              onSwitchToSignup={() => setShowSignup(true)}
            />
          )}
        </div>
      </div>
    </AuthGuard>
  )
}