import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import logger from '../logger.js';
import Joi from 'joi';

export class DatabaseTools {
  constructor(supabaseClient) {
    this.client = supabaseClient;
    this.maxQueryLimit = parseInt(process.env.MAX_QUERY_LIMIT) || 1000;
  }

  getTools() {
    return [
      {
        name: 'supabase_query',
        description: 'Execute a SELECT query on Supabase database',
        inputSchema: {
          type: 'object',
          properties: {
            table: {
              type: 'string',
              description: 'Table name to query'
            },
            select: {
              type: 'string',
              description: 'Columns to select (default: *)',
              default: '*'
            },
            filter: {
              type: 'object',
              description: 'Filter conditions as key-value pairs',
              additionalProperties: true
            },
            orderBy: {
              type: 'object',
              properties: {
                column: { type: 'string' },
                ascending: { type: 'boolean', default: true }
              }
            },
            limit: {
              type: 'number',
              description: `Maximum number of rows to return (max: ${this.maxQueryLimit})`,
              maximum: this.maxQueryLimit,
              default: 100
            },
            offset: {
              type: 'number',
              description: 'Number of rows to skip',
              default: 0
            }
          },
          required: ['table']
        }
      },
      {
        name: 'supabase_insert',
        description: 'Insert data into a Supabase table',
        inputSchema: {
          type: 'object',
          properties: {
            table: {
              type: 'string',
              description: 'Table name to insert into'
            },
            data: {
              type: 'object',
              description: 'Data to insert as key-value pairs',
              additionalProperties: true
            },
            returning: {
              type: 'string',
              description: 'Columns to return after insert (default: *)',
              default: '*'
            }
          },
          required: ['table', 'data']
        }
      },
      {
        name: 'supabase_update',
        description: 'Update data in a Supabase table',
        inputSchema: {
          type: 'object',
          properties: {
            table: {
              type: 'string',
              description: 'Table name to update'
            },
            data: {
              type: 'object',
              description: 'Data to update as key-value pairs',
              additionalProperties: true
            },
            filter: {
              type: 'object',
              description: 'Filter conditions to identify rows to update',
              additionalProperties: true
            },
            returning: {
              type: 'string',
              description: 'Columns to return after update (default: *)',
              default: '*'
            }
          },
          required: ['table', 'data', 'filter']
        }
      },
      {
        name: 'supabase_delete',
        description: 'Delete data from a Supabase table',
        inputSchema: {
          type: 'object',
          properties: {
            table: {
              type: 'string',
              description: 'Table name to delete from'
            },
            filter: {
              type: 'object',
              description: 'Filter conditions to identify rows to delete',
              additionalProperties: true
            },
            returning: {
              type: 'string',
              description: 'Columns to return after delete',
              default: 'id'
            }
          },
          required: ['table', 'filter']
        }
      },
      {
        name: 'supabase_upsert',
        description: 'Insert or update data in a Supabase table',
        inputSchema: {
          type: 'object',
          properties: {
            table: {
              type: 'string',
              description: 'Table name for upsert operation'
            },
            data: {
              type: 'object',
              description: 'Data to upsert as key-value pairs',
              additionalProperties: true
            },
            onConflict: {
              type: 'string',
              description: 'Column(s) to check for conflicts (comma-separated)'
            },
            returning: {
              type: 'string',
              description: 'Columns to return after upsert (default: *)',
              default: '*'
            }
          },
          required: ['table', 'data']
        }
      },
      {
        name: 'supabase_count',
        description: 'Count rows in a Supabase table',
        inputSchema: {
          type: 'object',
          properties: {
            table: {
              type: 'string',
              description: 'Table name to count rows'
            },
            filter: {
              type: 'object',
              description: 'Filter conditions for counting',
              additionalProperties: true
            }
          },
          required: ['table']
        }
      }
    ];
  }

  async canHandle(toolName) {
    return toolName.startsWith('supabase_') && [
      'supabase_query',
      'supabase_insert', 
      'supabase_update',
      'supabase_delete',
      'supabase_upsert',
      'supabase_count'
    ].includes(toolName);
  }

  async handleTool(name, args) {
    try {
      switch (name) {
        case 'supabase_query':
          return await this.handleQuery(args);
        case 'supabase_insert':
          return await this.handleInsert(args);
        case 'supabase_update':
          return await this.handleUpdate(args);
        case 'supabase_delete':
          return await this.handleDelete(args);
        case 'supabase_upsert':
          return await this.handleUpsert(args);
        case 'supabase_count':
          return await this.handleCount(args);
        default:
          throw new McpError(ErrorCode.MethodNotFound, `Tool ${name} not found`);
      }
    } catch (error) {
      logger.error(`Database tool error for ${name}:`, error);
      throw error;
    }
  }

