# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Agent Chat UI — a Next.js (App Router) chat client for any LangGraph server whose state exposes a `messages` key. Upstream project: `langchain-ai/agent-chat-ui`. This is a **client-side** app: the browser talks directly to the LangGraph server by default.

## Commands

```bash
pnpm install          # pnpm 10.5.1 (packageManager field); CI uses Node 22.x
pnpm dev              # next dev -> http://localhost:3000
pnpm build            # next build
pnpm start            # serve the production build
pnpm lint             # eslint . (see TypeScript shim note below)
pnpm lint:fix
pnpm format           # prettier --write .
pnpm format:check    # what CI enforces
```

There is **no test suite configured** — no jest/vitest/playwright config and no test files exist. `@playwright/test` is present in devDependencies but unused. The only automated checks are the three CI jobs in `.github/workflows/ci.yml`:

1. `pnpm format:check` (Prettier)
2. `pnpm lint` (ESLint)
3. `codespell` over `README.md` and `src` (ignore list: `.codespellignore`, which whitelists `productionize`)

### The TypeScript shim (important)

`package.json` pins `typescript: ~7.0.2` and `@typescript/typescript6: ~6.0.2`. `typescript-eslint` v8 cannot parse TS7 yet, so the lint script loads `scripts/use-typescript6.cjs` via `NODE_OPTIONS=--require`, which monkey-patches `Module._resolveFilename` to redirect every `require("typescript")` to `@typescript/typescript6`. The shim applies to `pnpm lint` only — `tsc`/`next build` still use the real TS7.

The lint scripts set `NODE_OPTIONS` through `cross-env` so they behave identically under POSIX shells and Windows `cmd.exe`:

```json
"lint": "cross-env NODE_OPTIONS=\"--require ./scripts/use-typescript6.cjs\" eslint ."
```

Keep the value double-quoted. It contains a space, and `cross-env` would otherwise treat the trailing path as a separate argument — which would silently run the shim script itself instead of ESLint, exiting 0 without linting anything.

## Architecture

### Provider stack (`src/app/page.tsx`)

The whole app is a single client page wrapped in three providers, in this order:

1. **`ThreadProvider`** (`src/providers/Thread.tsx`) — owns the thread list. `getThreads()` calls `client.threads.search({ metadata, limit: 100 })`. The metadata key depends on the assistant ID: a UUID is sent as `assistant_id`, anything else as `graph_id` (`getThreadSearchMetadata`).
2. **`StreamProvider`** (`src/providers/Stream.tsx`) — wraps `useStream` from `@langchain/langgraph-sdk/react`. Typed as `{ messages: Message[]; ui?: UIMessage[] }`. **If `apiUrl` or `assistantId` is missing it renders the setup form instead of the chat** — this is the app's only entry/configuration UI.
3. **`ArtifactProvider`** (`src/components/thread/artifact.tsx`) — headless artifact panel built on React portals.
4. **`Thread`** (`src/components/thread/index.tsx`) — the chat UI itself.

### Configuration resolution (read this before changing config behavior)

Config lives in the URL query string via `nuqs` (`useQueryState`), with env vars as defaults:

| Query param   | Env var                    | Default shown in setup form |
| ------------- | -------------------------- | --------------------------- |
| `apiUrl`      | `NEXT_PUBLIC_API_URL`      | `http://localhost:2024`     |
| `assistantId` | `NEXT_PUBLIC_ASSISTANT_ID` | `agent`                     |
| `authScheme`  | `NEXT_PUBLIC_AUTH_SCHEME`  | `""`                        |
| `threadId`    | —                          | —                           |

The precedence is **not uniform**, and this is the single most common source of confusion:

- **apiUrl**: `resolveApiUrl(queryApiUrl, envApiUrl)` returns `envApiUrl || queryApiUrl` — the **env var wins** and the URL param is ignored. Intent: a deployed instance pins its backend. Consequence: if `NEXT_PUBLIC_API_URL` is set, the setup form never appears.
- **assistantId**: `envAssistantId || assistantId` — the **env var wins**, for the same reason. A deployed instance must not have its graph swapped by editing the query string. The query param still applies when no env var is set, so local dev is unaffected. Note that the setup form still _displays_ the env value but the field is ignored on submit — same as the apiUrl field.
- **authScheme**: `queryParam || envVar` — the **query param wins**. This one selects which credential format to send (`X-Auth-Scheme`), not which backend scope to use, so a URL override is not a scope escalation.

`authScheme === "langsmith-api-key"` (the "Built with Agent Builder" toggle) adds an `X-Auth-Scheme` header to every request.

The API key is stored in `localStorage` under `lg:chat:apiKey`, together with the origin under `lg:chat:apiKeyHost`. `getApiKey(apiUrl)` returns the key **only if the stored host matches the current apiUrl origin**, so switching deployments drops the old key.

### LangGraph SDK integration

- `src/providers/client.ts` — `createClient(apiUrl, apiKey, authScheme)` factory for a `Client` instance with optional `X-Auth-Scheme` default header. Use this rather than constructing `Client` inline.
- `useStream` is the source of truth for `messages`, `values`, `interrupt`, `branch`, and `isLoading`. Do not mirror its state into local component state.
- `onCustomEvent` in `Stream.tsx` handles `UIMessage` / `RemoveUIMessage` custom events through `uiMessageReducer` — this is how generative-UI components are delivered by the server.

### Generative UI and artifacts

