# AGENTS.md

## Project overview

`blive-message-listener` is a type-friendly TypeScript library that turns raw
Bilibili Live messages into a stable, consumer-facing message shape. It ships
separate Node.js and browser entry points and supports both ESM and CommonJS.

The main data flow is:

1. `tiny-bilibili-ws` receives a room event.
2. `src/listener/index.ts` subscribes only to requested parsed or raw events.
3. A module in `src/parser/` converts the upstream payload into the public body.
4. `normalizeDanmu` wraps that body in `Message<T>` and invokes the handler.

Treat parser output, handler names, exported types, and raw-message behavior as
public API. Preserve backward compatibility unless the task explicitly permits
a breaking change.

## Repository map

- `src/index.ts`: Node/TCP entry point and shared public exports.
- `src/browser.ts`: browser/WebSocket entry point. Keep its returned listener
  behavior aligned with `src/index.ts`.
- `src/listener/index.ts`: central event subscription and dispatch wiring.
- `src/parser/*.ts`: event-specific public types and raw-payload parsers.
- `src/parser/index.ts`: parser and handler-type export barrel.
- `src/types/`: shared public message, user, and enum types.
- `src/utils/`: normalization and small conversion helpers.
- `src/protobuf/`: protocol decoding needed by selected event types.
- `mock/<EVENT>/`: anonymized captured payloads used as protocol fixtures.
- `examples/node/`: Bun CLI for direct real-room TCP testing.
- `examples/browser/`: Bun-served browser console with automatic room/token/WSS resolution.
- `dist/`: generated package output; do not edit or commit it.

## Tooling and commands

Use Bun; the repository pins the package manager in `package.json` and tracks only `bun.lock`.

```sh
bun install
bun run check
bun run typecheck
bun test
bun run build
bun run examples:build
```

`bun run ci` is the complete local gate. Unit tests live in `test/` and use
`bun:test`; parser tests should use anonymized payloads from `mock/`, while
listener tests should use an in-memory fake event source rather than a live room.
For every source change, run the relevant focused test plus the complete gate
before handoff.

Ultracite drives the Biome configuration. Use `bun run check` for verification
and `bun run fix` for safe automated fixes. Protocol fixtures under `mock/` are
intentionally excluded to prevent formatting-only fixture churn.

## Code conventions

- Follow `biome.json`: 2-space indentation, single quotes, semicolons only when
  required, and ES5-style trailing commas.
- Keep the project ESM-native and use explicit `import type` for type-only
  imports.
- Keep public field names and payload conventions stable, including existing
  snake_case fields such as `room_id`, `guard_level`, and `content_color`.
- Add concise Chinese JSDoc to consumer-facing fields and handlers, matching the
  existing public types.
- Do not broadly replace `any` in raw Bilibili payload paths. Upstream event
  schemas are incomplete and change over time; tighten types only when supported
  by captured payloads or upstream definitions.
- Treat upstream payloads as untrusted. Guard missing nested data before parsing
  and return `null` for safely ignorable malformed/unsupported events when the
  parser contract allows it. The listener must check that result before calling
  a consumer handler.
- Preserve live getters in the listener result (`online` and `closed`) as
  getters; copying their initial values makes them stale.

## Adding or changing an event

When adding support for an event, update the full public path rather than only
the parser:

1. Add or update `src/parser/<EVENT>.ts` with the public body interface, parser,
   constant `eventName`, constant `handlerName`, and handler type.
2. Re-export the parser and its types from `src/parser/index.ts`.
3. Include its message type in `src/types/message.ts` when it is public.
4. Add the handler type to `MsgHandler` and wire the event in
   `src/listener/index.ts`.
5. Preserve raw delivery: a registered `handler.raw[EVENT]` must receive the raw
   event body even when no parsed handler is registered.
6. Add anonymized real payloads under `mock/<EVENT>/` and document any new
   anonymization tokens in `mock/README.md`.
7. Update `README.md` and examples when the consumer-facing API changes.
8. Add focused Bun tests, run `bun run ci`, and inspect generated declarations
   for the new export.

Several upstream event names intentionally share one consumer handler (for
example the user-action family). Keep each raw event independently subscribable
while routing parsed results to the shared handler.

## Mock data and privacy

Mocks should come from real event shapes whenever possible, but must not expose
real user IDs, names, avatars, medal data, room IDs, message text, cookies,
WebSocket keys, or other credentials. Follow the substitutions documented in
`mock/README.md` and extend that table before introducing a new kind of private
value. Never commit credentials copied from the examples or a live session.

## Scope and release safety

- Keep Node and browser APIs in parity unless their transport types genuinely
  differ.
- Keep `package.json` exports aligned with tsdown's `.js`/`.cjs` and
  `.d.ts`/`.d.cts` outputs. The build runs publint to validate this contract.
- Avoid dependency upgrades, generated-file churn, or parser refactors outside
  the requested change; live protocol behavior is difficult to validate from
  static fixtures alone.
- Do not bump `package.json` version, create tags, publish to npm, or modify the
  release workflow unless explicitly requested.
- Release automation is tag-triggered. A version tag is therefore an external
  release action, not a routine validation step.
- Before handing off, report which validations ran and distinguish local build
  success from verification against a real Bilibili room.
