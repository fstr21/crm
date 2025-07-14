import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import logger from '../logger.js';
import Joi from 'joi';

export class AuthTools {
  constructor(supabaseClient) {
    this.client = supabaseClient;
    this.enableAuthTesting = process.env.ENABLE_AUTH_TESTING === 'true';
  }

  getTools() {
    const tools = [
      {
        name: 'supabase_auth_status',
        description: 'Get current authentication status',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      }
    ];

    // Only include auth testing tools if enabled
    if (this.enableAuthTesting) {
      tools.push(
        {
          name: 'supabase_auth_sign_up',
          description: 'Sign up a new user (testing only)',
          inputSchema: {
            type: 'object',
            properties: {
              email: {
                type: 'string',
                format: 'email',
                description: 'User email address'
              },
              password: {
                type: 'string',
                minLength: 6,
                description: 'User password (minimum 6 characters)'
              },
              metadata: {
                type: 'object',
                description: 'Additional user metadata',
                additionalProperties: true
              }
            },
            required: ['email', 'password']
          }
        },
        {
          name: 'supabase_auth_sign_in',
          description: 'Sign in an existing user (testing only)',
          inputSchema: {
            type: 'object',
            properties: {
              email: {
                type: 'string',
                format: 'email',
                description: 'User email address'
              },
              password: {
                type: 'string',
                description: 'User password'
              }
            },
            required: ['email', 'password']
          }
        },
        {
          name: 'supabase_auth_sign_out',
          description: 'Sign out the current user (testing only)',
          inputSchema: {
            type: 'object',
            properties: {}
          }
        },
        {
          name: 'supabase_auth_get_user',
          description: 'Get current authenticated user details (testing only)',
          inputSchema: {
            type: 'object',
            properties: {}
          }
        },
        {
          name: 'supabase_auth_update_user',
          description: 'Update user profile (testing only)',
          inputSchema: {
            type: 'object',
            properties: {
              email: {
                type: 'string',
                format: 'email',
                description: 'New email address'
              },
              password: {
                type: 'string',
                minLength: 6,
                description: 'New password'
              },
              data: {
                type: 'object',
                description: 'User metadata to update',
                additionalProperties: true
              }
            }
          }
        },
        {
          name: 'supabase_auth_reset_password',
          description: 'Send password reset email (testing only)',
          inputSchema: {
            type: 'object',
            properties: {
              email: {
                type: 'string',
                format: 'email',
                description: 'Email address to send reset link to'
              }
            },
            required: ['email']
          }
        }
      );
    }

    return tools;
  }

  async canHandle(toolName) {
    return toolName.startsWith('supabase_auth_');
  }

  async handleTool(name, args) {
    try {
      switch (name) {
        case 'supabase_auth_status':
          return await this.handleAuthStatus(args);
        case 'supabase_auth_sign_up':
          return await this.handleSignUp(args);
        case 'supabase_auth_sign_in':
          return await this.handleSignIn(args);
        case 'supabase_auth_sign_out':
          return await this.handleSignOut(args);
        case 'supabase_auth_get_user':
          return await this.handleGetUser(args);
        case 'supabase_auth_update_user':
          return await this.handleUpdateUser(args);
        case 'supabase_auth_reset_password':
          return await this.handleResetPassword(args);
        default:
          throw new McpError(ErrorCode.MethodNotFound, `Tool ${name} not found`);
      }
    } catch (error) {
      logger.error(`Auth tool error for ${name}:`, error);
      throw error;
    }
  }

