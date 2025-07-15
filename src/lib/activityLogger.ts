import { mockActivities } from './mockData';

export function createActivity(
  type: 'call' | 'email' | 'meeting' | 'note',
  title: string,
  description?: string,
  contact_id?: string,
  task_id?: string,
  user_id: string = 'system'
) {
  const activity = {
    id: crypto.randomUUID(),
    type,
    title,
    description,
    contact_id,
    task_id,
    user_id,
    created_at: new Date().toISOString()
  };

  mockActivities.push(activity);
  return activity;
}

export function logContactActivity(
  action: 'created' | 'updated' | 'deleted',
  contactName: string,
  contactId: string,
  details?: string
) {
  const titles = {
    created: `New contact added: ${contactName}`,
    updated: `Contact updated: ${contactName}`,
    deleted: `Contact deleted: ${contactName}`
  };

  const descriptions = {
    created: `${contactName} was added to the CRM system`,
    updated: `${contactName} information was updated${details ? ': ' + details : ''}`,
    deleted: `${contactName} was removed from the CRM system`
  };

  return createActivity(
    'note',
    titles[action],
    descriptions[action],
    action === 'deleted' ? undefined : contactId,
    undefined,
    'system'
  );
}

export function logTaskActivity(
  action: 'created' | 'updated' | 'deleted' | 'completed',
  taskTitle: string,
  taskId?: string,
  contactId?: string,
  details?: string
) {
  const titles = {
    created: `New task created: ${taskTitle}`,
    updated: `Task updated: ${taskTitle}`,
    deleted: `Task deleted: ${taskTitle}`,
    completed: `Task completed: ${taskTitle}`
  };

  const descriptions = {
    created: `Task "${taskTitle}" was created`,
    updated: `Task "${taskTitle}" was updated${details ? ': ' + details : ''}`,
    deleted: `Task "${taskTitle}" was deleted`,
    completed: `Task "${taskTitle}" was marked as completed`
  };

  return createActivity(
    'note',
    titles[action],
    descriptions[action],
    contactId,
    action === 'deleted' ? undefined : taskId,
    'system'
  );
}