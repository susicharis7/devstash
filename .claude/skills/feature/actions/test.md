# Test Action

1. Read current-feature.md to understand what was implemented
2. Identify server actions and utility functions added/modified for this feature
3. Check if tests already exist for these functions
4. For functions without tests that have testable logic, write unit tests
   (conventions in `context/coding-standards.md` → Testing):
   - Create colocated `*.test.ts` files using Vitest
   - Focus on server actions and utilities (not components)
   - Test happy path and error cases
   - Test pure utilities directly; for server actions, `vi.mock` `@/auth`,
     `@/lib/prisma`, and `@/lib/db/current-user` so no real DB/adapter is
     constructed at import
   - Do not write tests just to write them. Use your best judgement
5. Run `npm test` to verify all tests pass
6. Report test coverage for the new feature code