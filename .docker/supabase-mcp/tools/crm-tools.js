import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import logger from '../logger.js';
import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';

export class CRMTools {
  constructor(supabaseClient, schemaManager) {
    this.client = supabaseClient;
    this.schemaManager = schemaManager;
  }

  getTools() {
    return [
      {
        name: 'crm_setup_schema',
        description: 'Create CRM database schema in Supabase',
        inputSchema: {
          type: 'object',
          properties: {
            dropExisting: {
              type: 'boolean',
              description: 'Whether to drop existing tables first',
              default: false
            }
          }
        }
      },
      {
        name: 'crm_create_user',
        description: 'Create a new CRM user',
        inputSchema: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            name: {
              type: 'string',
              description: 'User full name'
            },
            role: {
              type: 'string',
              enum: ['USER', 'ADMIN', 'SUPER_ADMIN'],
              default: 'USER',
              description: 'User role'
            },
            avatar: {
              type: 'string',
              description: 'Avatar URL (optional)'
            }
          },
          required: ['email', 'name']
        }
      },
      {
        name: 'crm_create_contact',
        description: 'Create a new contact in the CRM',
        inputSchema: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Contact email address'
            },
            firstName: {
              type: 'string',
              description: 'Contact first name'
            },
            lastName: {
              type: 'string',
              description: 'Contact last name'
            },
            company: {
              type: 'string',
              description: 'Company name'
            },
            phone: {
              type: 'string',
              description: 'Phone number'
            },
            website: {
              type: 'string',
              description: 'Website URL'
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'INACTIVE', 'PROSPECT', 'CUSTOMER', 'FORMER_CUSTOMER'],
              default: 'PROSPECT',
              description: 'Contact status'
            },
            source: {
              type: 'string',
              description: 'Lead source'
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Contact tags'
            },
            notes: {
              type: 'string',
              description: 'Notes about the contact'
            },
            userId: {
              type: 'string',
              description: 'ID of the user who owns this contact'
            }
          },
          required: ['email', 'firstName', 'userId']
        }
      },
      {
        name: 'crm_create_task',
        description: 'Create a new task in the CRM',
        inputSchema: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Task title'
            },
            description: {
              type: 'string',
              description: 'Task description'
            },
            status: {
              type: 'string',
              enum: ['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
              default: 'TODO',
              description: 'Task status'
            },
            priority: {
              type: 'string',
              enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
              default: 'MEDIUM',
              description: 'Task priority'
            },
            dueDate: {
              type: 'string',
              format: 'date-time',
              description: 'Due date (ISO 8601 format)'
            },
            userId: {
              type: 'string',
              description: 'ID of the user who owns this task'
            },
            contactId: {
              type: 'string',
              description: 'ID of the associated contact (optional)'
            }
          },
          required: ['title', 'userId']
        }
      },
      {
        name: 'crm_log_activity',
        description: 'Log an activity in the CRM',
        inputSchema: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: [
                'CONTACT_CREATED', 'CONTACT_UPDATED', 'TASK_CREATED',
                'TASK_UPDATED', 'TASK_COMPLETED', 'EMAIL_SENT',
                'CALL_MADE', 'MEETING_SCHEDULED', 'NOTE_ADDED'
              ],
              description: 'Type of activity'
            },
            title: {
              type: 'string',
              description: 'Activity title'
            },
            content: {
              type: 'string',
              description: 'Activity content/description'
            },
            metadata: {
              type: 'object',
              description: 'Additional metadata as JSON',
              additionalProperties: true
            },
            userId: {
              type: 'string',
              description: 'ID of the user who performed this activity'
            },
            contactId: {
              type: 'string',
              description: 'ID of the associated contact (optional)'
            },
            taskId: {
              type: 'string',
              description: 'ID of the associated task (optional)'
            }
          },
          required: ['type', 'title', 'userId']
        }
      },
      {
        name: 'crm_get_dashboard_data',
        description: 'Get CRM dashboard data with metrics and recent activities',
        inputSchema: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              description: 'User ID to get dashboard data for'
            },
            includeRecentActivities: {
              type: 'boolean',
              default: true,
              description: 'Whether to include recent activities'
            },
            activityLimit: {
              type: 'number',
              default: 10,
              maximum: 50,
              description: 'Number of recent activities to include'
            }
          },
          required: ['userId']
        }
      },
      {
        name: 'crm_search_contacts',
        description: 'Search contacts with advanced filtering',
        inputSchema: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              description: 'User ID to search contacts for'
            },
            query: {
              type: 'string',
              description: 'Search query (searches name, email, company)'
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'INACTIVE', 'PROSPECT', 'CUSTOMER', 'FORMER_CUSTOMER'],
              description: 'Filter by contact status'
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Filter by tags (contact must have all specified tags)'
            },
            company: {
              type: 'string',
              description: 'Filter by company name'
            },
            limit: {
              type: 'number',
              default: 25,
              maximum: 100,
              description: 'Maximum number of contacts to return'
            }
          },
          required: ['userId']
        }
      },
      {
        name: 'crm_update_contact',
        description: 'Update an existing contact',
        inputSchema: {
          type: 'object',
          properties: {
            contactId: {
              type: 'string',
              description: 'ID of the contact to update'
            },
            updates: {
              type: 'object',
              properties: {
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                email: { type: 'string', format: 'email' },
                company: { type: 'string' },
                phone: { type: 'string' },
                website: { type: 'string' },
                status: {
                  type: 'string',
                  enum: ['ACTIVE', 'INACTIVE', 'PROSPECT', 'CUSTOMER', 'FORMER_CUSTOMER']
                },
                source: { type: 'string' },
                tags: {
                  type: 'array',
                  items: { type: 'string' }
                },
                notes: { type: 'string' }
              },
              additionalProperties: false,
              description: 'Fields to update'
            },
            userId: {
              type: 'string',
              description: 'ID of the user making the update (for activity logging)'
            }
          },
          required: ['contactId', 'updates', 'userId']
        }
      }
    ];
  }

  async canHandle(toolName) {
    return toolName.startsWith('crm_');
  }

  async handleTool(name, args) {
    try {
      switch (name) {
        case 'crm_setup_schema':
          return await this.handleSetupSchema(args);
        case 'crm_create_user':
          return await this.handleCreateUser(args);
        case 'crm_create_contact':
          return await this.handleCreateContact(args);
        case 'crm_create_task':
          return await this.handleCreateTask(args);
        case 'crm_log_activity':
          return await this.handleLogActivity(args);
        case 'crm_get_dashboard_data':
          return await this.handleGetDashboardData(args);
        case 'crm_search_contacts':
          return await this.handleSearchContacts(args);
        case 'crm_update_contact':
          return await this.handleUpdateContact(args);
        default:
          throw new McpError(ErrorCode.MethodNotFound, `Tool ${name} not found`);
      }
    } catch (error) {
      logger.error(`CRM tool error for ${name}:`, error);
      throw error;
    }
  }

  async handleSetupSchema(args) {
    const { dropExisting = false } = args;

    try {
      if (dropExisting) {
        await this.schemaManager.dropCRMSchema();
      }

      const result = await this.schemaManager.createCRMSchema();
      
      logger.info('CRM schema setup completed');

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              message: 'CRM schema created successfully',
              tables: result.tables,
              dropped: dropExisting
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Schema setup failed: ${error.message}`
      );
    }
  }

  async handleCreateUser(args) {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      name: Joi.string().required(),
      role: Joi.string().valid('USER', 'ADMIN', 'SUPER_ADMIN').default('USER'),
      avatar: Joi.string().uri().optional()
    });

    const { error, value } = schema.validate(args);
    if (error) {
      throw new McpError(ErrorCode.InvalidParams, error.details[0].message);
    }

    try {
      const userData = {
        id: uuidv4(),
        email: value.email,
        name: value.name,
        role: value.role,
        avatar: value.avatar || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error: insertError } = await this.client.getClient()
        .from('users')
        .insert(userData)
        .select('*');

      if (insertError) {
        throw insertError;
      }

      // Log activity
      await this.logSystemActivity('USER_CREATED', `User ${value.name} created`, {
        userId: userData.id,
        email: value.email,
        role: value.role
      });

      logger.info(`User created: ${value.email}`);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              user: data[0],
              message: 'User created successfully'
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `User creation failed: ${error.message}`
      );
    }
  }

  async handleCreateContact(args) {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      firstName: Joi.string().required(),
      lastName: Joi.string().allow('').optional(),
      company: Joi.string().allow('').optional(),
      phone: Joi.string().allow('').optional(),
      website: Joi.string().uri().allow('').optional(),
      status: Joi.string().valid('ACTIVE', 'INACTIVE', 'PROSPECT', 'CUSTOMER', 'FORMER_CUSTOMER').default('PROSPECT'),
      source: Joi.string().allow('').optional(),
      tags: Joi.array().items(Joi.string()).default([]),
      notes: Joi.string().allow('').optional(),
      userId: Joi.string().required()
    });

    const { error, value } = schema.validate(args);
    if (error) {
      throw new McpError(ErrorCode.InvalidParams, error.details[0].message);
    }

    try {
      const contactData = {
        id: uuidv4(),
        email: value.email,
        first_name: value.firstName,
        last_name: value.lastName || null,
        company: value.company || null,
        phone: value.phone || null,
        website: value.website || null,
        status: value.status,
        source: value.source || null,
        tags: value.tags,
        notes: value.notes || null,
        user_id: value.userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error: insertError } = await this.client.getClient()
        .from('contacts')
        .insert(contactData)
        .select('*');

      if (insertError) {
        throw insertError;
      }

      // Log activity
      await this.handleLogActivity({
        type: 'CONTACT_CREATED',
        title: `Contact ${value.firstName} ${value.lastName || ''} created`,
        content: `New contact added: ${value.email}`,
        userId: value.userId,
        contactId: contactData.id,
        metadata: {
          company: value.company,
          status: value.status,
          source: value.source
        }
      });

      logger.info(`Contact created: ${value.email} for user ${value.userId}`);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              contact: data[0],
              message: 'Contact created successfully'
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Contact creation failed: ${error.message}`
      );
    }
  }

  async handleCreateTask(args) {
    const schema = Joi.object({
      title: Joi.string().required(),
      description: Joi.string().allow('').optional(),
      status: Joi.string().valid('TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED').default('TODO'),
      priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').default('MEDIUM'),
      dueDate: Joi.string().isoDate().optional(),
      userId: Joi.string().required(),
      contactId: Joi.string().optional()
    });

    const { error, value } = schema.validate(args);
    if (error) {
      throw new McpError(ErrorCode.InvalidParams, error.details[0].message);
    }

    try {
      const taskData = {
        id: uuidv4(),
        title: value.title,
        description: value.description || null,
        status: value.status,
        priority: value.priority,
        due_date: value.dueDate ? new Date(value.dueDate).toISOString() : null,
        completed_at: value.status === 'COMPLETED' ? new Date().toISOString() : null,
        user_id: value.userId,
        contact_id: value.contactId || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error: insertError } = await this.client.getClient()
        .from('tasks')
        .insert(taskData)
        .select('*');

      if (insertError) {
        throw insertError;
      }

      // Log activity
      await this.handleLogActivity({
        type: 'TASK_CREATED',
        title: `Task "${value.title}" created`,
        content: `New task with priority ${value.priority}`,
        userId: value.userId,
        contactId: value.contactId,
        taskId: taskData.id,
        metadata: {
          priority: value.priority,
          status: value.status,
          dueDate: value.dueDate
        }
      });

      logger.info(`Task created: ${value.title} for user ${value.userId}`);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              task: data[0],
              message: 'Task created successfully'
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Task creation failed: ${error.message}`
      );
    }
  }

  async handleLogActivity(args) {
    const schema = Joi.object({
      type: Joi.string().valid(
        'CONTACT_CREATED', 'CONTACT_UPDATED', 'TASK_CREATED',
        'TASK_UPDATED', 'TASK_COMPLETED', 'EMAIL_SENT',
        'CALL_MADE', 'MEETING_SCHEDULED', 'NOTE_ADDED'
      ).required(),
      title: Joi.string().required(),
      content: Joi.string().allow('').optional(),
      metadata: Joi.object().optional(),
      userId: Joi.string().required(),
      contactId: Joi.string().optional(),
      taskId: Joi.string().optional()
    });

    const { error, value } = schema.validate(args);
    if (error) {
      throw new McpError(ErrorCode.InvalidParams, error.details[0].message);
    }

    try {
      const activityData = {
        id: uuidv4(),
        type: value.type,
        title: value.title,
        content: value.content || null,
        metadata: value.metadata || null,
        user_id: value.userId,
        contact_id: value.contactId || null,
        task_id: value.taskId || null,
        created_at: new Date().toISOString()
      };

      const { data, error: insertError } = await this.client.getClient()
        .from('activities')
        .insert(activityData)
        .select('*');

      if (insertError) {
        throw insertError;
      }

      logger.info(`Activity logged: ${value.type} - ${value.title}`);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              activity: data[0],
              message: 'Activity logged successfully'
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Activity logging failed: ${error.message}`
      );
    }
  }

  async handleGetDashboardData(args) {
    const schema = Joi.object({
      userId: Joi.string().required(),
      includeRecentActivities: Joi.boolean().default(true),
      activityLimit: Joi.number().min(1).max(50).default(10)
    });

    const { error, value } = schema.validate(args);
    if (error) {
      throw new McpError(ErrorCode.InvalidParams, error.details[0].message);
    }

    try {
      const { userId, includeRecentActivities, activityLimit } = value;

      // Get contact counts by status
      const { data: contactCounts, error: contactError } = await this.client.getClient()
        .from('contacts')
        .select('status')
        .eq('user_id', userId);

      if (contactError) throw contactError;

      // Get task counts by status
      const { data: taskCounts, error: taskError } = await this.client.getClient()
        .from('tasks')
        .select('status, priority')
        .eq('user_id', userId);

      if (taskError) throw taskError;

      // Get recent activities if requested
      let recentActivities = [];
      if (includeRecentActivities) {
        const { data: activities, error: activityError } = await this.client.getClient()
          .from('activities')
          .select('*, contacts(first_name, last_name), tasks(title)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(activityLimit);

        if (activityError) throw activityError;
        recentActivities = activities || [];
      }

      // Process metrics
      const contactMetrics = this.processContactMetrics(contactCounts || []);
      const taskMetrics = this.processTaskMetrics(taskCounts || []);

      const dashboardData = {
        metrics: {
          contacts: contactMetrics,
          tasks: taskMetrics
        },
        recentActivities
      };

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              dashboard: dashboardData,
              generatedAt: new Date().toISOString()
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Dashboard data retrieval failed: ${error.message}`
      );
    }
  }

  async handleSearchContacts(args) {
    const schema = Joi.object({
      userId: Joi.string().required(),
      query: Joi.string().allow('').optional(),
      status: Joi.string().valid('ACTIVE', 'INACTIVE', 'PROSPECT', 'CUSTOMER', 'FORMER_CUSTOMER').optional(),
      tags: Joi.array().items(Joi.string()).optional(),
      company: Joi.string().allow('').optional(),
      limit: Joi.number().min(1).max(100).default(25)
    });

    const { error, value } = schema.validate(args);
    if (error) {
      throw new McpError(ErrorCode.InvalidParams, error.details[0].message);
    }

    try {
      let query = this.client.getClient()
        .from('contacts')
        .select('*')
        .eq('user_id', value.userId);

      // Apply text search
      if (value.query) {
        query = query.or(`first_name.ilike.%${value.query}%,last_name.ilike.%${value.query}%,email.ilike.%${value.query}%,company.ilike.%${value.query}%`);
      }

      // Apply status filter
      if (value.status) {
        query = query.eq('status', value.status);
      }

      // Apply company filter
      if (value.company) {
        query = query.ilike('company', `%${value.company}%`);
      }

      // Apply tags filter (contact must have all specified tags)
      if (value.tags && value.tags.length > 0) {
        query = query.contains('tags', value.tags);
      }

      const { data: contacts, error: searchError } = await query
        .order('created_at', { ascending: false })
        .limit(value.limit);

      if (searchError) {
        throw searchError;
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              contacts: contacts || [],
              count: contacts?.length || 0,
              searchCriteria: {
                query: value.query,
                status: value.status,
                tags: value.tags,
                company: value.company,
                limit: value.limit
              }
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Contact search failed: ${error.message}`
      );
    }
  }

  async handleUpdateContact(args) {
    const schema = Joi.object({
      contactId: Joi.string().required(),
      updates: Joi.object({
        firstName: Joi.string().optional(),
        lastName: Joi.string().allow('').optional(),
        email: Joi.string().email().optional(),
        company: Joi.string().allow('').optional(),
        phone: Joi.string().allow('').optional(),
        website: Joi.string().uri().allow('').optional(),
        status: Joi.string().valid('ACTIVE', 'INACTIVE', 'PROSPECT', 'CUSTOMER', 'FORMER_CUSTOMER').optional(),
        source: Joi.string().allow('').optional(),
        tags: Joi.array().items(Joi.string()).optional(),
        notes: Joi.string().allow('').optional()
      }).min(1).required(),
      userId: Joi.string().required()
    });

    const { error, value } = schema.validate(args);
    if (error) {
      throw new McpError(ErrorCode.InvalidParams, error.details[0].message);
    }

    try {
      // Convert camelCase to snake_case for database
      const dbUpdates = {};
      if (value.updates.firstName !== undefined) dbUpdates.first_name = value.updates.firstName;
      if (value.updates.lastName !== undefined) dbUpdates.last_name = value.updates.lastName;
      if (value.updates.email !== undefined) dbUpdates.email = value.updates.email;
      if (value.updates.company !== undefined) dbUpdates.company = value.updates.company;
      if (value.updates.phone !== undefined) dbUpdates.phone = value.updates.phone;
      if (value.updates.website !== undefined) dbUpdates.website = value.updates.website;
      if (value.updates.status !== undefined) dbUpdates.status = value.updates.status;
      if (value.updates.source !== undefined) dbUpdates.source = value.updates.source;
      if (value.updates.tags !== undefined) dbUpdates.tags = value.updates.tags;
      if (value.updates.notes !== undefined) dbUpdates.notes = value.updates.notes;
      
      dbUpdates.updated_at = new Date().toISOString();

      const { data, error: updateError } = await this.client.getClient()
        .from('contacts')
        .update(dbUpdates)
        .eq('id', value.contactId)
        .select('*');

      if (updateError) {
        throw updateError;
      }

      if (!data || data.length === 0) {
        throw new Error('Contact not found or no changes made');
      }

      // Log activity
      await this.handleLogActivity({
        type: 'CONTACT_UPDATED',
        title: `Contact ${data[0].first_name} ${data[0].last_name || ''} updated`,
        content: `Updated fields: ${Object.keys(value.updates).join(', ')}`,
        userId: value.userId,
        contactId: value.contactId,
        metadata: {
          updatedFields: Object.keys(value.updates),
          changes: value.updates
        }
      });

      logger.info(`Contact updated: ${value.contactId} by user ${value.userId}`);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              contact: data[0],
              updatedFields: Object.keys(value.updates),
              message: 'Contact updated successfully'
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Contact update failed: ${error.message}`
      );
    }
  }

  // Helper methods
  processContactMetrics(contacts) {
    const statusCounts = contacts.reduce((acc, contact) => {
      acc[contact.status] = (acc[contact.status] || 0) + 1;
      return acc;
    }, {});

    return {
      total: contacts.length,
      byStatus: statusCounts,
      active: statusCounts.ACTIVE || 0,
      prospects: statusCounts.PROSPECT || 0,
      customers: statusCounts.CUSTOMER || 0
    };
  }

  processTaskMetrics(tasks) {
    const statusCounts = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {});

    const priorityCounts = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {});

    return {
      total: tasks.length,
      byStatus: statusCounts,
      byPriority: priorityCounts,
      pending: (statusCounts.TODO || 0) + (statusCounts.IN_PROGRESS || 0),
      completed: statusCounts.COMPLETED || 0,
      highPriority: (priorityCounts.HIGH || 0) + (priorityCounts.URGENT || 0)
    };
  }

  async logSystemActivity(type, title, metadata = {}) {
    try {
      const activityData = {
        id: uuidv4(),
        type,
        title,
        content: null,
        metadata,
        user_id: metadata.userId || 'system',
        contact_id: null,
        task_id: null,
        created_at: new Date().toISOString()
      };

      await this.client.getClient()
        .from('activities')
        .insert(activityData);
    } catch (error) {
      logger.warn('Failed to log system activity:', error);
    }
  }
}