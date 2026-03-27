# Setup

Installation and configuration for `@igniter-js/mail`.

## Installation

Install the core package and React Email dependencies:

```bash
# npm
npm install @igniter-js/mail @react-email/components react

# pnpm
pnpm add @igniter-js/mail @react-email/components react

# bun
bun add @igniter-js/mail @react-email/components react
```

### Provider Dependencies

Install the adapter you need:

**Resend:**
```bash
npm install resend
```

**SMTP:**
```bash
npm install nodemailer @types/nodemailer
```

### Optional Dependencies

**Telemetry:**
```bash
npm install @igniter-js/telemetry
```

**Validation (StandardSchemaV1-compatible):**
```bash
npm install zod
```

## Basic Configuration

The easiest way to configure the mail service is using the fluent builder API.

```typescript
import { IgniterMail } from '@igniter-js/mail';
import { z } from 'zod';
// Assuming you have a React component for the email
import { WelcomeEmail } from './emails/welcome';

export const mail = IgniterMail.create()
  .withFrom('no-reply@example.com')
  .withAdapter('resend', process.env.RESEND_API_KEY!)
  .addTemplate('welcome', {
    subject: 'Welcome to Our Platform',
    schema: z.object({
      name: z.string(),
      verifyUrl: z.string().url(),
    }),
    render: WelcomeEmail,
  })
  .build();
```

## Advanced Configuration

### Using Adapter Instances

Instead of passing the adapter name and secret string, you can instantiate the adapter directly for more control.

```typescript
import { IgniterMail } from '@igniter-js/mail';
import { ResendMailAdapterBuilder } from '@igniter-js/mail/adapters';

const adapter = ResendMailAdapterBuilder.create()
  .withSecret(process.env.RESEND_API_KEY!)
  .withFrom('no-reply@example.com')
  .build();

export const mail = IgniterMail.create()
  .withFrom('default-from@example.com') // Can be overridden by the adapter
  .withAdapter(adapter)
  .build();
```

### Adding a Queue

To schedule emails for later or offload sending to a background process, integrate with `@igniter-js/jobs` (e.g., via BullMQ).

```typescript
import { IgniterMail } from '@igniter-js/mail';
import { createBullMQAdapter } from '@igniter-js/adapter-bullmq';

const queueAdapter = createBullMQAdapter({
  connection: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },
});

export const mail = IgniterMail.create()
  .withFrom('no-reply@example.com')
  .withAdapter('resend', process.env.RESEND_API_KEY!)
  .withQueue(queueAdapter, {
    queue: 'mail',
    job: 'send',
    attempts: 3,
  })
  // ... add templates
  .build();
```

### Adding Telemetry

Wire up `@igniter-js/telemetry` for built-in observability.

```typescript
import { IgniterMail } from '@igniter-js/mail';
import { IgniterTelemetry } from '@igniter-js/telemetry';
import { IgniterMailTelemetryEvents } from '@igniter-js/mail/telemetry';

const telemetry = IgniterTelemetry.create()
  .withService('my-api')
  .addEvents(IgniterMailTelemetryEvents)
  .build();

export const mail = IgniterMail.create()
  .withFrom('no-reply@example.com')
  .withAdapter('resend', process.env.RESEND_API_KEY!)
  .withTelemetry(telemetry)
  // ... add templates
  .build();
```

## Browser Shim

The package includes a `shim.ts` to prevent server-only dependencies (like `nodemailer`) from crashing client-side bundles. Ensure you are importing `@igniter-js/mail` only in server-side code (e.g., API routes, server components).
