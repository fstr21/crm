import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import logger from '../logger.js';
import Joi from 'joi';

export class RealtimeTools {
  constructor(supabaseClient) {
    this.client = supabaseClient;
    this.subscriptions = new Map();
  }

  getTools() {
    return [
      {
        name: 'supabase_realtime_subscribe',
        description: 'Subscribe to real-time changes on a table',
        inputSchema: {
          type: 'object',
          properties: {
            table: {
              type: 'string',
              description: 'Table name to subscribe to'
            },
            event: {
              type: 'string',
              enum: ['INSERT', 'UPDATE', 'DELETE', '*'],
              default: '*',
              description: 'Type of events to listen for'
            },
            filter: {
              type: 'string',
              description: 'Optional filter condition (e.g., "id=eq.123")'
            },
            subscriptionId: {
              type: 'string',
              description: 'Unique identifier for this subscription'
            }
          },
          required: ['table', 'subscriptionId']
        }
      },
      {
        name: 'supabase_realtime_unsubscribe',
        description: 'Unsubscribe from real-time changes',
        inputSchema: {
          type: 'object',
          properties: {
            subscriptionId: {
              type: 'string',
              description: 'Subscription ID to unsubscribe from'
            }
          },
          required: ['subscriptionId']
        }
      },
      {
        name: 'supabase_realtime_list_subscriptions',
        description: 'List all active real-time subscriptions',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'supabase_realtime_broadcast',
        description: 'Broadcast a message to a channel',
        inputSchema: {
          type: 'object',
          properties: {
            channel: {
              type: 'string',
              description: 'Channel name to broadcast to'
            },
            event: {
              type: 'string',
              description: 'Event name'
            },
            payload: {
              type: 'object',
              description: 'Message payload',
              additionalProperties: true
            }
          },
          required: ['channel', 'event', 'payload']
        }
      },
      {
        name: 'supabase_realtime_presence_track',
        description: 'Track user presence in a channel',
        inputSchema: {
          type: 'object',
          properties: {
            channel: {
              type: 'string',
              description: 'Channel name for presence tracking'
            },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                avatar: { type: 'string' },
                status: { type: 'string' }
              },
              required: ['id'],
              description: 'User information to track'
            }
          },
          required: ['channel', 'user']
        }
      },
      {
        name: 'supabase_realtime_presence_untrack',
        description: 'Stop tracking user presence in a channel',
        inputSchema: {
          type: 'object',
          properties: {
            channel: {
              type: 'string',
              description: 'Channel name to stop presence tracking'
            }
          },
          required: ['channel']
        }
      }
    ];
  }

  async canHandle(toolName) {
    return toolName.startsWith('supabase_realtime_');
  }

  async handleTool(name, args) {
    try {
      switch (name) {
        case 'supabase_realtime_subscribe':
          return await this.handleSubscribe(args);
        case 'supabase_realtime_unsubscribe':
          return await this.handleUnsubscribe(args);
        case 'supabase_realtime_list_subscriptions':
          return await this.handleListSubscriptions(args);
        case 'supabase_realtime_broadcast':
          return await this.handleBroadcast(args);
        case 'supabase_realtime_presence_track':
          return await this.handlePresenceTrack(args);
        case 'supabase_realtime_presence_untrack':
          return await this.handlePresenceUntrack(args);
        default:
          throw new McpError(ErrorCode.MethodNotFound, `Tool ${name} not found`);
      }
    } catch (error) {
      logger.error(`Realtime tool error for ${name}:`, error);
      throw error;
    }
  }

  async handleSubscribe(args) {
    const schema = Joi.object({
      table: Joi.string().required(),
      event: Joi.string().valid('INSERT', 'UPDATE', 'DELETE', '*').default('*'),
      filter: Joi.string().optional(),
      subscriptionId: Joi.string().required()
    });

    const { error, value } = schema.validate(args);
    if (error) {
      throw new McpError(ErrorCode.InvalidParams, error.details[0].message);
    }

    try {
      const { table, event, filter, subscriptionId } = value;

      // Check if subscription already exists
      if (this.subscriptions.has(subscriptionId)) {
        throw new Error(`Subscription with ID ${subscriptionId} already exists`);
      }

      // Create channel name
      const channelName = `realtime:${table}`;

      // Create subscription
      let channel = this.client.getClient()
        .channel(channelName)
        .on('postgres_changes', {
          event,
          schema: 'public',
          table,
          filter
        }, (payload) => {
          this.handleRealtimeEvent(subscriptionId, payload);
        });

      // Subscribe to the channel
      const subscriptionResponse = await new Promise((resolve, reject) => {
        channel.subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            resolve({ status: 'SUBSCRIBED' });
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            reject(new Error(`Subscription failed with status: ${status}`));
          }
        });
      });

      // Store subscription info
      this.subscriptions.set(subscriptionId, {
        channel,
        table,
        event,
        filter,
        subscribedAt: new Date().toISOString(),
        eventsReceived: 0
      });

      logger.info(`Real-time subscription created: ${subscriptionId} for table ${table}`);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              subscription: {
                id: subscriptionId,
                table,
                event,
                filter,
                status: 'SUBSCRIBED',
                subscribedAt: new Date().toISOString()
              },
              message: 'Real-time subscription created successfully'
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Subscription failed: ${error.message}`
      );
    }
  }

  async handleUnsubscribe(args) {
    const schema = Joi.object({
      subscriptionId: Joi.string().required()
    });

    const { error, value } = schema.validate(args);
    if (error) {
      throw new McpError(ErrorCode.InvalidParams, error.details[0].message);
    }

    try {
      const { subscriptionId } = value;

      const subscription = this.subscriptions.get(subscriptionId);
      if (!subscription) {
        throw new Error(`Subscription with ID ${subscriptionId} not found`);
      }

      // Unsubscribe from the channel
      await subscription.channel.unsubscribe();

      // Remove from our tracking
      this.subscriptions.delete(subscriptionId);

      logger.info(`Real-time subscription removed: ${subscriptionId}`);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              subscriptionId,
              message: 'Subscription removed successfully'
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Unsubscribe failed: ${error.message}`
      );
    }
  }

  async handleListSubscriptions(args) {
    try {
      const subscriptions = Array.from(this.subscriptions.entries()).map(([id, sub]) => ({
        id,
        table: sub.table,
        event: sub.event,
        filter: sub.filter,
        subscribedAt: sub.subscribedAt,
        eventsReceived: sub.eventsReceived,
        status: 'ACTIVE'
      }));

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              subscriptions,
              count: subscriptions.length,
              message: 'Active subscriptions listed'
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `List subscriptions failed: ${error.message}`
      );
    }
  }

  async handleBroadcast(args) {
    const schema = Joi.object({
      channel: Joi.string().required(),
      event: Joi.string().required(),
      payload: Joi.object().required()
    });

    const { error, value } = schema.validate(args);
    if (error) {
      throw new McpError(ErrorCode.InvalidParams, error.details[0].message);
    }

    try {
      const { channel: channelName, event, payload } = value;

      const channel = this.client.getClient().channel(channelName);
      
      const response = await channel.send({
        type: 'broadcast',
        event,
        payload
      });

      logger.info(`Broadcast sent to channel ${channelName}: ${event}`);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              broadcast: {
                channel: channelName,
                event,
                payload,
                response,
                sentAt: new Date().toISOString()
              },
              message: 'Broadcast sent successfully'
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Broadcast failed: ${error.message}`
      );
    }
  }

  async handlePresenceTrack(args) {
    const schema = Joi.object({
      channel: Joi.string().required(),
      user: Joi.object({
        id: Joi.string().required(),
        name: Joi.string().optional(),
        avatar: Joi.string().optional(),
        status: Joi.string().optional()
      }).required()
    });

    const { error, value } = schema.validate(args);
    if (error) {
      throw new McpError(ErrorCode.InvalidParams, error.details[0].message);
    }

    try {
      const { channel: channelName, user } = value;

      const channel = this.client.getClient().channel(channelName);

      // Track presence
      const presenceResponse = await channel.track({
        user_id: user.id,
        name: user.name || 'Anonymous',
        avatar: user.avatar || null,
        status: user.status || 'online',
        joined_at: new Date().toISOString()
      });

      logger.info(`Presence tracking started for user ${user.id} in channel ${channelName}`);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              presence: {
                channel: channelName,
                user,
                response: presenceResponse,
                trackedAt: new Date().toISOString()
              },
              message: 'Presence tracking started'
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Presence tracking failed: ${error.message}`
      );
    }
  }

  async handlePresenceUntrack(args) {
    const schema = Joi.object({
      channel: Joi.string().required()
    });

    const { error, value } = schema.validate(args);
    if (error) {
      throw new McpError(ErrorCode.InvalidParams, error.details[0].message);
    }

    try {
      const { channel: channelName } = value;

      const channel = this.client.getClient().channel(channelName);

      // Untrack presence
      const response = await channel.untrack();

      logger.info(`Presence tracking stopped for channel ${channelName}`);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              presence: {
                channel: channelName,
                response,
                untrackedAt: new Date().toISOString()
              },
              message: 'Presence tracking stopped'
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Presence untrack failed: ${error.message}`
      );
    }
  }

  handleRealtimeEvent(subscriptionId, payload) {
    try {
      const subscription = this.subscriptions.get(subscriptionId);
      if (subscription) {
        subscription.eventsReceived++;
        
        logger.info(`Real-time event received for subscription ${subscriptionId}:`, {
          eventType: payload.eventType,
          table: payload.table,
          schema: payload.schema,
          new: payload.new ? 'present' : 'null',
          old: payload.old ? 'present' : 'null'
        });

        // In a real implementation, you might want to store these events
        // or forward them to another system
        // For now, we just log them
      }
    } catch (error) {
      logger.error(`Error handling real-time event for subscription ${subscriptionId}:`, error);
    }
  }

  // Cleanup method to unsubscribe from all active subscriptions
  async cleanup() {
    try {
      const subscriptionIds = Array.from(this.subscriptions.keys());
      
      for (const subscriptionId of subscriptionIds) {
        await this.handleUnsubscribe({ subscriptionId });
      }

      logger.info('All real-time subscriptions cleaned up');
    } catch (error) {
      logger.error('Error during real-time subscriptions cleanup:', error);
    }
  }
}