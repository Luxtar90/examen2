export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  const openapi = {
    openapi: '3.0.0',
    info: { title: 'Tienda Svelte API', version: '1.0.0', description: 'Artículos y pedidos' },
    paths: {
      '/api/admin/promote': {
        post: {
          summary: 'Cambiar rol de usuario',
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, id: { type: 'string' }, role: { type: 'string', enum: ['admin','cliente'] } } } } } },
          responses: {
            '200': { description: 'Rol actualizado', content: { 'application/json': { schema: { type: 'object', properties: { user: { $ref: '#/components/schemas/User' } }, required: ['user'] } } } },
            '404': { description: 'Usuario no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
          }
        }
      },
      '/api/auth/register': {
        post: {
          summary: 'Registrar cliente o admin',
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' }, name: { type: 'string' }, role: { type: 'string', enum: ['admin','cliente'] }, adminSecret: { type: 'string' } }, required: ['email','password'] } } } },
          responses: {
            '201': { description: 'Registro exitoso', content: { 'application/json': { schema: { type: 'object', properties: { token: { type: 'string' }, user: { $ref: '#/components/schemas/User' } }, required: ['token','user'] } } } },
            '409': { description: 'Usuario ya existe', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            '403': { description: 'Clave admin inválida', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
          }
        }
      },
      '/api/auth/login': {
        post: {
          summary: 'Iniciar sesión',
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' }, role: { type: 'string', enum: ['admin','cliente'] }, name: { type: 'string' } }, required: ['email','password','role'] } } } },
          responses: {
            '200': { description: 'Login exitoso', content: { 'application/json': { schema: { type: 'object', properties: { token: { type: 'string' }, user: { $ref: '#/components/schemas/User' } }, required: ['token','user'] } } } },
            '401': { description: 'Credenciales inválidas', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
          }
        }
      },
      '/api/items': {
        get: {
          summary: 'Listar artículos',
          responses: {
            '200': {
              description: 'Lista de artículos',
              content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Item' } } } }
            }
          }
        },
        post: {
          summary: 'Crear artículo',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateItemRequest' } } } },
          security: [{ bearerAuth: [] }],
          responses: {
            '201': { description: 'Artículo creado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Item' } } } },
            '400': { description: 'Datos inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
          }
        }
      },
      '/api/orders': {
        get: {
          summary: 'Listar pedidos',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': { description: 'Lista de pedidos', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Order' } } } } }
          }
        },
        post: {
          summary: 'Crear pedido',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateOrderRequest' } } } },
          security: [{ bearerAuth: [] }],
          responses: {
            '201': { description: 'Pedido creado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Order' } } } },
            '400': { description: 'Cantidad o datos inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            '404': { description: 'Artículo no existe', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
          }
        }
      },
      '/api/vendor/orders': {
        get: {
          summary: 'Listar pedidos para vendedor',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': { description: 'Lista de pedidos', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Order' } } } } }
          }
        }
      }
    },
    components: {
      securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
      schemas: {
        User: { type: 'object', properties: { email: { type: 'string' }, role: { type: 'string' }, name: { type: 'string' }, id: { type: 'string' } }, required: ['email','role'] },
        Item: {
          type: 'object',
          properties: { id: { type: 'string' }, name: { type: 'string' }, price: { type: 'number' }, stock: { type: 'number' } },
          required: ['id', 'name', 'price', 'stock']
        },
        Customer: {
          type: 'object',
          properties: { name: { type: 'string' }, address: { type: 'string' }, phone: { type: 'string' } },
          required: ['name', 'address', 'phone']
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            itemId: { type: 'string' },
            quantity: { type: 'integer' },
            customer: { $ref: '#/components/schemas/Customer' },
            total: { type: 'number' },
            createdAt: { type: 'string', format: 'date-time' }
          },
          required: ['id', 'itemId', 'quantity', 'customer', 'total', 'createdAt']
        },
        Error: { type: 'object', properties: { error: { type: 'string' } }, required: ['error'] },
        CreateItemRequest: {
          type: 'object',
          properties: { name: { type: 'string' }, price: { type: 'number' }, stock: { type: 'number' } },
          required: ['name', 'price', 'stock']
        },
        CreateOrderRequest: {
          type: 'object',
          properties: { itemId: { type: 'string' }, quantity: { type: 'integer' }, customer: { $ref: '#/components/schemas/Customer' } },
          required: ['itemId', 'quantity', 'customer']
        }
      }
    }
  }
  res.setHeader('Content-Type', 'application/json')
  res.status(200).send(JSON.stringify(openapi))
}