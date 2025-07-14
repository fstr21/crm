import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const contacts = await prisma.contact.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({
      success: true,
      data: contacts,
      count: contacts.length,
    })
  } catch (error) {
    console.error("Database error:", error)
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
    const { email, firstName, lastName, company, phone, userId } = body

    if (!email || !firstName || !userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: email, firstName, userId",
        },
        { status: 400 }
      )
    }

    const contact = await prisma.contact.create({
      data: {
        email,
        firstName,
        lastName,
        company,
        phone,
        userId,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    // Create activity log
    await prisma.activity.create({
      data: {
        type: "CONTACT_CREATED",
        title: "Contact created",
        content: `${firstName} ${lastName || ""} was added to contacts`,
        userId,
        contactId: contact.id,
      },
    })

    return NextResponse.json({
      success: true,
      data: contact,
    })
  } catch (error) {
    console.error("Database error:", error)
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
