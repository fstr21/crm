import { NextResponse } from "next/server"
import { mockContacts } from "@/lib/mockData"
import { logContactActivity } from "@/lib/activityLogger"

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const contactId = params.id

    if (!contactId) {
      return NextResponse.json(
        { success: false, error: "Contact ID is required" },
        { status: 400 }
      )
    }

    const contactIndex = mockContacts.findIndex(c => c.id === contactId)

    if (contactIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Contact not found" },
        { status: 404 }
      )
    }

    // Log activity before deletion
    const contact = mockContacts[contactIndex]
    logContactActivity('deleted', contact.name, contact.id)

    // Remove contact from mock data
    mockContacts.splice(contactIndex, 1)

    return NextResponse.json({
      success: true,
      data: { id: contactId },
    })
  } catch (error) {
    console.error("Error deleting contact:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete contact",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const contactId = params.id

    if (!contactId) {
      return NextResponse.json(
        { success: false, error: "Contact ID is required" },
        { status: 400 }
      )
    }

    const contact = mockContacts.find(c => c.id === contactId)

    if (!contact) {
      return NextResponse.json(
        { success: false, error: "Contact not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(contact)
  } catch (error) {
    console.error("Error fetching contact:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch contact",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const contactId = params.id
    const body = await request.json()
    const { name, email, phone, company, status, value } = body

    if (!contactId) {
      return NextResponse.json(
        { success: false, error: "Contact ID is required" },
        { status: 400 }
      )
    }

    const contactIndex = mockContacts.findIndex(c => c.id === contactId)

    if (contactIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Contact not found" },
        { status: 404 }
      )
    }

    // Update contact in mock data
    const oldContact = { ...mockContacts[contactIndex] }
    mockContacts[contactIndex] = {
      ...mockContacts[contactIndex],
      name: name || mockContacts[contactIndex].name,
      email: email || mockContacts[contactIndex].email,
      phone: phone || mockContacts[contactIndex].phone,
      company: company || mockContacts[contactIndex].company,
      status: status || mockContacts[contactIndex].status,
      value: value || mockContacts[contactIndex].value,
      updated_at: new Date().toISOString()
    }

    // Auto-create activity log
    const changes = []
    if (name && name !== oldContact.name) changes.push(`name changed to ${name}`)
    if (email && email !== oldContact.email) changes.push(`email changed to ${email}`)
    if (status && status !== oldContact.status) changes.push(`status changed to ${status}`)
    
    const changeDetails = changes.length > 0 ? changes.join(', ') : 'contact information updated'
    logContactActivity('updated', mockContacts[contactIndex].name, mockContacts[contactIndex].id, changeDetails)

    return NextResponse.json(mockContacts[contactIndex])
  } catch (error) {
    console.error("Error updating contact:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update contact",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}