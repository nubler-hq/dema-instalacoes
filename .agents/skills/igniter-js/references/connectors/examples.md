# @igniter-js/connectors - Examples

## Complete Example: Stripe Integration

This example demonstrates defining a Stripe connector with configuration schemas, field-level encryption, custom methods, and webhooks.

### 1. Define the Connector (`connectors/stripe.ts`)

```typescript
import { IgniterConnectorBuilder } from '@igniter-js/connectors';
import { z } from 'zod';
import Stripe from 'stripe';

const configSchema = z.object({
  secretKey: z.string().min(1),
  webhookSecret: z.string().optional(),
});

const stateSchema = z.object({
  lastSync: z.string().datetime().optional(),
});

export const stripeConnector = IgniterConnectorBuilder.create('stripe')
  .withConfigSchema(configSchema)
  .withStateSchema(stateSchema)
  // Encrypt sensitive fields
  .withEncryption(['secretKey', 'webhookSecret'])
  .withMethod('createCustomer', async (ctx, email: string) => {
    // Access typed config
    const stripe = new Stripe(ctx.config.secretKey, { apiVersion: '2023-10-16' });
    const customer = await stripe.customers.create({ email });
    return customer;
  })
  .withMethod('createCheckoutSession', async (ctx, priceId: string, successUrl: string, cancelUrl: string) => {
      const stripe = new Stripe(ctx.config.secretKey, { apiVersion: '2023-10-16' });
      const session = await stripe.checkout.sessions.create({
          line_items: [{ price: priceId, quantity: 1 }],
          mode: 'subscription',
          success_url: successUrl,
          cancel_url: cancelUrl,
      });
      return session.url;
  })
  .withWebhook('invoice.paid', {
    // Optional payload validation
    schema: z.object({
        id: z.string(),
        customer: z.string(),
        amount_paid: z.number()
    }),
    verify: async (ctx, req) => {
        // Implement Stripe signature verification
        const sig = req.headers.get('stripe-signature');
        if (!sig || !ctx.config.webhookSecret) return false;

        try {
            const stripe = new Stripe(ctx.config.secretKey, { apiVersion: '2023-10-16' });
            // In a real scenario, you'd pass the raw body buffer here
            const event = stripe.webhooks.constructEvent(
                await req.text(),
                sig,
                ctx.config.webhookSecret
            );
            return true;
        } catch (err) {
            return false;
        }
    },
    handler: async (ctx, payload) => {
        // Handle the event securely
        console.log(`Invoice ${payload.id} paid for customer ${payload.customer}`);
        // e.g., Update database, send email
    }
  })
  .build();
```

### 2. Initialize and Install (`server.ts`)

```typescript
import { IgniterConnectors, PrismaConnectorAdapter } from '@igniter-js/connectors';
import { prisma } from './prisma';
import { stripeConnector } from './connectors/stripe';

// Initialize Manager
const manager = IgniterConnectors.create(new PrismaConnectorAdapter(prisma))
  .withEncryption(process.env.ENCRYPTION_KEY as string) // 32-byte key
  .withConnector(stripeConnector)
  .build();

async function installStripeForOrg(orgId: string, secretKey: string) {
  // Scope to the organization
  const orgConnectors = manager.scope('organization', orgId);

  // Install the connector
  await orgConnectors.install('stripe', {
    secretKey,
    // webhookSecret is optional in the schema
  });

  console.log(`Stripe installed for org ${orgId}`);
}

async function handleCheckout(orgId: string, priceId: string) {
    const orgConnectors = manager.scope('organization', orgId);

    // Retrieve the installed instance
    const stripe = await orgConnectors.get('stripe');
    if (!stripe) {
        throw new Error('Stripe is not configured for this organization');
    }

    // Call custom method
    const url = await stripe.methods.createCheckoutSession(
        priceId,
        'https://example.com/success',
        'https://example.com/cancel'
    );

    return url;
}
```

## Example: GitHub OAuth Connector

This example configures an OAuth flow to authenticate users and fetch their repositories.

```typescript
import { IgniterConnectorBuilder } from '@igniter-js/connectors';
import { z } from 'zod';

const githubConfig = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
});

const githubState = z.object({
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  expiresAt: z.number().optional()
});

export const githubConnector = IgniterConnectorBuilder.create('github')
  .withConfigSchema(githubConfig)
  .withStateSchema(githubState)
  .withEncryption(['clientSecret', 'accessToken', 'refreshToken']) // Encrypt secrets
  .withOAuth({
    provider: 'github',
    clientId: process.env.GITHUB_CLIENT_ID as string,
    clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    authorizationUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    scopes: ['repo', 'read:user'],
  })
  .withMethod('getRepositories', async (ctx) => {
      const token = ctx.state.accessToken;
      if (!token) throw new Error('Not authenticated');

      const response = await fetch('https://api.github.com/user/repos', {
          headers: {
              Authorization: `token ${token}`,
              Accept: 'application/vnd.github.v3+json'
          }
      });
      return response.json();
  })
  .build();

// In your route handler (e.g., Express or Next.js API route):
async function initiateAuth(req, res) {
    const orgConnectors = manager.scope('user', req.user.id);
    const github = await orgConnectors.get('github');

    // Redirect user to GitHub
    const url = github.oauth.generateAuthUrl();
    res.redirect(url);
}

// In your callback handler:
async function handleCallback(req, res) {
    const { code, state } = req.query;
    const orgConnectors = manager.scope('user', req.user.id);
    const github = await orgConnectors.get('github');

    // This will securely exchange the code and save tokens in state
    await github.oauth.handleCallback(code, state);

    res.redirect('/dashboard');
}
```