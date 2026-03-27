---
description: Browser-based UI testing patterns using agent-browser CLI for Igniter.js applications
globs: []
alwaysApply: false
---

# Browser Testing Patterns for Igniter.js

This guide provides patterns for browser-based UI validation using `agent-browser` CLI (NOT Playwright) to ensure your Igniter.js frontend works correctly.

## \u{1F6A8} CRITICAL: Browser Testing Protocol

**MANDATORY for ALL front-end implementations:**

1. **Use `agent-browser` CLI** - Never use Playwright or other tools
2. **Non-headless mode** - Always run with `--headed` flag so tests are visible
3. **Test after every UI change** - Cannot advance to next task without browser validation
4. **Autonomous validation** - Browser testing serves as final quality gate

## 1. Core Workflow

### 1.1. Basic Test Pattern

```bash
# 1. Start headed browser
agent-browser --headed open http://localhost:3000

# 2. Get interactive elements
agent-browser snapshot -i

# 3. Interact using refs from snapshot
agent-browser click @e1
agent-browser fill @e2 "test@example.com"

# 4. Verify results
agent-browser get text @e3
```

### 1.2. Complete Igniter.js Feature Test

```bash
#!/bin/bash
# Test user registration flow

# Open application
agent-browser --headed open http://localhost:3000/auth/sign-up

# Get form elements
agent-browser snapshot -i
# Output: textbox "Name" [ref=e1], textbox "Email" [ref=e2], textbox "Password" [ref=e3], button "Sign Up" [ref=e4]

# Fill registration form
agent-browser fill @e1 "John Doe"
agent-browser fill @e2 "john@example.com"
agent-browser fill @e3 "password123"

# Screenshot before submission
agent-browser screenshot ./before-submit.png

# Submit form
agent-browser click @e4

# Wait for response
agent-browser wait --url "**/dashboard"

# Verify success
agent-browser snapshot -i
agent-browser get text @e5 # Should show "Welcome, John Doe"

# Screenshot final state
agent-browser screenshot ./after-submit.png

# Close browser
agent-browser close
```

## 2. Common Test Scenarios

### 2.1. Form Validation Testing

```bash
# Test validation errors
agent-browser open http://localhost:3000/users/create
agent-browser snapshot -i

# Submit empty form to trigger validation
agent-browser click @e10

# Verify error messages appear
agent-browser wait --text "Name is required"
agent-browser snapshot -i
agent-browser get text @e11  # Should show error message

# Fill valid data
agent-browser fill @e1 "Valid Name"
agent-browser fill @e2 "valid@email.com"

# Submit again
agent-browser click @e10

# Verify success (no errors)
agent-browser wait --url "**/users/*"
```

### 2.2. Navigation Testing

```bash
# Test routing between pages
agent-browser open http://localhost:3000
agent-browser snapshot -i

# Click navigation link
agent-browser click @e5  # "Users" link

# Verify URL changed
URL=$(agent-browser get url)
if [[ $URL == *"/users"* ]]; then
  echo "✅ Navigation successful"
else
  echo "❌ Navigation failed"
fi

# Verify page content loaded
agent-browser wait --text "Users List"
agent-browser snapshot -i
```

### 2.3. Authenticated Routes Testing

```bash
# Test protected route access
agent-browser open http://localhost:3000/dashboard

# Should redirect to login
agent-browser wait --url "**/login"

# Login
agent-browser snapshot -i
agent-browser fill @e1 "user@example.com"
agent-browser fill @e2 "password123"
agent-browser click @e3

# Should redirect to dashboard after login
agent-browser wait --url "**/dashboard"

# Save authentication state for reuse
agent-browser state save auth.json

# Later: Load auth state directly
agent-browser state load auth.json
agent-browser open http://localhost:3000/dashboard
# Now authenticated, no redirect
```

### 2.4. API Integration Testing

```bash
# Test that UI properly displays API data
agent-browser open http://localhost:3000/users
agent-browser wait --load networkidle  # Wait for API calls

# Get element count (should match database records)
COUNT=$(agent-browser get count ".user-card")
echo "Found $COUNT user cards"

# Verify specific user data
agent-browser snapshot -i
agent-browser get text @e1  # Should show user name from API
```

### 2.5. Error Handling Testing

```bash
# Test API error display
agent-browser open http://localhost:3000/users/999999  # Non-existent ID

# Should show error UI
agent-browser wait --text "User not found"
agent-browser snapshot -i
agent-browser screenshot ./error-state.png

# Verify error code is displayed (from UserError)
agent-browser get text @e1  # Should show "USER_NOT_FOUND"
```

## 3. Visual Regression Testing

### 3.1. Screenshot Comparison

```bash
# Baseline screenshot
agent-browser open http://localhost:3000
agent-browser wait --load networkidle
agent-browser screenshot --full ./baseline.png

# After changes
agent-browser open http://localhost:3000
agent-browser wait --load networkidle
agent-browser screenshot --full ./current.png

# Manual or automated comparison
# (Use imagemagick, pixelmatch, or visual inspection)
```

