# Overview

Core concepts, when to use, and why `@igniter-js/mail` exists.

## The Problem Space

In traditional backend development, email management is often an afterthought, leading to:

- **String Concatenation Mess:** Building HTML emails with string templates is error-prone and hard to debug.
- **Payload Uncertainty:** Backend services often pass data to templates that doesn't match the expected structure, resulting in broken emails.
- **Provider Rigidity:** Changing from one ESP (Email Service Provider) to another usually involves breaking changes across the codebase.
- **Observability Gaps:** Developers often don't know when an email fails, why it failed, or how long it took to render.

## The Igniter.js Vision

`@igniter-js/mail` provides a unified interface that abstracts away the complexities of email delivery:

1. **Expressive Templates:** Leverage the full power of React and Tailwind CSS (via React Email) to build beautiful, responsive emails.
2. **Contract-Based Sending:** Every template defines a schema. The package enforces this contract at the boundaries, ensuring that only valid data reaches your templates.
3. **Provider Agnostic:** Swap adapters (Resend, Postmark, SendGrid, SMTP) with a single line of configuration.
4. **Mission-Critical Reliability:** Built-in hooks for success/error tracking and deep integration with `@igniter-js/jobs` for guaranteed delivery via background queues.
5. **Type-Safe Templates:** Full TypeScript inference with template payload validation.
6. **Telemetry Ready:** Optional integration with `@igniter-js/telemetry`.
7. **Builder Pattern:** Fluent API for configuration.
8. **Server-First:** Built for Node.js, Bun, Deno (no browser dependencies).

## When to Use

Use `@igniter-js/mail` whenever you need to send transactional emails from an Igniter.js backend. It is especially useful when:

- You want to write email templates using React and Tailwind CSS.
- You need strict validation on the data passed to your email templates.
- You want the flexibility to switch email providers without rewriting your application logic.
- You need observability (telemetry, hooks) into your email sending process.
- You want to send emails asynchronously using a job queue (like BullMQ).
