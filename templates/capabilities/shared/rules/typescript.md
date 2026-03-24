# TypeScript Code Rules — Curated DO/DO NOT Reference

**Load when**: stack contains TypeScript, generating code-rules.md for TypeScript projects, or verifying TypeScript files.

---

## Type Safety

- DO: annotate all public function return types explicitly — `function getUser(): User | null`
- DO: use `unknown` for values you don't control (API responses, JSON.parse results)
- DO: use `interface` for object shapes; `type` for unions, intersections, mapped types
- DO: use `satisfies` operator to validate literal types without widening — `const config = {...} satisfies Config`
- DO NOT: use `any` — replace with `unknown`, a proper type, or a generic
- DO NOT: use non-null assertion `!` without a comment explaining why null is impossible
- DO NOT: use `as` type casting except at data ingestion boundaries (and document why)
- DO NOT: use `object` or `{}` as a type — name the shape explicitly

## Null Handling

- DO: use optional chaining `?.` and nullish coalescing `??` for safe access
- DO: return `null` (not `undefined`) from functions that can produce no value — it's explicit
- DO NOT: check `=== null && === undefined` separately — use `== null` or `??`

## Imports and Modules

- DO: use named exports — avoid default exports (makes refactoring and grep harder)
- DO: use barrel files (`index.ts`) only for public API surface, not internal re-exports
- DO NOT: use namespace imports `import * as X` — prevents tree-shaking
- DO NOT: import types with `import` — use `import type` for type-only imports

## Classes and Functions

- DO: prefer pure functions over classes for business logic
- DO: use `readonly` on class properties and array types that must not be mutated
- DO: implement interfaces explicitly — `class AuthService implements IAuthService`
- DO NOT: use `namespace` — use ES modules
- DO NOT: use `enum` — use `const` objects with `as const` (`{ A: 'a', B: 'b' } as const`)

## Async

- DO: always handle Promise rejections — wrap in try/catch or chain `.catch()`
- DO: type async function returns as `Promise<T>` not `Promise<any>`
- DO NOT: mix async/await and `.then()/.catch()` in the same function
- DO NOT: use `async` on functions that don't await anything

## Strictness (strict mode)

Enable in `tsconfig.json`:
```json
{
  "strict": true,
  "noImplicitReturns": true,
  "noUncheckedIndexedAccess": true,
  "exactOptionalPropertyTypes": true
}
```

- DO NOT: add `// @ts-ignore` or `// @ts-expect-error` without a bug tracker link
- DO NOT: disable `strictNullChecks` — it exists to catch the most common runtime errors
