/*
|==================================================
| Created by Mr. Meaow @mrmeaow
|==================================================
*/

import { writeFileSync } from 'node:fs'
import { OpenAPIHono, createRoute, createWebhook, z } from './index'

// Define a normal route for health check
const HealthCheckSchema = z.object({
  status: z.enum(['ok', 'error']).openapi({
    description: 'Health status',
    examples: ['ok', 'error'],
  }),
})

// Define a schema for the webhook payload
const PaymentWebhookSchema = z.object({
  event: z.enum(['payment.completed', 'payment.failed']).openapi({
    description: 'The type of payment event',
    example: 'payment.completed',
  }),
  data: z.object({
    payment_id: z.string().openapi({
      description: 'Unique identifier for the payment',
      example: 'pay_1234567890',
    }),
    amount: z.number().positive().openapi({
      description: 'Payment amount in cents',
      example: 2500,
    }),
    currency: z.string().length(3).openapi({
      description: 'ISO 4217 currency code',
      example: 'USD',
    }),
    customer_id: z.string().openapi({
      description: 'Customer identifier',
      example: 'cust_abc123',
    }),
  }),
  timestamp: z.string().datetime().openapi({
    description: 'ISO 8601 timestamp of when the event occurred',
    example: '2023-01-01T12:00:00Z',
  }),
})

// Create a route definition
const healthCheckRoute = createRoute({
  method: 'get',
  path: '/health',
  summary: 'Health check endpoint',
  description: 'Checks the health status of the API',
  operationId: 'healthCheck',
  tags: ['health'],
  responses: {
    200: {
      description: 'Health check successful',
      content: {
        'application/json': {
          schema: HealthCheckSchema,
        },
      },
    },
  },
})

// Create a webhook definition
const paymentWebhook = createWebhook({
  method: 'post',
  path: '/webhooks/payment',
  summary: 'Payment webhook endpoint',
  description: 'Receives payment status updates from payment processor',
  operationId: 'handlePaymentWebhook',
  tags: ['payments'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: PaymentWebhookSchema,
        },
      },
      required: true,
      description: 'Payment event data',
    },
  },
  responses: {
    200: {
      description: 'Webhook processed successfully',
    },
    400: {
      description: 'Invalid webhook payload',
      content: {
        'application/json': {
          schema: z.object({
            error: z.string(),
            message: z.string(),
          }),
        },
      },
    },
    401: {
      description: 'Invalid webhook signature',
    },
  },
  security: [
    {
      webhookSignature: [],
    },
  ],
})

// Create the app and register the webhook
const app: OpenAPIHono = new OpenAPIHono()

// Register the normal route
app.openapi(healthCheckRoute, async (c) => {
  return c.json({ status: 'ok' })
})

// Register the webhook (this only adds it to OpenAPI documentation)
app.webhook(paymentWebhook)

// You can also register multiple webhooks
const refundWebhook = createWebhook({
  method: 'post',
  path: '/webhooks/refund',
  summary: 'Refund webhook endpoint',
  description: 'Receives refund status updates',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            event: z.literal('refund.processed'),
            refund_id: z.string(),
            amount: z.number(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Refund webhook processed successfully',
    },
  },
})

app.webhook(refundWebhook)

// Generate OpenAPI 3.1 documentation (webhooks are only supported in 3.1+)
app.doc31('/doc', {
  openapi: '3.1.0',
  info: {
    title: 'Payment API',
    version: '1.0.0',
    description: 'API for processing payments with webhook support',
  },
  servers: [
    {
      url: 'https://api.example.com/v1',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      webhookSignature: {
        type: 'apiKey',
        in: 'header',
        name: 'X-Webhook-Signature',
        description: 'HMAC signature for webhook verification',
      },
    },
  },
} as any)

// Example of how you might implement the actual webhook handler
// (Note: this is separate from the webhook registration above)
app.post('/webhooks/payment', async (c) => {
  try {
    // In a real implementation, you would:
    // 1. Verify the webhook signature
    // 2. Parse and validate the payload
    // 3. Process the payment event

    const payload = await c.req.json()
    console.log('Received payment webhook:', payload)

    // Process the webhook...

    return c.json({ success: true }, 200)
  } catch (error) {
    return c.json({ error: 'Invalid payload' }, 400)
  }
})

export { app }

const oasJson = app.getOpenAPI31Document({
  openapi: '3.1.0',
  info: {
    title: 'Payment API',
    version: '1.0.0',
    description: 'API for processing payments with webhook support',
  },
  servers: [
    {
      url: 'https://api.example.com/v1',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      webhookSignature: {
        type: 'apiKey',
        in: 'header',
        name: 'X-Webhook-Signature',
        description: 'HMAC signature for webhook verification',
      },
    },
  },
} as any)

console.log(`🚀 DEBUG app doc => openapi.json`, JSON.stringify(oasJson, null, 2))

// write to debug.json

writeFileSync('debug.json', JSON.stringify(oasJson, null, 2))
