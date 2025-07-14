'use client'

import React, { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ContactsList from '@/components/contacts/ContactsList';
import ContactForm from '@/components/contacts/ContactForm';
import { useContacts } from '@/lib/dataService';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function ContactsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const { data: contacts, isLoading, error } = useContacts();

  const handleCreateContact = () => {
    setEditingContact(null);
    setIsFormOpen(true);
  };

  const handleEditContact = (contact: any) => {
    setEditingContact(contact);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingContact(null);
  };

  if (error) {
    return (
      <DashboardLayout title="Contacts">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          <h3 className="font-bold">Error loading contacts</h3>
          <p>Unable to connect to the server. Please check if the MCP server is running.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Contacts">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
            <p className="text-gray-600">Manage your customer relationships</p>
          </div>
          <button
            onClick={handleCreateContact}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add Contact</span>
          </button>
        </div>

        {/* Contacts List */}
        <ContactsList
          contacts={contacts || []}
          isLoading={isLoading}
          onEditContact={handleEditContact}
        />

        {/* Contact Form Modal */}
        {isFormOpen && (
          <ContactForm
            contact={editingContact}
            onClose={handleCloseForm}
          />
        )}
      </div>
    </DashboardLayout>
  );
}