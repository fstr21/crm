import { NextRequest, NextResponse } from 'next/server';
import { mockActivities } from '@/lib/mockData';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const activity = mockActivities.find(a => a.id === id);
    
    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }
    
    return NextResponse.json(activity);
  } catch (error) {
    console.error('Error fetching activity:', error);
    return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const updates = await request.json();
    const activityIndex = mockActivities.findIndex(a => a.id === id);
    
    if (activityIndex === -1) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }
    
    mockActivities[activityIndex] = {
      ...mockActivities[activityIndex],
      ...updates
    };
    
    return NextResponse.json(mockActivities[activityIndex]);
  } catch (error) {
    console.error('Error updating activity:', error);
    return NextResponse.json({ error: 'Failed to update activity' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const activityIndex = mockActivities.findIndex(a => a.id === id);
    
    if (activityIndex === -1) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }
    
    mockActivities.splice(activityIndex, 1);
    return NextResponse.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    console.error('Error deleting activity:', error);
    return NextResponse.json({ error: 'Failed to delete activity' }, { status: 500 });
  }
}