  async handleAuthStatus(args) {
    try {
      const { data: { session }, error } = await this.client.getClient().auth.getSession();

      if (error) {
        throw error;
      }

      const status = {
        authenticated: !!session,
        session: session ? {
          access_token: session.access_token ? 'present' : 'missing',
          refresh_token: session.refresh_token ? 'present' : 'missing',
          expires_at: session.expires_at,
          token_type: session.token_type,
          user_id: session.user?.id,
          user_email: session.user?.email
        } : null,
        authEnabled: this.enableAuthTesting
      };

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              status,
              message: 'Authentication status retrieved'
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Auth status check failed: ${error.message}`
      );
    }
  }

  async handleSignUp(args) {
    if (!this.enableAuthTesting) {
      throw new McpError(
        ErrorCode.MethodNotFound,
        'Auth testing is disabled. Set ENABLE_AUTH_TESTING=true to enable.'
      );
    }

    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      metadata: Joi.object().optional()
    });

    const { error, value } = schema.validate(args);
    if (error) {
      throw new McpError(ErrorCode.InvalidParams, error.details[0].message);
    }

    try {
      const { data, error: signUpError } = await this.client.getClient().auth.signUp({
        email: value.email,
        password: value.password,
        options: {
          data: value.metadata || {}
        }
      });

      if (signUpError) {
        throw signUpError;
      }

      logger.info(`User signed up: ${value.email}`);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              user: {
                id: data.user?.id,
                email: data.user?.email,
                email_confirmed_at: data.user?.email_confirmed_at,
                created_at: data.user?.created_at
              },
              session: data.session ? {
                access_token: 'present',
                expires_at: data.session.expires_at
              } : null,
              message: 'User signed up successfully'
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Sign up failed: ${error.message}`
      );
    }
  }

  async handleSignIn(args) {
    if (!this.enableAuthTesting) {
      throw new McpError(
        ErrorCode.MethodNotFound,
        'Auth testing is disabled. Set ENABLE_AUTH_TESTING=true to enable.'
      );
    }

    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required()
    });

    const { error, value } = schema.validate(args);
    if (error) {
      throw new McpError(ErrorCode.InvalidParams, error.details[0].message);
    }

    try {
      const { data, error: signInError } = await this.client.getClient().auth.signInWithPassword({
        email: value.email,
        password: value.password
      });

      if (signInError) {
        throw signInError;
      }

      logger.info(`User signed in: ${value.email}`);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              user: {
                id: data.user?.id,
                email: data.user?.email,
                last_sign_in_at: data.user?.last_sign_in_at
              },
              session: {
                access_token: 'present',
                expires_at: data.session?.expires_at
              },
              message: 'User signed in successfully'
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Sign in failed: ${error.message}`
      );
    }
  }

  async handleSignOut(args) {
    if (!this.enableAuthTesting) {
      throw new McpError(
        ErrorCode.MethodNotFound,
        'Auth testing is disabled. Set ENABLE_AUTH_TESTING=true to enable.'
      );
    }

    try {
      const { error: signOutError } = await this.client.getClient().auth.signOut();

      if (signOutError) {
        throw signOutError;
      }

      logger.info('User signed out');

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              message: 'User signed out successfully'
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Sign out failed: ${error.message}`
      );
    }
  }

  async handleGetUser(args) {
    if (!this.enableAuthTesting) {
      throw new McpError(
        ErrorCode.MethodNotFound,
        'Auth testing is disabled. Set ENABLE_AUTH_TESTING=true to enable.'
      );
    }

    try {
      const { data: { user }, error } = await this.client.getClient().auth.getUser();

      if (error) {
        throw error;
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              user: user ? {
                id: user.id,
                email: user.email,
                email_confirmed_at: user.email_confirmed_at,
                phone: user.phone,
                created_at: user.created_at,
                updated_at: user.updated_at,
                last_sign_in_at: user.last_sign_in_at,
                user_metadata: user.user_metadata,
                app_metadata: user.app_metadata
              } : null,
              message: user ? 'User retrieved successfully' : 'No authenticated user'
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Get user failed: ${error.message}`
      );
    }
  }

  async handleUpdateUser(args) {
    if (!this.enableAuthTesting) {
      throw new McpError(
        ErrorCode.MethodNotFound,
        'Auth testing is disabled. Set ENABLE_AUTH_TESTING=true to enable.'
      );
    }

    const schema = Joi.object({
      email: Joi.string().email().optional(),
      password: Joi.string().min(6).optional(),
      data: Joi.object().optional()
    }).min(1);

    const { error, value } = schema.validate(args);
    if (error) {
      throw new McpError(ErrorCode.InvalidParams, error.details[0].message);
    }

    try {
      const updateData = {};
      if (value.email) updateData.email = value.email;
      if (value.password) updateData.password = value.password;
      if (value.data) updateData.data = value.data;

      const { data, error: updateError } = await this.client.getClient().auth.updateUser(updateData);

      if (updateError) {
        throw updateError;
      }

      logger.info(`User updated: ${data.user?.email}`);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              user: {
                id: data.user?.id,
                email: data.user?.email,
                updated_at: data.user?.updated_at,
                user_metadata: data.user?.user_metadata
              },
              message: 'User updated successfully'
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `User update failed: ${error.message}`
      );
    }
  }

  async handleResetPassword(args) {
    if (!this.enableAuthTesting) {
      throw new McpError(
        ErrorCode.MethodNotFound,
        'Auth testing is disabled. Set ENABLE_AUTH_TESTING=true to enable.'
      );
    }

    const schema = Joi.object({
      email: Joi.string().email().required()
    });

    const { error, value } = schema.validate(args);
    if (error) {
      throw new McpError(ErrorCode.InvalidParams, error.details[0].message);
    }

    try {
      const { error: resetError } = await this.client.getClient().auth.resetPasswordForEmail(value.email);

      if (resetError) {
        throw resetError;
      }

      logger.info(`Password reset email sent to: ${value.email}`);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              message: 'Password reset email sent successfully'
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Password reset failed: ${error.message}`
      );
    }
  }
}