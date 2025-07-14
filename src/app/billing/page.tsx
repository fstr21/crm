'use client'

import React, { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { 
  CreditCardIcon,
  BanknotesIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowDownTrayIcon,
  CogIcon
} from '@heroicons/react/24/outline';

export default function BillingPage() {
  const [selectedPlan, setSelectedPlan] = useState('pro');

  const currentPlan = {
    name: 'Professional',
    price: 29,
    period: 'month',
    features: [
      'Up to 1,000 contacts',
      'Unlimited tasks and activities', 
      'Advanced reporting',
      'Email support',
      'Custom fields',
      'API access'
    ],
    nextBilling: '2024-08-15',
    status: 'active'
  };

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 9,
      period: 'month',
      features: [
        'Up to 100 contacts',
        'Basic task management',
        'Standard reports',
        'Email support'
      ],
      recommended: false
    },
    {
      id: 'pro',
      name: 'Professional',
      price: 29,
      period: 'month',
      features: [
        'Up to 1,000 contacts',
        'Unlimited tasks and activities',
        'Advanced reporting',
        'Priority support',
        'Custom fields',
        'API access'
      ],
      recommended: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 99,
      period: 'month',
      features: [
        'Unlimited contacts',
        'All pro features',
        'Advanced analytics',
        '24/7 phone support',
        'Custom integrations',
        'Dedicated account manager'
      ],
      recommended: false
    }
  ];

  const recentInvoices = [
    {
      id: 'INV-2024-001',
      date: '2024-07-15',
      amount: 29.00,
      status: 'paid',
      description: 'Professional Plan - July 2024'
    },
    {
      id: 'INV-2024-002',
      date: '2024-06-15',
      amount: 29.00,
      status: 'paid',
      description: 'Professional Plan - June 2024'
    },
    {
      id: 'INV-2024-003',
      date: '2024-05-15',
      amount: 29.00,
      status: 'paid',
      description: 'Professional Plan - May 2024'
    }
  ];

  const paymentMethod = {
    type: 'Visa',
    last4: '4242',
    expiry: '12/26',
    isDefault: true
  };

  return (
    <DashboardLayout title="Billing">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
            <p className="text-gray-600">Manage your subscription, payment methods, and billing history</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <CogIcon className="w-5 h-5" />
            <span>Billing Settings</span>
          </button>
        </div>

        {/* Current Subscription */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <CreditCardIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900">Current Plan: {currentPlan.name}</h3>
                <p className="text-blue-700">Active subscription</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-700">Active</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600">Monthly Cost</p>
              <p className="text-2xl font-bold text-gray-900">${currentPlan.price}</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600">Next Billing Date</p>
              <p className="text-lg font-semibold text-gray-900">{currentPlan.nextBilling}</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600">Payment Method</p>
              <p className="text-lg font-semibold text-gray-900">•••• {paymentMethod.last4}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Plans Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Available Plans</h3>
                <p className="text-sm text-gray-600">Choose the plan that best fits your needs</p>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`relative rounded-lg border-2 p-4 cursor-pointer transition-colors ${
                        selectedPlan === plan.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      } ${plan.recommended ? 'ring-2 ring-blue-200' : ''}`}
                      onClick={() => setSelectedPlan(plan.id)}
                    >
                      {plan.recommended && (
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                            Recommended
                          </span>
                        </div>
                      )}
                      
                      <div className="text-center">
                        <h4 className="text-lg font-semibold text-gray-900">{plan.name}</h4>
                        <div className="mt-2">
                          <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                          <span className="text-gray-600">/{plan.period}</span>
                        </div>
                      </div>
                      
                      <ul className="mt-4 space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center space-x-2 text-sm">
                            <CheckCircleIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      {plan.id === currentPlan.name.toLowerCase() && (
                        <div className="mt-4 text-center">
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                            Current Plan
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 text-center">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                    Change Plan
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Payment Method</h3>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <CreditCardIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {paymentMethod.type} •••• {paymentMethod.last4}
                      </p>
                      <p className="text-xs text-gray-500">Expires {paymentMethod.expiry}</p>
                    </div>
                  </div>
                  {paymentMethod.isDefault && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                      Default
                    </span>
                  )}
                </div>
                
                <button className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm transition-colors">
                  Update Payment Method
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Recent Invoices</h3>
                <p className="text-sm text-gray-600">Your billing history and downloadable invoices</p>
              </div>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{invoice.id}</p>
                        <p className="text-xs text-gray-500">{invoice.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {invoice.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${invoice.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        invoice.status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {invoice.status === 'paid' ? (
                          <CheckCircleIcon className="w-3 h-3 mr-1" />
                        ) : (
                          <ExclamationCircleIcon className="w-3 h-3 mr-1" />
                        )}
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="text-blue-600 hover:text-blue-700">
                        <ArrowDownTrayIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Billing Settings */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <ExclamationCircleIcon className="w-6 h-6 text-yellow-600 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-900">Payment Processing Integration</h3>
              <p className="text-yellow-700 mt-1">
                This billing interface is currently in demo mode. In production, this would integrate with payment 
                processors like Stripe, PayPal, or similar services to handle:
              </p>
              <ul className="list-disc list-inside text-sm text-yellow-600 mt-3 space-y-1">
                <li>Secure payment processing and subscription management</li>
                <li>Automated invoice generation and delivery</li>
                <li>Real-time payment status updates</li>
                <li>Tax calculation and compliance</li>
                <li>Dunning management for failed payments</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}