- `values.ui` holds UI messages. `LoadExternalComponent` (`@langchain/langgraph-sdk/react-ui`) renders them in `src/components/thread/messages/ai.tsx`, matched to an assistant message by `ui.metadata.message_id === message.id`.
- `useArtifact()` returns `[ArtifactContent, { open, setOpen, context, setContext }]`. The returned `ArtifactContent` portals its children into the right-hand panel slot rendered by `Thread`. Artifact `context` is sent back to the graph as the `context` key of the submitted state (`src/components/thread/index.tsx`, `handleSubmit`).

### Interrupts / HITL (agent inbox)

Two interrupt shapes are supported and must be distinguished:

- **HITL** — detected by `isAgentInboxInterruptSchema()` in `src/lib/agent-inbox-interrupt.ts` (requires non-empty `action_requests` **and** `review_configs`). Rendered by `src/components/thread/agent-inbox/` (`ThreadView` → `ThreadActionsView` → `InboxItemInput`). Decisions are `approve` | `edit` | `reject` and are submitted via `stream.submit({}, { command: { resume: { decisions } } })`.
- **Generic** — anything else, rendered by `src/components/thread/messages/generic-interrupt.tsx`.

Interrupts are only surfaced on the last message, or when there are no AI/tool messages at all (`src/components/thread/messages/ai.tsx`).

**HITL review configs are matched by exact `action_name` and fail closed.** An action request whose name has no matching entry in `review_configs` gets no permitted decisions — the UI renders an explanatory message instead of approve/edit/reject buttons, and the only way past it is "Mark as Resolved" (`command: { goto: END }`, which ends the run without executing the action). Do not reintroduce an index-based fallback (`review_configs[0]`, `reviewConfigs[currentIndex]`): applying one action's policy to a different action silently grants decisions that were never permitted for it, which defeats the point of the human gate. Three sites must stay consistent — `agent-inbox/utils.ts` (`createDefaultHumanResponse`), `agent-inbox/components/thread-actions-view.tsx` (`matchingConfig`), and `agent-inbox/components/inbox-item-input.tsx` (`allowedDecisions`).

### Message rendering

- `src/components/thread/messages/ai.tsx` — `AssistantMessage`. Tool calls are handled in two dialects: OpenAI-style (`message.tool_calls`) and Anthropic-style (`tool_use` content blocks, parsed with `parsePartialJson` for partial streaming args).
- `src/components/thread/messages/shared.tsx` — `BranchSwitcher` and `CommandBar` (copy / regenerate).
- `src/components/thread/markdown-text.tsx` — react-markdown + remark-gfm + remark-math/rehype-katex.
- `getContentString()` (`src/components/thread/utils.ts`) flattens multimodal content to a text summary.

### Message-visibility conventions (server-side contracts)

These are read from the README but enforced in the client, so keep them in sync when touching the renderer:

- **`do-not-render-` id prefix** — messages whose `id` starts with this are filtered out of the UI entirely. Constant: `DO_NOT_RENDER_ID_PREFIX` in `src/lib/ensure-tool-responses.ts`.
- **`langsmith:nostream` tag** — server-side tag that suppresses streaming of a tagged model.

### Dangling tool calls

`ensureToolCallsHaveResponses()` (`src/lib/ensure-tool-responses.ts`) runs before every submit: if an AI message has `tool_calls` not followed by a tool message, a placeholder `ToolMessage` is synthesized (with a `do-not-render-` id) so the server does not reject the request.

### Multimodal input

`src/hooks/use-file-upload.tsx` supports upload, drag-drop, and paste, all funneling through `fileToContentBlock()` (`src/lib/multimodal-utils.ts`) which base64-encodes into `ContentBlock.Multimodal.Data`. Supported types: `image/jpeg|png|gif|webp` and `application/pdf`. Duplicate detection keys off `metadata.name` (images) / `metadata.filename` (PDFs).

## Production deployment

`src/app/api/[..._path]/route.ts` is an edge-runtime proxy (`langgraph-nextjs-api-passthrough`) that forwards to `LANGGRAPH_API_URL` and injects `LANGSMITH_API_KEY` server-side, so users never need their own key. Set `NEXT_PUBLIC_API_URL` to `<your-site>/api` in that mode.

**The passthrough does not authenticate its callers.** Anyone who can reach the deployed route can read/write/delete threads and start billed runs. Before deploying, either delete this route and use custom auth on the LangGraph deployment, or put your own auth gate in front of it. To add custom auth headers for direct client connections, add them to the `defaultHeaders` of the `useTypedStream({...})` call in `src/providers/Stream.tsx` (it already forwards an `X-Auth-Scheme` header this way).

## Conventions

- Path alias `@/*` → `./src/*`.
- Tailwind v4 + shadcn/ui (`new-york` style, `neutral` base) — primitives live in `src/components/ui/`. `components.json` is the shadcn config; use `shadcn` CLI to add primitives rather than hand-copying.
- `cn()` in `src/lib/utils.ts` (clsx + tailwind-merge) is the standard class-merging helper.
- Prettier uses `singleAttributePerLine: true` and `prettier-plugin-tailwindcss` (class order is auto-sorted).
- ESLint: `react-hooks/refs` and `react-hooks/set-state-in-effect` are **warnings**, not errors — but they flag real React Compiler / effect-pattern problems; prefer fixing them over silencing.
- Unused bindings are prefixed with `_` (eslint `varsIgnorePattern: "^_"`).
- Theme is CSS-variable driven (`src/app/globals.css`). Tailwind v4 CSS-first setup — there is no `tailwind.config.js`; theme values, the dark variant, and plugins are declared in `globals.css` (`@theme inline`, `@custom-variant`, `@plugin`).
