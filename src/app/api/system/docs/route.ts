import { NextResponse } from 'next/server'

export async function GET() {
  const apiDocs = {
    title: '星语管理系统 API 文档',
    version: '1.0.0',
    description: '星语后台管理系统的REST API接口文档',
    baseUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    endpoints: {
      authentication: {
        register: {
          method: 'POST',
          path: '/api/auth/register',
          description: '用户注册',
          body: {
            email: 'string (required) - 邮箱地址',
            username: 'string (required) - 用户名',
            password: 'string (required) - 密码',
            name: 'string (optional) - 姓名'
          },
          response: {
            success: 'boolean',
            data: {
              user: 'User object',
              token: 'string - JWT token'
            }
          }
        },
        login: {
          method: 'POST',
          path: '/api/auth/login',
          description: '用户登录',
          body: {
            email: 'string (required) - 邮箱地址',
            password: 'string (required) - 密码'
          },
          response: {
            success: 'boolean',
            data: {
              user: 'User object',
              token: 'string - JWT token'
            }
          }
        },
        me: {
          method: 'GET',
          path: '/api/auth/me',
          description: '获取当前用户信息',
          headers: {
            'Authorization': 'Bearer <token>'
          },
          response: {
            success: 'boolean',
            data: {
              user: 'User object'
            }
          }
        }
      },
      users: {
        list: {
          method: 'GET',
          path: '/api/users',
          description: '获取用户列表（需要MODERATOR权限）',
          headers: {
            'Authorization': 'Bearer <token>'
          },
          query: {
            page: 'number (optional) - 页码，默认1',
            limit: 'number (optional) - 每页数量，默认20',
            search: 'string (optional) - 搜索关键词',
            role: 'string (optional) - 用户角色过滤'
          },
          response: {
            success: 'boolean',
            data: {
              users: 'User[]',
              pagination: {
                page: 'number',
                limit: 'number',
                total: 'number',
                pages: 'number'
              }
            }
          }
        }
      },
      posts: {
        list: {
          method: 'GET',
          path: '/api/posts',
          description: '获取文章列表',
          query: {
            page: 'number (optional) - 页码，默认1',
            limit: 'number (optional) - 每页数量，默认20',
            search: 'string (optional) - 搜索关键词',
            status: 'string (optional) - 文章状态过滤',
            authorId: 'string (optional) - 作者ID过滤'
          },
          response: {
            success: 'boolean',
            data: {
              posts: 'Post[]',
              pagination: {
                page: 'number',
                limit: 'number',
                total: 'number',
                pages: 'number'
              }
            }
          }
        },
        create: {
          method: 'POST',
          path: '/api/posts',
          description: '创建文章（需要认证）',
          headers: {
            'Authorization': 'Bearer <token>',
            'Content-Type': 'application/json'
          },
          body: {
            title: 'string (required) - 文章标题',
            content: 'string (required) - 文章内容',
            status: 'string (optional) - 文章状态，默认DRAFT'
          },
          response: {
            success: 'boolean',
            data: {
              post: 'Post object'
            }
          }
        }
      },
      apiKeys: {
        list: {
          method: 'GET',
          path: '/api/api-keys',
          description: '获取API密钥列表（需要认证）',
          headers: {
            'Authorization': 'Bearer <token>'
          },
          response: {
            success: 'boolean',
            data: {
              apiKeys: 'ApiKey[]'
            }
          }
        },
        create: {
          method: 'POST',
          path: '/api/api-keys',
          description: '创建API密钥（需要认证）',
          headers: {
            'Authorization': 'Bearer <token>',
            'Content-Type': 'application/json'
          },
          body: {
            name: 'string (required) - 密钥名称',
            permissions: {
              read: 'boolean (optional) - 读取权限',
              write: 'boolean (optional) - 写入权限',
              delete: 'boolean (optional) - 删除权限',
              admin: 'boolean (optional) - 管理权限'
            },
            expiresAt: 'string (optional) - 过期时间（ISO格式）'
          },
          response: {
            success: 'boolean',
            data: {
              apiKey: 'ApiKey object'
            }
          }
        },
        revoke: {
          method: 'POST',
          path: '/api/api-keys/{id}/revoke',
          description: '撤销API密钥（需要认证）',
          headers: {
            'Authorization': 'Bearer <token>'
          },
          response: {
            success: 'boolean',
            data: {
              apiKey: 'ApiKey object'
            }
          }
        }
      },
      stats: {
        dashboard: {
          method: 'GET',
          path: '/api/stats',
          description: '获取仪表盘统计数据（需要MODERATOR权限）',
          headers: {
            'Authorization': 'Bearer <token>'
          },
          response: {
            success: 'boolean',
            data: {
              stats: {
                users: {
                  total: 'number',
                  active: 'number',
                  recent: 'User[]'
                },
                posts: {
                  total: 'number',
                  published: 'number',
                  draft: 'number',
                  recent: 'Post[]'
                },
                apiKeys: {
                  total: 'number',
                  active: 'number'
                }
              }
            }
          }
        }
      }
    },
    dataTypes: {
      User: {
        id: 'string - 用户ID',
        email: 'string - 邮箱地址',
        username: 'string - 用户名',
        name: 'string - 姓名',
        avatar: 'string | null - 头像URL',
        role: 'string - 用户角色（ADMIN, MODERATOR, USER）',
        isActive: 'boolean - 是否活跃',
        createdAt: 'string - 创建时间（ISO格式）',
        updatedAt: 'string - 更新时间（ISO格式）'
      },
      Post: {
        id: 'string - 文章ID',
        title: 'string - 文章标题',
        content: 'string - 文章内容',
        slug: 'string - 文章别名',
        status: 'string - 文章状态（DRAFT, PUBLISHED, ARCHIVED）',
        publishedAt: 'string | null - 发布时间（ISO格式）',
        createdAt: 'string - 创建时间（ISO格式）',
        updatedAt: 'string - 更新时间（ISO格式）',
        author: 'User - 作者信息',
        updater: 'User | null - 最后更新者'
      },
      ApiKey: {
        id: 'string - 密钥ID',
        name: 'string - 密钥名称',
        key: 'string - 密钥值',
        permissions: 'string[] - 权限列表',
        isActive: 'boolean - 是否活跃',
        lastUsed: 'string | null - 最后使用时间（ISO格式）',
        expiresAt: 'string | null - 过期时间（ISO格式）',
        createdAt: 'string - 创建时间（ISO格式）',
        updatedAt: 'string - 更新时间（ISO格式）'
      }
    },
    errorCodes: {
      400: '请求参数错误',
      401: '未认证或认证失败',
      403: '权限不足',
      404: '资源不存在',
      500: '服务器内部错误'
    },
    examples: {
      register: {
        request: {
          email: 'user@example.com',
          username: 'testuser',
          password: 'password123',
          name: '测试用户'
        },
        response: {
          success: true,
          data: {
            user: {
              id: 'clx123456789',
              email: 'user@example.com',
              username: 'testuser',
              name: '测试用户',
              role: 'USER',
              isActive: true,
              createdAt: '2024-01-01T00:00:00.000Z',
              updatedAt: '2024-01-01T00:00:00.000Z'
            },
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
          }
        }
      },
      login: {
        request: {
          email: 'user@example.com',
          password: 'password123'
        },
        response: {
          success: true,
          data: {
            user: {
              id: 'clx123456789',
              email: 'user@example.com',
              username: 'testuser',
              name: '测试用户',
              role: 'USER',
              isActive: true,
              createdAt: '2024-01-01T00:00:00.000Z',
              updatedAt: '2024-01-01T00:00:00.000Z'
            },
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
          }
        }
      }
    }
  }

  return NextResponse.json(apiDocs, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  })
}
