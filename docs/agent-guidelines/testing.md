# Testing guidelines

Canonical source: [AGENTS.md](../../AGENTS.md).

- Stack: **Vitest + @testing-library/react + @testing-library/jest-dom**.
- Tests live in `src/lib/__tests__/`. Setup: `src/test-setup.js`. Config: `vite.config.js` (`test` key).
- Run: `npm run test` (CI), `npm run test:watch` (local), `npm run test:coverage` (v8 coverage).
- Add a regression test for every bug fix and every new function in `src/lib/`.
- Prefer testing behavior through the public API of a module over internal implementation details.
