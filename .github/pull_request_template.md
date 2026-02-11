## 📋 Overview

### Problem / Motivation
<!-- Why is this change necessary? What problem does it solve? Link related issues. -->

**Context:**

**Fixes:** #
**Related to:** #

### Solution Summary
<!-- Brief description of what this PR delivers and how it solves the problem -->

## 🏷️ Change Type

- [ ] ✨ Feature / Enhancement
- [ ] 🐛 Bug fix
- [ ] 📝 Documentation update
- [ ] 🎨 UI/UX improvement
- [ ] ♻️ Code refactoring
- [ ] 🔒 Security fix
- [ ] ⚡️ Performance improvement
- [ ] 🧪 Test coverage
- [ ] 🔧 Configuration / Build
- [ ] 📦 Dependency update

## 💡 Implementation Details

### Key Changes
<!-- List the main changes made in this PR -->

- 
- 
- 

### Technical Decisions
<!-- Explain any important technical decisions, trade-offs, or patterns introduced -->

**Design patterns used:**

**Trade-offs considered:**

**Deferred work / Follow-ups:**
<!-- Link to issues for any work intentionally deferred to future PRs -->

## 🖼️ Screenshots / Media

<!-- Add UI screenshots, screen recordings, architecture diagrams, or API request/response examples -->

### Before


### After


## ✅ Testing

### Automated Tests

- [ ] `npm run lint` (ESLint passed)
- [ ] `npm run typecheck` (TypeScript compiled without errors)
- [ ] `npm test` (Unit tests passed)
- [ ] Integration tests passed
- [ ] E2E tests passed (if applicable)

### Manual Testing

**Testing checklist:**
- [ ] Tested in development environment (`npm run dev`)
- [ ] Tested with fresh database migration
- [ ] Tested with existing data
- [ ] Tested across different browsers (Chrome, Firefox, Safari)
- [ ] Tested responsive design (mobile, tablet, desktop)
- [ ] Tested with Tiny ERP integration (if applicable)

**Manual validation steps:**
```
1. Navigate to [page/route]
2. Perform [action]
3. Verify [expected result]
```

**Test data / scenarios used:**

## 🔄 Impact Assessment

### Backward Compatibility

- [ ] ✅ No breaking changes
- [ ] ⚠️ Breaking changes (detailed below)

**Breaking changes details:**
<!-- If there are breaking changes, explain what breaks and how to migrate -->

### Database Changes

- [ ] No database changes
- [ ] Schema changes (migrations included)
- [ ] Data migration required

**Migration strategy:**
<!-- Explain how to migrate data or what scripts to run -->

### Configuration Changes

- [ ] No environment variable changes
- [ ] New environment variables added (documented below)
- [ ] Existing environment variables modified

**Environment variables:**
```env
NEW_VAR=value  # Description of what this controls
```

## 🚀 Deployment Considerations

### Rollout Strategy

- [ ] Standard deployment (no special steps)
- [ ] Feature flag controlled
- [ ] Phased rollout recommended
- [ ] Requires coordination with external services

**Deployment steps:**
1. 
2. 
3. 

### Rollback Plan

**How to rollback if issues arise:**
1. 
2. 

**Rollback considerations:**

## 📚 Documentation

- [ ] README updated (if user-facing changes)
- [ ] API documentation updated
- [ ] Code documentation (JSDoc/comments) added
- [ ] Help center articles updated
- [ ] CHANGELOG.md updated
- [ ] Migration guide created (if breaking changes)

**Documentation URLs:**
- 
- 

## 🔒 Security & Performance

### Security Considerations

- [ ] No security implications
- [ ] Security review completed
- [ ] Input validation added/updated
- [ ] Authentication/authorization checks verified
- [ ] Sensitive data handling reviewed

**Security notes:**

### Performance Impact

- [ ] No performance impact
- [ ] Performance improvement
- [ ] Performance regression (justified below)

**Performance metrics:**
<!-- Add before/after benchmarks, bundle size changes, etc. -->

## ✨ Code Quality

### Code Review Checklist

- [ ] Code follows project style guidelines
- [ ] Functions are small and focused (single responsibility)
- [ ] Meaningful variable and function names
- [ ] No commented-out code
- [ ] No console.log or debugging statements
- [ ] Error handling implemented
- [ ] Edge cases considered

### Conventional Commits

- [ ] Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/) format
- [ ] Commits are atomic and well-organized
- [ ] Commit history is clean (squashed if needed)

**Example commits in this PR:**
```
feat(stock): add low inventory alert system
fix(sync): resolve Tiny ERP timeout on large datasets
docs: update API documentation for stock endpoints
```

## 👥 Reviewer Guidelines

### Focus Areas
<!-- Guide reviewers on what to focus on -->

**Please pay special attention to:**
- 
- 

### Testing Instructions for Reviewers
<!-- Specific steps for reviewers to test the changes -->

1. 
2. 
3. 

## 📎 Additional Context

<!-- Any other information that reviewers should know -->

### Related Resources
- 
- 

### Discussion Points
<!-- Anything you want to discuss with reviewers -->

---

## 🎯 Contributor Checklist

- [ ] I have read the [Contributing Guidelines](./CONTRIBUTING.md)
- [ ] I have read the [Contribution Checklist](./.github/docs/contribution-checklist.md)
- [ ] I have followed the [Code of Conduct](./CODE_OF_CONDUCT.md)
- [ ] I have followed the [Security Policy](./SECURITY.md)
- [ ] I have requested review from relevant subject-matter experts
- [ ] I have considered accessibility for UI changes
- [ ] I have considered localization/i18n implications
- [ ] I have verified third-party licenses and attribution
- [ ] I have tested with the Tiny ERP integration (if applicable)
- [ ] I am ready for this to be merged
