import { describe, it, expect, expectTypeOf } from 'vitest'
import { createWebhook, z } from './index'

describe('createWebhook', () => {
  it.each([
    { path: '/webhooks/payment', expected: '/webhooks/payment' },
    { path: '/webhooks/github', expected: '/webhooks/github' },
    { path: '/api/webhooks/stripe', expected: '/api/webhooks/stripe' },
  ])('createWebhook(%j)', ({ path, expected }) => {
    const WebhookSchema = z.object({
      event: z.string().openapi({
        example: 'payment.completed',
      }),
      data: z.object({
        id: z.string().openapi({
          example: 'payment_123',
        }),
      }),
    })

    const config = {
      method: 'post',
      path,
      request: {
        body: {
          content: {
            'application/json': {
              schema: WebhookSchema,
            },
          },
          required: true,
        },
      },
      responses: {
        200: {
          description: 'Webhook received successfully',
        },
        400: {
          description: 'Invalid webhook payload',
        },
      },
    } as const

    const webhook = createWebhook(config)

    expect(webhook).toEqual(config)
    expect(webhook.path).toBe(expected)
    expectTypeOf(webhook.path).toEqualTypeOf<typeof expected>()
  })

  it('Should create webhook with minimal configuration', () => {
    const webhook = createWebhook({
      method: 'post',
      path: '/webhooks/minimal',
      responses: {
        200: {
          description: 'OK',
        },
      },
    })

    expect(webhook).toEqual({
      method: 'post',
      path: '/webhooks/minimal',
      responses: {
        200: {
          description: 'OK',
        },
      },
    })
  })

  it('Should support hide property', () => {
    const webhook = createWebhook({
      method: 'post',
      path: '/webhooks/hidden',
      hide: true,
      responses: {
        200: {
          description: 'Hidden webhook',
        },
      },
    })

    expect(webhook.hide).toBe(true)
  })

  it('Should support all HTTP methods', () => {
    const methods = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'] as const

    methods.forEach((method) => {
      const webhook = createWebhook({
        method,
        path: `/webhooks/${method}`,
        responses: {
          200: {
            description: `${method.toUpperCase()} webhook`,
          },
        },
      })

      expect(webhook.method).toBe(method)
    })
  })

  it('Should support complex webhook configuration', () => {
    const RequestSchema = z.object({
      type: z.enum(['payment', 'refund']),
      data: z.object({
        transaction_id: z.string(),
        amount: z.number(),
        currency: z.string(),
      }),
      timestamp: z.string().datetime(),
    })

    const webhook = createWebhook({
      method: 'post',
      path: '/webhooks/payment-processor',
      summary: 'Payment processor webhook',
      description: 'Receives payment and refund notifications',
      operationId: 'handlePaymentWebhook',
      tags: ['webhooks', 'payments'],
      request: {
        body: {
          content: {
            'application/json': {
              schema: RequestSchema,
            },
          },
          required: true,
          description: 'Payment event data',
        },
      },
      responses: {
        200: {
          description: 'Successfully processed webhook',
        },
        400: {
          description: 'Invalid request format',
        },
        401: {
          description: 'Unauthorized',
        },
        500: {
          description: 'Internal server error',
        },
      },
      security: [
        {
          webhookSignature: [],
        },
      ],
    })

    expect(webhook.summary).toBe('Payment processor webhook')
    expect(webhook.description).toBe('Receives payment and refund notifications')
    expect(webhook.operationId).toBe('handlePaymentWebhook')
    expect(webhook.tags).toEqual(['webhooks', 'payments'])
    expect(webhook.security).toEqual([{ webhookSignature: [] }])
  })
})
