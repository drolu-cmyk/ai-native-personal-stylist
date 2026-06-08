## What changed?

## Why does it matter?

## Security checklist

- [ ] No credentials or private operational files were committed.
- [ ] New environment variables are documented.
- [ ] User uploads and provider calls remain behind server-side controls.
- [ ] Provider-specific logic is behind an adapter.

## Testing

- [ ] `pnpm validate:env --mode=ci`
- [ ] `pnpm typecheck`
- [ ] `pnpm build`
