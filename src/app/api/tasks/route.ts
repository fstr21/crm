import { NextRequest, NextResponse } from 'next/server';
import { mockTasks } from '@/lib/mockData';
import { logTaskActivity } from '@/lib/activityLogger';

export async function GET() {
  try {
    return NextResponse.json(mockTasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const task = await request.json();
    const newTask = {
      id: Date.now().toString(),
      ...task,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // In a real app, save to database
    mockTasks.push(newTask);
    
    // Auto-create activity log
    logTaskActivity('created', newTask.title, newTask.id, newTask.contact_id);
    
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}