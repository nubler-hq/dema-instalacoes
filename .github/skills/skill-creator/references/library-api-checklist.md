# Library API Documentation Checklist

Use this checklist to ensure a library skill has full, accurate API coverage.

## Core Coverage
- [ ] Identify the public entrypoints (`package.json` main/module/types/exports)
- [ ] Enumerate public exports (types + runtime)
- [ ] Include TSDoc for all public symbols
- [ ] Document primary constructors/builders (create/init)
- [ ] Document top-level errors and error codes

## Parameters & Returns
- [ ] List required vs optional parameters
- [ ] Document parameter constraints (format, ranges)
- [ ] Document return shapes and types
- [ ] Include async behavior and promise rejections

## Behavior & Guarantees
- [ ] Document side effects
- [ ] Document idempotency (if relevant)
- [ ] Note performance characteristics or limits
- [ ] Include concurrency or ordering guarantees

## Examples
- [ ] Minimal quickstart
- [ ] Common flow
- [ ] Edge/error flow
- [ ] Streaming/auth/retry examples (if applicable)

## Source of Truth
- [ ] Link to `node_modules/<pkg>` definitions
- [ ] Provide search strings for critical symbols
- [ ] Prefer .d.ts or source for authoritative signatures
