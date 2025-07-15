import { NextRequest, NextResponse } from 'next/server';
import { mockActivities } from '@/lib/mockData';

export async function GET() {
  try {
    return NextResponse.json(mockActivities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const activity = await request.json();
    const newActivity = {
      id: Date.now().toString(),
      ...activity,
      created_at: new Date().toISOString()
    };
    
    // In a real app, save to database
    mockActivities.push(newActivity);
    
    return NextResponse.json(newActivity, { status: 201 });
  } catch (error) {
    console.error('Error creating activity:', error);
    return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 });
  }
}