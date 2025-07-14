import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import logger from '../logger.js';
import Joi from 'joi';

export class StorageTools {
  constructor(supabaseClient) {
    this.client = supabaseClient;
  }

  getTools() {
    return [
      {
        name: 'supabase_storage_list_buckets',
        description: 'List all storage buckets',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'supabase_storage_create_bucket',
        description: 'Create a new storage bucket',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              pattern: '^[a-z0-9][a-z0-9-]*[a-z0-9]$',
              description: 'Bucket name (lowercase, alphanumeric with hyphens)'
            },
            public: {
              type: 'boolean',
              default: false,
              description: 'Whether the bucket should be public'
            },
            fileSizeLimit: {
              type: 'number',
              description: 'Maximum file size in bytes'
            },
            allowedMimeTypes: {
              type: 'array',
              items: { type: 'string' },
              description: 'Allowed MIME types for uploads'
            }
          },
          required: ['name']
        }
      },
      {
        name: 'supabase_storage_delete_bucket',
        description: 'Delete a storage bucket',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Bucket name to delete'
            }
          },
          required: ['name']
        }
      },
      {
        name: 'supabase_storage_list_files',
        description: 'List files in a storage bucket',
        inputSchema: {
          type: 'object',
          properties: {
            bucket: {
              type: 'string',
              description: 'Bucket name'
            },
            path: {
              type: 'string',
              default: '',
              description: 'Path within the bucket (optional)'
            },
            limit: {
              type: 'number',
              default: 100,
              maximum: 1000,
              description: 'Maximum number of files to return'
            },
            offset: {
              type: 'number',
              default: 0,
              description: 'Number of files to skip'
            }
          },
          required: ['bucket']
        }
      },
      {
        name: 'supabase_storage_upload_file',
        description: 'Upload a file to storage (base64 content)',
        inputSchema: {
          type: 'object',
          properties: {
            bucket: {
              type: 'string',
              description: 'Bucket name'
            },
            path: {
              type: 'string',
              description: 'File path within the bucket'
            },
            content: {
              type: 'string',
              description: 'Base64 encoded file content'
            },
            contentType: {
              type: 'string',
              description: 'MIME type of the file'
            },
            upsert: {
              type: 'boolean',
              default: false,
              description: 'Whether to overwrite existing file'
            }
          },
          required: ['bucket', 'path', 'content', 'contentType']
        }
      },
      {
        name: 'supabase_storage_download_file',
        description: 'Download a file from storage',
        inputSchema: {
          type: 'object',
          properties: {
            bucket: {
              type: 'string',
              description: 'Bucket name'
            },
            path: {
              type: 'string',
              description: 'File path within the bucket'
            },
            returnBase64: {
              type: 'boolean',
              default: false,
              description: 'Return file content as base64'
            }
          },
          required: ['bucket', 'path']
        }
      },
      {
        name: 'supabase_storage_delete_file',
        description: 'Delete a file from storage',
        inputSchema: {
          type: 'object',
          properties: {
            bucket: {
              type: 'string',
              description: 'Bucket name'
            },
            path: {
              type: 'string',
              description: 'File path within the bucket'
            }
          },
          required: ['bucket', 'path']
        }
      },
      {
        name: 'supabase_storage_create_signed_url',
        description: 'Create a signed URL for file access',
        inputSchema: {
          type: 'object',
          properties: {
            bucket: {
              type: 'string',
              description: 'Bucket name'
            },
            path: {
              type: 'string',
              description: 'File path within the bucket'
            },
            expiresIn: {
              type: 'number',
              default: 3600,
              description: 'URL expiration time in seconds'
            },
            download: {
              type: 'boolean',
              default: false,
              description: 'Force download when accessing URL'
            }
          },
          required: ['bucket', 'path']
        }
      },
      {
        name: 'supabase_storage_get_public_url',
        description: 'Get public URL for a file (if bucket is public)',
        inputSchema: {
          type: 'object',
          properties: {
            bucket: {
              type: 'string',
              description: 'Bucket name'
            },
            path: {
              type: 'string',
              description: 'File path within the bucket'
            },
            download: {
              type: 'boolean',
              default: false,
              description: 'Force download when accessing URL'
            }
          },
          required: ['bucket', 'path']
        }
      },
      {
        name: 'supabase_storage_move_file',
        description: 'Move or rename a file in storage',
        inputSchema: {
          type: 'object',
          properties: {
            bucket: {
              type: 'string',
              description: 'Bucket name'
            },
            fromPath: {
              type: 'string',
              description: 'Current file path'
            },
            toPath: {
              type: 'string',
              description: 'New file path'
            }
          },
          required: ['bucket', 'fromPath', 'toPath']
        }
      }
    ];
  }

  async canHandle(toolName) {
    return toolName.startsWith('supabase_storage_');
  }

  async handleTool(name, args) {
    try {
      switch (name) {
        case 'supabase_storage_list_buckets':
          return await this.handleListBuckets(args);
        case 'supabase_storage_create_bucket':
          return await this.handleCreateBucket(args);
        case 'supabase_storage_delete_bucket':
          return await this.handleDeleteBucket(args);
        case 'supabase_storage_list_files':
          return await this.handleListFiles(args);
        case 'supabase_storage_upload_file':
          return await this.handleUploadFile(args);
        case 'supabase_storage_download_file':
          return await this.handleDownloadFile(args);
        case 'supabase_storage_delete_file':
          return await this.handleDeleteFile(args);
        case 'supabase_storage_create_signed_url':
          return await this.handleCreateSignedUrl(args);
        case 'supabase_storage_get_public_url':
          return await this.handleGetPublicUrl(args);
        case 'supabase_storage_move_file':
          return await this.handleMoveFile(args);
        default:
          throw new McpError(ErrorCode.MethodNotFound, `Tool ${name} not found`);
      }
    } catch (error) {
      logger.error(`Storage tool error for ${name}:`, error);
      throw error;
    }
  }

  async handleListBuckets(args) {
    try {
      const { data: buckets, error } = await this.client.getClient().storage.listBuckets();

      if (error) {
        throw error;
      }

      logger.info(`Listed ${buckets?.length || 0} storage buckets`);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              buckets: buckets || [],
              count: buckets?.length || 0,
              message: 'Storage buckets listed successfully'
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `List buckets failed: ${error.message}`
      );
    }
  }

  async handleCreateBucket(args) {
    const schema = Joi.object({
      name: Joi.string().pattern(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/).required(),
      public: Joi.boolean().default(false),
      fileSizeLimit: Joi.number().optional(),
      allowedMimeTypes: Joi.array().items(Joi.string()).optional()
    });

    const { error, value } = schema.validate(args);
    if (error) {
      throw new McpError(ErrorCode.InvalidParams, error.details[0].message);
    }

    try {
      const options = {
        public: value.public
      };

      if (value.fileSizeLimit) {
        options.fileSizeLimit = value.fileSizeLimit;
      }

      if (value.allowedMimeTypes) {
        options.allowedMimeTypes = value.allowedMimeTypes;
      }

      const { data, error: createError } = await this.client.getClient(true).storage
        .createBucket(value.name, options);

      if (createError) {
        throw createError;
      }

      logger.info(`Storage bucket created: ${value.name}`);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              bucket: {
                name: value.name,
                public: value.public,
                ...options
              },
              data,
              message: 'Storage bucket created successfully'
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Create bucket failed: ${error.message}`
      );
    }
  }

  async handleDeleteBucket(args) {
    const schema = Joi.object({
      name: Joi.string().required()
    });

    const { error, value } = schema.validate(args);
    if (error) {
      throw new McpError(ErrorCode.InvalidParams, error.details[0].message);
    }

    try {
      const { data, error: deleteError } = await this.client.getClient(true).storage
        .deleteBucket(value.name);

      if (deleteError) {
        throw deleteError;
      }

      logger.info(`Storage bucket deleted: ${value.name}`);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              bucket: value.name,
              data,
              message: 'Storage bucket deleted successfully'
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Delete bucket failed: ${error.message}`
      );
    }
  }

  async handleListFiles(args) {
    const schema = Joi.object({
      bucket: Joi.string().required(),
      path: Joi.string().default(''),
      limit: Joi.number().min(1).max(1000).default(100),
      offset: Joi.number().min(0).default(0)
    });

    const { error, value } = schema.validate(args);
    if (error) {
      throw new McpError(ErrorCode.InvalidParams, error.details[0].message);
    }

    try {
      const { data: files, error: listError } = await this.client.getClient().storage
        .from(value.bucket)
        .list(value.path, {
          limit: value.limit,
          offset: value.offset
        });

      if (listError) {
        throw listError;
      }

      logger.info(`Listed ${files?.length || 0} files from bucket ${value.bucket}/${value.path}`);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              files: files || [],
              count: files?.length || 0,
              bucket: value.bucket,
              path: value.path,
              pagination: {
                limit: value.limit,
                offset: value.offset
              },
              message: 'Files listed successfully'
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `List files failed: ${error.message}`
      );
    }
  }

  async handleUploadFile(args) {
    const schema = Joi.object({
      bucket: Joi.string().required(),
      path: Joi.string().required(),
      content: Joi.string().required(),
      contentType: Joi.string().required(),
      upsert: Joi.boolean().default(false)
    });

    const { error, value } = schema.validate(args);
    if (error) {
      throw new McpError(ErrorCode.InvalidParams, error.details[0].message);
    }

    try {
      // Convert base64 to buffer
      const fileBuffer = Buffer.from(value.content, 'base64');

      const { data, error: uploadError } = await this.client.getClient().storage
        .from(value.bucket)
        .upload(value.path, fileBuffer, {
          contentType: value.contentType,
          upsert: value.upsert
        });

      if (uploadError) {
        throw uploadError;
      }

      logger.info(`File uploaded to ${value.bucket}/${value.path} (${fileBuffer.length} bytes)`);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              upload: {
                bucket: value.bucket,
                path: value.path,
                contentType: value.contentType,
                size: fileBuffer.length,
                upsert: value.upsert
              },
              data,
              message: 'File uploaded successfully'
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `File upload failed: ${error.message}`
      );
    }
  }

  async handleDownloadFile(args) {
    const schema = Joi.object({
      bucket: Joi.string().required(),
      path: Joi.string().required(),
      returnBase64: Joi.boolean().default(false)
    });

    const { error, value } = schema.validate(args);
    if (error) {
      throw new McpError(ErrorCode.InvalidParams, error.details[0].message);
    }

    try {
      const { data, error: downloadError } = await this.client.getClient().storage
        .from(value.bucket)
        .download(value.path);

      if (downloadError) {
        throw downloadError;
      }

      if (!data) {
        throw new Error('No file data received');
      }

      let content = null;
      let contentType = 'application/octet-stream';

      if (value.returnBase64) {
        // Convert blob to base64
        const arrayBuffer = await data.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        content = buffer.toString('base64');
        contentType = data.type || contentType;
      }

      logger.info(`File downloaded from ${value.bucket}/${value.path} (${data.size} bytes)`);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              download: {
                bucket: value.bucket,
                path: value.path,
                size: data.size,
                type: data.type,
                lastModified: data.lastModified,
                content: content // only present if returnBase64 is true
              },
              message: 'File downloaded successfully'
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `File download failed: ${error.message}`
      );
    }
  }

  async handleDeleteFile(args) {
    const schema = Joi.object({
      bucket: Joi.string().required(),
      path: Joi.string().required()
    });

    const { error, value } = schema.validate(args);
    if (error) {
      throw new McpError(ErrorCode.InvalidParams, error.details[0].message);
    }

    try {
      const { data, error: deleteError } = await this.client.getClient().storage
        .from(value.bucket)
        .remove([value.path]);

      if (deleteError) {
        throw deleteError;
      }

      logger.info(`File deleted from ${value.bucket}/${value.path}`);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              delete: {
                bucket: value.bucket,
                path: value.path
              },
              data,
              message: 'File deleted successfully'
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `File delete failed: ${error.message}`
      );
    }
  }

  async handleCreateSignedUrl(args) {
    const schema = Joi.object({
      bucket: Joi.string().required(),
      path: Joi.string().required(),
      expiresIn: Joi.number().min(1).max(31536000).default(3600), // max 1 year
      download: Joi.boolean().default(false)
    });

    const { error, value } = schema.validate(args);
    if (error) {
      throw new McpError(ErrorCode.InvalidParams, error.details[0].message);
    }

    try {
      const { data, error: signError } = await this.client.getClient().storage
        .from(value.bucket)
        .createSignedUrl(value.path, value.expiresIn, {
          download: value.download
        });

      if (signError) {
        throw signError;
      }

      logger.info(`Signed URL created for ${value.bucket}/${value.path} (expires in ${value.expiresIn}s)`);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              signedUrl: {
                bucket: value.bucket,
                path: value.path,
                url: data.signedUrl,
                expiresIn: value.expiresIn,
                download: value.download,
                expiresAt: new Date(Date.now() + value.expiresIn * 1000).toISOString()
              },
              message: 'Signed URL created successfully'
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Create signed URL failed: ${error.message}`
      );
    }
  }

  async handleGetPublicUrl(args) {
    const schema = Joi.object({
      bucket: Joi.string().required(),
      path: Joi.string().required(),
      download: Joi.boolean().default(false)
    });

    const { error, value } = schema.validate(args);
    if (error) {
      throw new McpError(ErrorCode.InvalidParams, error.details[0].message);
    }

    try {
      const { data } = this.client.getClient().storage
        .from(value.bucket)
        .getPublicUrl(value.path, {
          download: value.download
        });

      logger.info(`Public URL retrieved for ${value.bucket}/${value.path}`);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              publicUrl: {
                bucket: value.bucket,
                path: value.path,
                url: data.publicUrl,
                download: value.download
              },
              message: 'Public URL retrieved successfully'
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Get public URL failed: ${error.message}`
      );
    }
  }

  async handleMoveFile(args) {
    const schema = Joi.object({
      bucket: Joi.string().required(),
      fromPath: Joi.string().required(),
      toPath: Joi.string().required()
    });

    const { error, value } = schema.validate(args);
    if (error) {
      throw new McpError(ErrorCode.InvalidParams, error.details[0].message);
    }

    try {
      const { data, error: moveError } = await this.client.getClient().storage
        .from(value.bucket)
        .move(value.fromPath, value.toPath);

      if (moveError) {
        throw moveError;
      }

      logger.info(`File moved in ${value.bucket}: ${value.fromPath} -> ${value.toPath}`);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              move: {
                bucket: value.bucket,
                fromPath: value.fromPath,
                toPath: value.toPath
              },
              data,
              message: 'File moved successfully'
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `File move failed: ${error.message}`
      );
    }
  }
}