# @bdcode/hono-zod-oas31

A TypeScript-first OpenAPI wrapper for [Hono](https://hono.dev) with [Zod](https://zod.dev) schema validation and automatic OpenAPI documentation generation.

<p>
  <a href="https://www.npmjs.com/package/@bdcode/hono-zod-oas31">
    <img src="https://img.shields.io/npm/v/@bdcode/hono-zod-oas31" alt="npm version" />
  </a>
  <a href="https://github.com/codecontinent/hono-zod-oas31/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/codecontinent/hono-zod-oas31" alt="GitHub license" />
  </a>
  <a href="https://github.com/codecontinent/hono-zod-oas31/actions/workflows/release.yml">
    <img src="https://github.com/codecontinent/hono-zod-oas31/actions/workflows/release.yml/badge.svg" alt="Release" />
  </a>
</p>

</p>

## Features

- 🔥 **Built for Hono** - Seamless integration with Hono framework
- 🛡️ **Type-safe** - Full TypeScript support with intelligent type inference
- 📖 **Auto-generated docs** - Automatic OpenAPI 3.0/3.1 documentation
- ⚡ **Zod validation** - Request/response validation with Zod schemas
- 🔗 **Webhook support** - OAS v3.1+ webhooks generation support
- 🎯 **Zero-config** - Works out of the box with minimal setup
- 🚀 **Developer experience** - Excellent IDE support and error messages

## Installation

> Check the peer dependencies before installing this.

```bash
npm install @bdcode/hono-zod-oas31
# or
pnpm add @bdcode/hono-zod-oas31
# or
yarn add @bdcode/hono-zod-oas31
# or
bun install @bdcode/hono-zod-oas31
# or
jsr add @bdcode/hono-zod-oas31
```

### Peer Dependencies

Make sure you have the required peer dependencies installed:

```bash
npm install hono zod
# or
pnpm add hono zod
# or
yarn add hono zod
# or
bun install hono zod
```

## Quick Start

```typescript
import { OpenAPIHono, createRoute, z } from '@bdcode/hono-zod-oas31'

// Create app instance
const app = new OpenAPIHono()

// Define a schema
const UserSchema = z.object({
  id: z.number().openapi({ example: 1 }),
  name: z.string().openapi({ example: 'John Doe' }),
  email: z.string().email().openapi({ example: 'john@example.com' }),
})

// Create a route definition
const getUserRoute = createRoute({
  method: 'get',
  path: '/users/{id}',
  summary: 'Get user by ID',
  request: {
    params: z.object({
      id: z.coerce.number().openapi({ example: 1 }),
    }),
  },
  responses: {
    200: {
      description: 'User found',
      content: {
        'application/json': {
          schema: UserSchema,
        },
      },
    },
    404: {
      description: 'User not found',
    },
  },
})

// Register the route
app.openapi(getUserRoute, async (c) => {
  const { id } = c.req.valid('param')

  // Your logic here
  const user = await getUserById(id)

  if (!user) {
    return c.json({ error: 'User not found' }, 404)
  }

  return c.json(user, 200)
})

// Generate OpenAPI documentation
app.doc('/doc', {
  openapi: '3.1.0',
  info: {
    title: 'My API',
    version: '1.0.0',
  },
})

export default app
```

## API Reference

### OpenAPIHono

Extended Hono class with OpenAPI support.

```typescript
const app = new OpenAPIHono({
  defaultHook: (result, c) => {
    if (!result.success) {
      return c.json({ error: 'Validation failed' }, 400)
    }
  },
})
```

#### Methods

##### `openapi(route, handler, hook?)`

Register an OpenAPI route with validation.

- `route`: Route configuration created with `createRoute()`
- `handler`: Request handler function
- `hook`: Optional validation hook (overrides `defaultHook`)

##### `doc(path, config, generatorConfig?)`

Generate OpenAPI 3.0 documentation endpoint.

##### `doc31(path, config, generatorConfig?)`

Generate OpenAPI 3.1 documentation endpoint (supports webhooks).

##### `webhook(webhookConfig)`

Register webhook documentation (OpenAPI 3.1 only).

### createRoute()

Create a type-safe route configuration.

```typescript
const route = createRoute({
  method: 'post',
  path: '/users',
  summary: 'Create user',
  description: 'Creates a new user account',
  operationId: 'createUser',
  tags: ['users'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateUserSchema,
        },
      },
      required: true,
    },
    headers: z.object({
      'x-api-key': z.string(),
    }),
  },
  responses: {
    201: {
      description: 'User created',
      content: {
        'application/json': {
          schema: UserSchema,
        },
      },
    },
    400: {
      description: 'Invalid request',
    },
  },
  middleware: [authMiddleware],
  hide: false, // Hide from OpenAPI docs
})
```

### createWebhook()

Create webhook documentation for OpenAPI 3.1.

```typescript
const webhook = createWebhook({
  method: 'post',
  path: '/webhooks/payment',
  summary: 'Payment webhook',
  request: {
    body: {
      content: {
        'application/json': {
          schema: PaymentWebhookSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Webhook processed',
    },
  },
})

app.webhook(webhook)
```

## Validation

### Request Validation

The library automatically validates:

- **Path parameters** (`params`)
- **Query parameters** (`query`)
- **Headers** (`headers`)
- **Cookies** (`cookies`)
- **Request body** (`body`) - JSON and form data

```typescript
const route = createRoute({
  method: 'post',
  path: '/users/{id}/posts',
  request: {
    params: z.object({
      id: z.coerce.number(),
    }),
    query: z.object({
      limit: z.coerce.number().optional(),
      offset: z.coerce.number().optional(),
    }),
    headers: z.object({
      authorization: z.string(),
    }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            title: z.string(),
            content: z.string(),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Post created',
      content: {
        'application/json': {
          schema: PostSchema,
        },
      },
    },
  },
})
```

### Custom Validation Hooks

```typescript
// Global hook for all routes
const app = new OpenAPIHono({
  defaultHook: (result, c) => {
    if (!result.success) {
      return c.json(
        {
          error: 'Validation Error',
          details: result.error.issues,
        },
        400
      )
    }
  },
})

// Route-specific hook
app.openapi(route, handler, (result, c) => {
  if (!result.success) {
    return c.json({ error: 'Custom error message' }, 422)
  }
})
```

## Middleware Support

Routes support middleware at the route level:

```typescript
import { bearerAuth } from 'hono/bearer-auth'

const protectedRoute = createRoute({
  method: 'get',
  path: '/protected',
  middleware: [
    bearerAuth({ token: 'secret' }),
    // Multiple middleware supported
    cors(),
  ],
  responses: {
    200: {
      description: 'Protected resource',
    },
  },
})
```

## OpenAPI Documentation

### Basic Setup

```typescript
app.doc('/openapi', {
  openapi: '3.0.0',
  info: {
    title: 'My API',
    version: '1.0.0',
    description: 'API documentation',
  },
  servers: [
    {
      url: 'https://api.example.com',
      description: 'Production',
    },
  ],
})
```

### Advanced Configuration

```typescript
app.doc31('/openapi', {
  openapi: '3.1.0',
  info: {
    title: 'My API',
    version: '2.0.0',
    description: 'API with webhooks',
    contact: {
      name: 'API Support',
      email: 'support@example.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [{ bearerAuth: [] }],
})
```

### Webhooks (OpenAPI 3.1)

```typescript
const paymentWebhook = createWebhook({
  method: 'post',
  path: '/webhooks/payment-completed',
  summary: 'Payment completed webhook',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            event: z.literal('payment.completed'),
            payment_id: z.string(),
            amount: z.number(),
          }),
        },
      },
    },
  },
  responses: {
    200: { description: 'OK' },
  },
})

app.webhook(paymentWebhook)
```

## Zod Extensions

The library includes Zod OpenAPI extensions:

```typescript
import { z } from '@bdcode/hono-zod-oas31'

const UserSchema = z.object({
  id: z.number().openapi({
    description: 'User ID',
    example: 123,
  }),
  email: z.string().email().openapi({
    description: 'User email address',
    format: 'email',
    example: 'user@example.com',
  }),
  role: z.enum(['admin', 'user']).openapi({
    description: 'User role',
    enum: ['admin', 'user'],
  }),
})
```

## Type Safety

Full TypeScript support with automatic type inference:

```typescript
app.openapi(getUserRoute, async (c) => {
  // ✅ Fully typed - no manual type assertions needed
  const { id } = c.req.valid('param') // type: { id: number }
  const { limit } = c.req.valid('query') // type: { limit?: number }
  const body = c.req.valid('json') // type: inferred from schema

  // ✅ Return type is enforced based on route responses
  return c.json({ id, name: 'John' }, 200) // ✅ Valid
  // return c.json({ invalid: true }, 200) // ❌ Type error
})
```

## Examples

### Complete CRUD API

```typescript
import { OpenAPIHono, createRoute, z } from '@bdcode/hono-zod-oas31'

const app = new OpenAPIHono()

// Schemas
const UserSchema = z.object({
  id: z.number().openapi({ example: 1 }),
  name: z.string().openapi({ example: 'John Doe' }),
  email: z.string().email().openapi({ example: 'john@example.com' }),
  createdAt: z.string().datetime().openapi({ example: '2023-01-01T00:00:00Z' }),
})

const CreateUserSchema = UserSchema.omit({ id: true, createdAt: true })
const UpdateUserSchema = CreateUserSchema.partial()

// Routes
const createUserRoute = createRoute({
  method: 'post',
  path: '/users',
  summary: 'Create user',
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateUserSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'User created',
      content: {
        'application/json': {
          schema: UserSchema,
        },
      },
    },
  },
})

const getUserRoute = createRoute({
  method: 'get',
  path: '/users/{id}',
  summary: 'Get user',
  request: {
    params: z.object({
      id: z.coerce.number(),
    }),
  },
  responses: {
    200: {
      description: 'User found',
      content: {
        'application/json': {
          schema: UserSchema,
        },
      },
    },
    404: {
      description: 'User not found',
    },
  },
})

// Handlers
app.openapi(createUserRoute, async (c) => {
  const data = c.req.valid('json')
  const user = await createUser(data)
  return c.json(user, 201)
})

app.openapi(getUserRoute, async (c) => {
  const { id } = c.req.valid('param')
  const user = await findUser(id)

  if (!user) {
    return c.json({ error: 'User not found' }, 404)
  }

  return c.json(user, 200)
})

// Documentation
app.doc('/doc', {
  openapi: '3.0.0',
  info: {
    title: 'Users API',
    version: '1.0.0',
  },
})

export default app
```

## Migration from @hono/zod-openapi

If you're migrating from `@hono/zod-openapi`, this package provides a similar API (as it's like a mannual fork from it) with additional features:

1. **Webhook support** for OpenAPI 3.1+ Specs
2. **Enhanced TypeScript** support
3. **Better middleware integration**
4. **Improved validation hooks**

The core API remains compatible, so migration should be straightforward.

## Contributing

Contributions are welcome! Please check our [contributing guidelines](./CONTRIBUTING.md).

## License

MIT © [Code Continent](https://github.com/codecontinent)
