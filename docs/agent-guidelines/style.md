# Code style guidelines

Canonical source: [AGENTS.md](../../AGENTS.md).

- React function components; no class components.
- Tailwind utility classes; compose shadcn/ui primitives from `src/components/ui/`.
- Mobile-first: page roots use `max-w-lg mx-auto`.
- Central domain constants live in `src/lib/constants.js` — reuse them, do not inline magic values.
- Commit convention: `type(scope): short description` (`feat`, `fix`, `refactor`, `docs`, `chore`, `test`).
- Lint before committing: `npm run lint` (or `npm run lint:fix`).
