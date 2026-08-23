# Real-time examples

Both examples import the root `src/` entry points directly. Bun cannot resolve a
publishable workspace root as its own `workspace:*` dependency, and direct source
imports also make `--watch`/`--hot` react immediately to library edits. The built
package contract is verified separately by tsdown and publint.

## Node

```sh
bun run example:node -- 652581
```

The CLI listens over TCP and prints parsed messages as newline-delimited JSON.
Copy `node/.env.example` to `node/.env` for authenticated sessions or a bounded
smoke-test duration. Never commit live cookies, keys, or Buvid values.

## Browser

```sh
bun run example:browser
```

Open `http://localhost:3000`. The local Bun server resolves short room IDs and
fetches a current danmu token/WSS endpoint, so the UI normally needs only a room
ID. Manually supplied URL/key values override automatic discovery for protocol
debugging.
