---
name: playwright-testing
description: Playwright end-to-end testing for the AudioBrief application. Provides guidance on writing and running tests, test patterns, and CI configuration.
---

# Playwright Testing

## Overview

AudioBrief uses Playwright for end-to-end testing. Tests are located in the `e2e/` directory and cover the full user workflow from audio upload to YouTube content generation.

## Test Infrastructure

- **Test runner**: `pnpm exec playwright test` (CI mode)
- **Test UI**: `pnpm exec playwright test --ui` — **DO NOT invoke `test:ui` when making changes to the core source code**. The test UI is only for debugging specific test failures; it should not be used during normal development workflows that involve source code changes.
- **Base URL**: `http://localhost:5173` (configured in `playwright.config.ts`)
- **Test environment**: The dev server is automatically started via `webServer` config in `playwright.config.ts`

## Test Directories

- `e2e/` — Contains all Playwright test files (`.spec.ts`)
- `playwright-report/` — Generated test reports after CI runs

## Common Patterns

### Running Tests

```bash
# Run all tests in CI mode (headless)
pnpm test:ci

# Run tests with a specific tag
pnpm exec playwright test --grep "@tag-name"

# Run tests related to a specific file
pnpm exec playwright test e2e/filename.spec.ts
```

### Debug Mode

If you need to debug a failing test, use `show:output` or inspect the HTML report generated after test runs. Avoid using `test:ui` unless absolutely necessary for visual debugging.

## Guidelines

- Tests should be deterministic and independent
- Use `test.describe`, `test.it`, and `test.expect` following Playwright conventions
- Tests should work against the running dev server started by `pnpm dev`
- All test files must be placed in the `e2e/` directory
- Follow the existing test patterns in the codebase

## Prohibited Actions

**DO NOT run `pnpm test:ui` when making changes to source code** (`src/` directory). The `test:ui` command opens the Playwright Test UI interactive runner, which:

1. Interrupts the development workflow
2. Is not necessary for verifying test correctness during source code changes
3. Can cause port conflicts with the dev server
4. Is intended only for visual debugging of specific failing tests

Instead, use `pnpm test:ci` for regular test validation, or run individual tests headlessly with `pnpm exec playwright test <test-file>`.