  async handleQuery(args) {
    const schema = Joi.object({
      table: Joi.string().required(),
      select: Joi.string().default('*'),
      filter: Joi.object().default({}),
      orderBy: Joi.object({
        column: Joi.string().required(),
        ascending: Joi.boolean().default(true)
      }).optional(),
      limit: Joi.number().min(1).max(this.maxQueryLimit).default(100),
      offset: Joi.number().min(0).default(0)
    });

    const { error, value } = schema.validate(args);
    if (error) {
      throw new McpError(ErrorCode.InvalidParams, error.details[0].message);
    }

    const { table, select, filter, orderBy, limit, offset } = value;

    try {
      let query = this.client.getClient()
        .from(table)
        .select(select, { count: 'exact' });

      // Apply filters
      Object.entries(filter).forEach(([key, filterValue]) => {
        if (typeof filterValue === 'object' && filterValue !== null) {
          // Handle complex filters like { gte: 100 }, { like: '%search%' }
          Object.entries(filterValue).forEach(([operator, operatorValue]) => {
            query = query[operator](key, operatorValue);
          });
        } else {
          // Simple equality filter
          query = query.eq(key, filterValue);
        }
      });

      // Apply ordering
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending });
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data, error: queryError, count } = await query;

      if (queryError) {
        throw queryError;
      }

      logger.info(`Query executed on table ${table}: ${data?.length || 0} rows returned`);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              data,
              count,
              metadata: {
                table,
                returned: data?.length || 0,
                total: count,
                offset,
                limit
              }
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Query failed: ${error.message}`
      );
    }
  }

  async handleInsert(args) {
    const schema = Joi.object({
      table: Joi.string().required(),
      data: Joi.object().required(),
      returning: Joi.string().default('*')
    });

    const { error, value } = schema.validate(args);
    if (error) {
      throw new McpError(ErrorCode.InvalidParams, error.details[0].message);
    }

    const { table, data, returning } = value;

    try {
      const { data: result, error: insertError } = await this.client.getClient()
        .from(table)
        .insert(data)
        .select(returning);

      if (insertError) {
        throw insertError;
      }

      logger.info(`Insert executed on table ${table}: ${result?.length || 0} rows inserted`);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              data: result,
              metadata: {
                table,
                operation: 'insert',
                affected: result?.length || 0
              }
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Insert failed: ${error.message}`
      );
    }
  }

  async handleUpdate(args) {
    const schema = Joi.object({
      table: Joi.string().required(),
      data: Joi.object().required(),
      filter: Joi.object().required(),
      returning: Joi.string().default('*')
    });

    const { error, value } = schema.validate(args);
    if (error) {
      throw new McpError(ErrorCode.InvalidParams, error.details[0].message);
    }

    const { table, data, filter, returning } = value;

    try {
      let query = this.client.getClient()
        .from(table)
        .update(data);

      // Apply filters
      Object.entries(filter).forEach(([key, filterValue]) => {
        query = query.eq(key, filterValue);
      });

      const { data: result, error: updateError } = await query.select(returning);

      if (updateError) {
        throw updateError;
      }

      logger.info(`Update executed on table ${table}: ${result?.length || 0} rows updated`);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              data: result,
              metadata: {
                table,
                operation: 'update',
                affected: result?.length || 0
              }
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Update failed: ${error.message}`
      );
    }
  }

  async handleDelete(args) {
    const schema = Joi.object({
      table: Joi.string().required(),
      filter: Joi.object().required(),
      returning: Joi.string().default('id')
    });

    const { error, value } = schema.validate(args);
    if (error) {
      throw new McpError(ErrorCode.InvalidParams, error.details[0].message);
    }

    const { table, filter, returning } = value;

    try {
      let query = this.client.getClient()
        .from(table)
        .delete();

      // Apply filters
      Object.entries(filter).forEach(([key, filterValue]) => {
        query = query.eq(key, filterValue);
      });

      const { data: result, error: deleteError } = await query.select(returning);

      if (deleteError) {
        throw deleteError;
      }

      logger.info(`Delete executed on table ${table}: ${result?.length || 0} rows deleted`);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              data: result,
              metadata: {
                table,
                operation: 'delete',
                affected: result?.length || 0
              }
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Delete failed: ${error.message}`
      );
    }
  }

  async handleUpsert(args) {
    const schema = Joi.object({
      table: Joi.string().required(),
      data: Joi.object().required(),
      onConflict: Joi.string().optional(),
      returning: Joi.string().default('*')
    });

    const { error, value } = schema.validate(args);
    if (error) {
      throw new McpError(ErrorCode.InvalidParams, error.details[0].message);
    }

    const { table, data, onConflict, returning } = value;

    try {
      let query = this.client.getClient()
        .from(table)
        .upsert(data);

      if (onConflict) {
        query = query.onConflict(onConflict);
      }

      const { data: result, error: upsertError } = await query.select(returning);

      if (upsertError) {
        throw upsertError;
      }

      logger.info(`Upsert executed on table ${table}: ${result?.length || 0} rows affected`);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              data: result,
              metadata: {
                table,
                operation: 'upsert',
                affected: result?.length || 0
              }
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Upsert failed: ${error.message}`
      );
    }
  }

  async handleCount(args) {
    const schema = Joi.object({
      table: Joi.string().required(),
      filter: Joi.object().default({})
    });

    const { error, value } = schema.validate(args);
    if (error) {
      throw new McpError(ErrorCode.InvalidParams, error.details[0].message);
    }

    const { table, filter } = value;

    try {
      let query = this.client.getClient()
        .from(table)
        .select('*', { count: 'exact', head: true });

      // Apply filters
      Object.entries(filter).forEach(([key, filterValue]) => {
        query = query.eq(key, filterValue);
      });

      const { count, error: countError } = await query;

      if (countError) {
        throw countError;
      }

      logger.info(`Count executed on table ${table}: ${count} rows`);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              count,
              metadata: {
                table,
                operation: 'count'
              }
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Count failed: ${error.message}`
      );
    }
  }
}