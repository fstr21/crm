import { NextResponse } from "next/server"

export async function GET() {
  try {
    return NextResponse.json({
      status: "ok",
      message: "CRM API is running",
      timestamp: new Date().toISOString(),
      environment: {
        node: process.env.NODE_ENV,
        database: process.env.DATABASE_URL ? "configured" : "not configured",
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "API error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
