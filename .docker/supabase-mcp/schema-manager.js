import logger from './logger.js';

export class SchemaManager {
  constructor(supabaseClient) {
    this.client = supabaseClient;
  }

  // CRM Schema definitions matching Prisma schema
  getCRMSchema() {
    return {
      users: {
        id: 'text PRIMARY KEY DEFAULT gen_random_uuid()',
        email: 'text UNIQUE NOT NULL',
        name: 'text',
        avatar: 'text',
        role: 'text DEFAULT \'USER\' CHECK (role IN (\'USER\', \'ADMIN\', \'SUPER_ADMIN\'))',
        created_at: 'timestamptz DEFAULT now()',
        updated_at: 'timestamptz DEFAULT now()'
      },
      contacts: {
        id: 'text PRIMARY KEY DEFAULT gen_random_uuid()',
        email: 'text UNIQUE NOT NULL',
        first_name: 'text NOT NULL',
        last_name: 'text',
        company: 'text',
        phone: 'text',
        website: 'text',
        status: 'text DEFAULT \'ACTIVE\' CHECK (status IN (\'ACTIVE\', \'INACTIVE\', \'PROSPECT\', \'CUSTOMER\', \'FORMER_CUSTOMER\'))',
        source: 'text',
        tags: 'text[]',
        notes: 'text',
        user_id: 'text NOT NULL REFERENCES users(id) ON DELETE CASCADE',
        created_at: 'timestamptz DEFAULT now()',
        updated_at: 'timestamptz DEFAULT now()'
      },
      tasks: {
        id: 'text PRIMARY KEY DEFAULT gen_random_uuid()',
        title: 'text NOT NULL',
        description: 'text',
        status: 'text DEFAULT \'TODO\' CHECK (status IN (\'TODO\', \'IN_PROGRESS\', \'COMPLETED\', \'CANCELLED\'))',
        priority: 'text DEFAULT \'MEDIUM\' CHECK (priority IN (\'LOW\', \'MEDIUM\', \'HIGH\', \'URGENT\'))',
        due_date: 'timestamptz',
        completed_at: 'timestamptz',
        user_id: 'text NOT NULL REFERENCES users(id) ON DELETE CASCADE',
        contact_id: 'text REFERENCES contacts(id) ON DELETE SET NULL',
        created_at: 'timestamptz DEFAULT now()',
        updated_at: 'timestamptz DEFAULT now()'
      },
      activities: {
        id: 'text PRIMARY KEY DEFAULT gen_random_uuid()',
        type: 'text NOT NULL CHECK (type IN (\'CONTACT_CREATED\', \'CONTACT_UPDATED\', \'TASK_CREATED\', \'TASK_UPDATED\', \'TASK_COMPLETED\', \'EMAIL_SENT\', \'CALL_MADE\', \'MEETING_SCHEDULED\', \'NOTE_ADDED\'))',
        title: 'text NOT NULL',
        content: 'text',
        metadata: 'jsonb',
        user_id: 'text NOT NULL REFERENCES users(id) ON DELETE CASCADE',
        contact_id: 'text REFERENCES contacts(id) ON DELETE SET NULL',
        task_id: 'text REFERENCES tasks(id) ON DELETE SET NULL',
        created_at: 'timestamptz DEFAULT now()'
      }
    };
  }

  async createTable(tableName, columns) {
    try {
      const columnDefs = Object.entries(columns)
        .map(([name, definition]) => `${name} ${definition}`)
        .join(',\\n  ');

      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS ${tableName} (
          ${columnDefs}
        );
      `;

      const { data, error } = await this.client.getClient(true).rpc('exec_sql', {
        sql: createTableSQL
      });

      if (error) {
        throw error;
      }

      logger.info(`Table ${tableName} created successfully`);
      return { success: true, table: tableName };
    } catch (error) {
      logger.error(`Failed to create table ${tableName}:`, error);
      throw error;
    }
  }

  async createCRMSchema() {
    try {
      const schema = this.getCRMSchema();
      const results = [];

      // Create tables in dependency order
      const tableOrder = ['users', 'contacts', 'tasks', 'activities'];
      
      for (const tableName of tableOrder) {
        const columns = schema[tableName];
        const result = await this.createTable(tableName, columns);
        results.push(result);
      }

      // Create indexes for performance
      await this.createIndexes();

      // Enable RLS (Row Level Security)
      await this.enableRLS();

      logger.info('CRM schema created successfully');
      return { success: true, tables: results };
    } catch (error) {
      logger.error('Failed to create CRM schema:', error);
      throw error;
    }
  }

  async createIndexes() {
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);',
      'CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);',
      'CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_tasks_contact_id ON tasks(contact_id);',
      'CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);',
      'CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);',
      'CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_activities_contact_id ON activities(contact_id);',
      'CREATE INDEX IF NOT EXISTS idx_activities_task_id ON activities(task_id);',
      'CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);',
      'CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);'
    ];

    for (const indexSQL of indexes) {
      try {
        await this.client.getClient(true).rpc('exec_sql', { sql: indexSQL });
      } catch (error) {
        logger.warn(`Failed to create index: ${indexSQL}`, error);
      }
    }
  }

  async enableRLS() {
    const rlsCommands = [
      'ALTER TABLE users ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE activities ENABLE ROW LEVEL SECURITY;'
    ];

    for (const command of rlsCommands) {
      try {
        await this.client.getClient(true).rpc('exec_sql', { sql: command });
      } catch (error) {
        logger.warn(`Failed to enable RLS: ${command}`, error);
      }
    }
  }

  async dropCRMSchema() {
    try {
      const tables = ['activities', 'tasks', 'contacts', 'users'];
      
      for (const table of tables) {
        const { error } = await this.client.getClient(true).rpc('exec_sql', {
          sql: `DROP TABLE IF EXISTS ${table} CASCADE;`
        });
        
        if (error) {
          logger.warn(`Failed to drop table ${table}:`, error);
        } else {
          logger.info(`Table ${table} dropped successfully`);
        }
      }

      return { success: true, message: 'CRM schema dropped successfully' };
    } catch (error) {
      logger.error('Failed to drop CRM schema:', error);
      throw error;
    }
  }
}