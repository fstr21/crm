import { NextResponse } from "next/server"
import { mockContacts } from "@/lib/mockData"
import { logContactActivity } from "@/lib/activityLogger"

export async function GET() {
  try {
    return NextResponse.json(mockContacts)
  } catch (error) {
    console.error("Error fetching contacts:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch contacts",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, company, status, value } = body

    if (!name || !email) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: name, email",
        },
        { status: 400 }
      )
    }

    const newContact = {
      id: crypto.randomUUID(),
      name,
      email,
      phone: phone || '',
      company: company || '',
      status: status || 'cold',
      value: value || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // In a real app, save to database
    mockContacts.push(newContact)

    // Auto-create activity log
    logContactActivity('created', newContact.name, newContact.id)

    return NextResponse.json(newContact, { status: 201 })
  } catch (error) {
    console.error("Error creating contact:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create contact",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
