# Contributing to @bdcode/hono-zod-oas31

Thank you for your interest in contributing to @bdcode/hono-zod-oas31! We welcome contributions from the community and are grateful for any help you can provide.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)
- [Issue Guidelines](#issue-guidelines)
- [Release Process](#release-process)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please be respectful and constructive in all interactions.

## Getting Started

### Prerequisites

- Node.js 16 or higher
- pnpm (recommended) or npm
- Git

### Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:

   ```bash
   git clone https://github.com/codecontinent/hono-zod-oas31.git
   cd hono-zod-oas31
   ```

3. **Install dependencies**:

   ```bash
   pnpm install
   ```

4. **Run tests** to ensure everything works:

   ```bash
   pnpm test
   ```

5. **Build the project**:
   ```bash
   pnpm build
   ```

## Making Changes

### Branch Naming

Create a descriptive branch name for your changes:

- `feat/add-new-feature` - for new features
- `fix/resolve-issue-123` - for bug fixes
- `docs/update-readme` - for documentation updates
- `refactor/improve-types` - for refactoring
- `test/add-missing-tests` - for test additions

### Commit Messages

We follow the [Conventional Commits](https://conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

**Examples:**

```
feat: add webhook support for OpenAPI 3.1
fix: resolve type inference issue with nested schemas
docs: update API reference for createRoute
test: add tests for middleware integration
```

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run tests with coverage
pnpm test --coverage

# Type checking
pnpm typecheck
```

### Writing Tests

- Write tests for all new features and bug fixes
- Use descriptive test names that explain what is being tested
- Group related tests using `describe` blocks
- Use `it.each` for testing multiple scenarios
- Test both success and error cases

**Test Structure:**

```typescript
import { describe, it, expect, expectTypeOf } from 'vitest'
import { OpenAPIHono, createRoute, z } from '../src'

describe('Feature Name', () => {
  it('should handle basic functionality', () => {
    // Arrange
    const app = new OpenAPIHono()

    // Act
    const result = // perform action
      // Assert
      expect(result).toBe(expected)
  })

  it('should handle error cases', () => {
    // Test error scenarios
  })
})
```

### Type Testing

Use `expectTypeOf` for type-level tests:

```typescript
import { expectTypeOf } from 'vitest'

it('should infer correct types', () => {
  const route = createRoute({
    method: 'get',
    path: '/users/{id}',
    request: {
      params: z.object({ id: z.coerce.number() }),
    },
    responses: {
      200: {
        content: {
          'application/json': {
            schema: UserSchema,
          },
        },
      },
    },
  })

  expectTypeOf(route.path).toEqualTypeOf<'/users/{id}'>()
})
```

## Pull Request Process

1. **Ensure your branch is up to date** with the main branch:

   ```bash
   git checkout main
   git pull upstream main
   git checkout your-feature-branch
   git rebase main
   ```

2. **Run the full test suite** and ensure all tests pass:

   ```bash
   pnpm test
   pnpm typecheck
   pnpm lint
   pnpm build
   ```

3. **Create a pull request** with:
   - Clear title describing the change
   - Detailed description of what was changed and why
   - Link to any related issues
   - Screenshots if applicable (for documentation changes)

4. **Ensure your PR**:
   - Has passing CI checks
   - Includes appropriate tests
   - Updates documentation if needed
   - Follows the code style guidelines

5. **Address review feedback** promptly and politely

## Code Style

### Formatting

We use Prettier and ESLint for code formatting and linting:

```bash
# Check formatting
pnpm lint

# Fix formatting issues
pnpm lint:fix

# Format all files
pnpm format
```

### TypeScript Guidelines

- Use explicit return types for public functions
- Prefer `interface` over `type` for object shapes
- Use `const assertions` where appropriate
- Avoid `any` - use proper types or `unknown`
- Use generic constraints to improve type safety

**Example:**

```typescript
// ✅ Good
interface RouteConfig {
  method: 'get' | 'post' | 'put' | 'delete'
  path: string
  // ...
}

export function createRoute<T extends RouteConfig>(
  config: T
): T & {
  getRoutingPath(): string
}

// ❌ Avoid
export function createRoute(config: any): any
```

### Documentation

- Use JSDoc comments for public APIs
- Include examples in documentation
- Keep comments concise and helpful
- Update README.md for user-facing changes

## Issue Guidelines

### Reporting Bugs

When reporting bugs, please include:

1. **Clear title** describing the issue
2. **Environment details**:
   - Node.js version
   - Package version
   - Operating system
3. **Minimal reproduction** example
4. **Expected vs actual behavior**
5. **Error messages** or stack traces

### Feature Requests

For feature requests, please include:

1. **Clear description** of the feature
2. **Use case** - why is this needed?
3. **Proposed API** (if applicable)
4. **Alternative solutions** considered

### Issue Templates

Use the appropriate issue template when creating new issues.

## Release Process

This project uses automated releases via GitHub Actions and changesets:

1. **Create a changeset** for your changes:

   ```bash
   npx changeset
   ```

2. **Select the type of change**:
   - `patch` - bug fixes, small improvements
   - `minor` - new features, non-breaking changes
   - `major` - breaking changes

3. **Write a clear description** of the change

4. **Commit the changeset** with your PR

The release will be automatically handled when the PR is merged.

## Development Tips

### Debugging

Use the debug script to test your changes:

```bash
pnpm debug
```

This runs the examples and outputs the generated OpenAPI JSON to `debug.json`.

### Testing with Real Projects

To test your changes in a real project:

1. Build the package: `pnpm build`
2. Create a link: `pnpm link`
3. In your test project: `pnpm link @bdcode/hono-zod-oas31`

### IDE Setup

For the best development experience:

- Use VS Code with the TypeScript extension
- Install the Prettier extension
- Install the ESLint extension
- Enable format on save

## Getting Help

- **GitHub Discussions** - for questions and general discussion
- **GitHub Issues** - for bug reports and feature requests
- **Discord/Community** - for real-time help (if available)

## Recognition

Contributors will be recognized in:

- The project's README
- Release notes
- GitHub's contributor graph

Thank you for contributing to `@bdcode/hono-zod-oas31`! 🎉
