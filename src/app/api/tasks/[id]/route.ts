import { NextRequest, NextResponse } from 'next/server';
import { mockTasks } from '@/lib/mockData';
import { logTaskActivity } from '@/lib/activityLogger';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const task = mockTasks.find(t => t.id === id);
    
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    
    return NextResponse.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const updates = await request.json();
    const taskIndex = mockTasks.findIndex(t => t.id === id);
    
    if (taskIndex === -1) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    
    const oldTask = { ...mockTasks[taskIndex] };
    mockTasks[taskIndex] = {
      ...mockTasks[taskIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    // Auto-create activity log
    const changes = [];
    if (updates.status && updates.status !== oldTask.status) {
      changes.push(`status changed from ${oldTask.status} to ${updates.status}`);
      
      // Special handling for task completion
      if (updates.status === 'completed') {
        logTaskActivity('completed', mockTasks[taskIndex].title, mockTasks[taskIndex].id, mockTasks[taskIndex].contact_id);
      }
    }
    if (updates.title && updates.title !== oldTask.title) changes.push(`title changed to ${updates.title}`);
    if (updates.priority && updates.priority !== oldTask.priority) changes.push(`priority changed to ${updates.priority}`);
    
    const changeDetails = changes.length > 0 ? changes.join(', ') : 'task updated';
    if (updates.status !== 'completed') { // Don't log twice for completion
      logTaskActivity('updated', mockTasks[taskIndex].title, mockTasks[taskIndex].id, mockTasks[taskIndex].contact_id, changeDetails);
    }
    
    return NextResponse.json(mockTasks[taskIndex]);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const taskIndex = mockTasks.findIndex(t => t.id === id);
    
    if (taskIndex === -1) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    
    // Log activity before deletion
    const task = mockTasks[taskIndex];
    logTaskActivity('deleted', task.title, task.id, task.contact_id);
    
    mockTasks.splice(taskIndex, 1);
    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}