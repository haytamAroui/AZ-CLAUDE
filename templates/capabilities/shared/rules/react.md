# React Code Rules — Curated DO/DO NOT Reference

**Load when**: stack contains React or Next.js, generating code-rules.md for React projects, or verifying React/JSX files.

---

## Component Structure

- DO: write function components exclusively — no class components
- DO: one component per file; filename matches exported component name (PascalCase)
- DO: keep components under 150 lines — extract sub-components or hooks when larger
- DO: co-locate test file with component — `Button.tsx` + `Button.test.tsx` same directory
- DO NOT: export multiple components from a single file (exception: compound components)
- DO NOT: use `React.FC` type — write `function Foo(props: FooProps)` instead

## Props

- DO: define prop types with `interface` above the component — `interface ButtonProps { ... }`
- DO: use destructuring in the function signature — `function Button({ label, onClick }: ButtonProps)`
- DO: provide default values at destructuring — `function Card({ size = 'md' }: CardProps)`
- DO NOT: pass more than 5-7 props — extract sub-components or use a config object
- DO NOT: prop-drill beyond 2 levels — use Context, composition, or state management

## Hooks

- DO: name custom hooks with `use` prefix and extract to `hooks/` directory
- DO: list ALL dependencies in useEffect/useMemo/useCallback dependency arrays — no omissions
- DO: use `useCallback` for functions passed as props to memoized children
- DO NOT: call hooks inside conditions, loops, or nested functions
- DO NOT: suppress exhaustive-deps lint rule — fix the dependency, not the lint
- DO NOT: use useEffect to sync state with props — use derived state or useMemo

## Event Handlers

- DO: define event handlers as named `const handleX = () => {}` above the JSX return
- DO: type events explicitly — `(e: React.ChangeEvent<HTMLInputElement>) => void`
- DO NOT: use inline arrow functions in JSX props for performance-sensitive components
  - Bad: `<Button onClick={() => handleClick(id)} />`
  - Good: `const handleClick = useCallback(() => onClickId(id), [id, onClickId])`

## State and Data

- DO: derive values from state with `useMemo` — avoid redundant state variables
- DO: handle loading, error, and empty states before rendering data
- DO: use `null` for "not yet loaded", `undefined` for "optional field absent"
- DO NOT: use array index as `key` — use stable unique IDs
- DO NOT: mutate state directly — always return a new value
- DO NOT: store derived values in state — compute them in the render or with useMemo

## Performance

- DO: wrap expensive child renders in `React.memo` when parent re-renders frequently
- DO: use lazy loading for routes and heavy components — `React.lazy(() => import(...))`
- DO NOT: premature memoization — profile first, optimize second
- DO NOT: put complex objects/arrays inline in JSX (recreated on every render)

## Next.js (if applicable)

- DO: use Server Components by default — add `"use client"` only when needed
- DO: co-locate data fetching with the component that needs it (Server Component pattern)
- DO NOT: fetch data in client components when a Server Component can do it
- DO NOT: use `getServerSideProps` or `getStaticProps` in new code — use App Router conventions