### 3.2. Responsive Testing

```bash
# Test desktop
agent-browser set viewport 1920 1080
agent-browser open http://localhost:3000
agent-browser screenshot ./desktop.png

# Test tablet
agent-browser set viewport 768 1024
agent-browser reload
agent-browser screenshot ./tablet.png

# Test mobile
agent-browser set device "iPhone 14"
agent-browser reload
agent-browser screenshot ./mobile.png
```

## 4. State Management Testing

### 4.1. Test Zustand Store Updates

```bash
# Open page with store-driven UI
agent-browser open http://localhost:3000/boards
agent-browser snapshot -i

# Trigger action that updates store
agent-browser click @e1  # "Create Board" button
agent-browser fill @e2 "New Board"
agent-browser click @e3  # Submit

# Verify UI updated (store triggered re-render)
agent-browser wait --text "New Board"
agent-browser snapshot -i

# Verify count increased
COUNT=$(agent-browser get count ".board-card")
echo "Board count: $COUNT"
```

### 4.2. Test Igniter Client Mutations

```bash
# Test useMutation hook behavior
agent-browser open http://localhost:3000/users/create
agent-browser snapshot -i

# Fill form (triggers mutation)
agent-browser fill @e1 "John Doe"
agent-browser fill @e2 "john@example.com"
agent-browser click @e3  # Submit (calls mutation)

# Verify loading state appears
agent-browser wait --text "Creating..."

# Verify success state
agent-browser wait --text "User created successfully"

# Verify invalidation happened (list refetched)
agent-browser click @e4  # "Back to List" link
agent-browser wait --text "John Doe"  # New user in list
```

## 5. Debugging Patterns

### 5.1. Interactive Debugging

```bash
# Start headed browser for manual inspection
agent-browser --headed open http://localhost:3000

# Get snapshot in terminal while inspecting in browser
agent-browser snapshot -i

# Highlight elements to verify correct targeting
agent-browser highlight @e1

# View console messages
agent-browser console

# Check for errors
agent-browser errors
```

### 5.2. Recording Failures

```bash
# Start recording before test
agent-browser record start ./test-failure.webm
agent-browser open http://localhost:3000

# Perform failing test
agent-browser click @e1
# ... test steps ...

# Stop recording (saves video of failure)
agent-browser record stop

# Review video to debug
```

## 6. Best Practices

### 6.1. Ref Lifecycle Management

✅ **DO:**

- Re-snapshot after navigation or major DOM changes
- Use semantic locators when refs are unstable

```bash
# Re-snapshot after navigation
agent-browser click @e1
agent-browser wait --url "**/dashboard"
agent-browser snapshot -i  # Fresh refs
```

✅ **DO:**

- Use semantic locators for stable elements

```bash
# Instead of unstable refs
agent-browser find role button click --name "Submit"
agent-browser find label "Email" fill "user@test.com"
```

❌ **DON'T:**

- Reuse refs after page changes
- Assume refs persist across navigations

### 6.2. Wait Strategies

✅ **DO:**

- Wait for network idle before snapshots
- Wait for specific text/URL when expecting changes

```bash
# Wait for API responses
agent-browser wait --load networkidle

# Wait for specific state
agent-browser wait --text "Loading complete"

# Wait for navigation
agent-browser wait --url "**/success"
```

❌ **DON'T:**

- Use hardcoded sleep timers
- Snapshot before content loads

### 6.3. Test Organization

✅ **DO:**

- Create reusable test functions
- Save authentication state for reuse
- Use exit codes to fail CI/CD

```bash
#!/bin/bash
# test-user-creation.sh

set -e  # Exit on error

test_user_creation() {
  agent-browser --headed open http://localhost:3000/users/create
  agent-browser snapshot -i

  # Test steps...

  if agent-browser get text @e10 | grep -q "Success"; then
    echo "✅ Test passed"
    return 0
  else
    echo "❌ Test failed"
    return 1
  fi
}

# Run test
test_user_creation || exit 1
```

## 7. CI/CD Integration

### 7.1. Headless CI Tests

```bash
# Run tests in CI without --headed flag
agent-browser open http://localhost:3000
agent-browser snapshot -i --json | jq '.elements | length'
```

### 7.2. Artifact Collection

```bash
# Save screenshots and videos for CI artifacts
agent-browser screenshot ./ci-artifacts/test-result.png
agent-browser record start ./ci-artifacts/test-recording.webm
# ... perform test ...
agent-browser record stop
```

## 8. Common Gotchas

❌ **Wrong:** Using Playwright commands

```bash
# This will not work
npx playwright test  # Not available
```

✅ **Correct:** Using agent-browser CLI

```bash
agent-browser --headed open http://localhost:3000
```

---

**Remember:** `agent-browser` is your primary UI testing tool. Always run with `--headed` during development for maximum visibility and debuggability.
