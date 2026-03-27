# Rendering Strategy Decision Tree

Source: Next.js 16 docs, bitskingdom SSR/SSG/ISR guide, MakerKit SSR decision framework.

## Quick Decision

```
Does the page need user-specific data?
  YES → Does it need SEO?
    YES → SSR (server-render with user context)
    NO  → SPA (client-side, behind auth)
  NO  → Does content change frequently?
    YES → How often?
      < 1 hour  → SSR
      1h - 1 day → ISR (revalidate interval)
      > 1 day   → SSG (rebuild on change)
    NO  → SSG (static, fastest)
```

## Next.js App Router (2026)

You don't choose rendering mode explicitly. The framework infers:
- `cookies()`, `headers()`, `searchParams` → dynamic (SSR)
- No dynamic data access → static (SSG)
- `revalidate: N` → ISR

**Default**: Server Components. Add `'use client'` only for interactive elements.

## Performance Evidence

| Pattern | TTFB | LCP | Bundle size | SEO |
|---------|------|-----|-------------|-----|
| SSG | < 50ms (CDN) | Excellent | Minimal JS | Best |
| ISR | < 100ms | Excellent | Minimal JS | Best |
| SSR | 200-500ms | Good | Minimal JS | Good |
| SPA | 1-3s (full bundle) | Poor | Large JS | Poor (without SSR) |

Next.js SSR consistently scores higher on LCP and CLS vs React SPAs.
The 1-3s SPA gap is measurable in conversion rates.
