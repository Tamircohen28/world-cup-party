# Security guidelines

Canonical source: [AGENTS.md](../../AGENTS.md).

- Never commit `.env.local` or any file with real Base44 credentials.
- Keep `base44/.app.jsonc` a placeholder — never a real app ID. CI's secret-scan job blocks
  24-hex app IDs, `sk-` keys, and `PRIVATE_KEY` strings.
- Client-only secrets do not exist: anything shipped to the browser (`VITE_*`) is public. Never
  put a real secret behind a `VITE_` variable.
- Base44 serverless functions in `base44/functions/` run server-side — keep privileged logic there.
