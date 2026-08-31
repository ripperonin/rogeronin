# Rogeronin Discord Bot

## Purpose

This repository contains a Discord slash-command app running on Cloudflare Workers. The only command is `/poll-bg3`, which posts a native Discord poll for Baldur's Gate 3 availability.

## Stack

- Bun package manager and script runner
- Cloudflare Workers
- Hono HTTP router
- `tweetnacl` for Discord Ed25519 request verification

## Commands

```bash
bun install
bun run dev
bunx tsc --noEmit
bun --env-file=.dev.vars run register
```

`register` globally upserts `/poll-bg3`. It requires `DISCORD_TOKEN` and `DISCORD_APPLICATION_ID` only for that local command.

## Deployment

Cloudflare dashboard deploys this Worker from repository pushes. Do not run `bun run deploy` unless explicitly requested. Do not commit or push without explicit user approval.

The Discord Interactions Endpoint URL is configured in the Discord Developer Portal and must point at the deployed `/interactions` route.

## Configuration

- `DISCORD_PUBLIC_KEY` is the only Worker runtime binding. It verifies all Discord interaction requests.
- `.dev.vars` is local-only and gitignored. It may contain `DISCORD_PUBLIC_KEY`, `DISCORD_TOKEN`, and `DISCORD_APPLICATION_ID`.
- Never add a Discord bot token to Worker bindings, source files, logs, commits, or client responses.

## Interaction Contract

- Every Discord `POST` must be verified against `x-signature-ed25519`, `x-signature-timestamp`, and the unmodified raw body before JSON parsing.
- Interaction type `1` returns `{ "type": 1 }` for Discord endpoint validation.
- `/poll-bg3` is interaction type `2` and responds inline with type `4` plus a native Discord `poll` object.
- The command is global but server-only: registration uses `integration_types: [0]` and `contexts: [0]`.
- Do not add Gateway connections, privileged intents, or storage unless the feature requires them.

## Poll Behavior

- Question: `Baldurs Gate 3 next sesh`
- Seven answer choices in `America/Chicago`
- Starts the day after tomorrow, leaving a one-day gap after command invocation
- Format: `Monday (MM/DD @ 8pm Central)`
- Multiple selections enabled; poll remains open for 72 hours
- Use calendar-day calculations, not fixed 24-hour intervals, to preserve correct dates through daylight-saving changes.

## Mentions

Edit `src/mentions.ts` to change the people notified when a poll is created. Keep mention IDs in `allowed_mentions.users`; never enable broad mention parsing or `@everyone`.

## Code Conventions

- Keep the Worker stateless and minimal.
- Prefer typed Hono contexts and narrow interaction payload types over `any`.
- Keep Discord API payloads close to the handler that returns them.
- Verify behavior with a signed local interaction request after modifying the handler or poll payload.
