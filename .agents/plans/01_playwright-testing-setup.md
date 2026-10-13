# Plan 01: Playwright E2E Test Setup

Status: approved, not yet implemented

## Goal

Set up Playwright end-to-end testing for AudioBrief with a full-flow test suite that mocks the OpenRouter API, so tests run without a real API key or network calls.

Decisions confirmed with the user:
- **Scope**: Full flow with API mocking (`page.route()`), including streaming SSE responses and error cases
- **Server**: `vite dev` via Playwright's `webServer`
- **Fixtures**: Tiny mp3 files committed to the repo
- **CI**: None — local only for now

## Current state (relevant findings)

- No test framework exists; `pnpm build` (`tsc` + Vite) and `pnpm lint` are the only verification
- `tsconfig.json` `include: ["src"]`, so a root-level `e2e/` folder does not affect the build
- `pnpm lint` runs ESLint with `--max-warnings 0`
- The critical flow (`src/services/OpenRouterAudio.tsx` → `generateYouTubeContent`) makes 4 real OpenRouter calls: 1 streaming transcript, 1 streaming text (json_schema), 3 image requests (`openai/gpt-5-image-mini`)
- Duration check happens before any network call: <3s audio shows a toast and returns early
- Invalid transcript path: model returns `INVALID_AUDIO` marker or <3 words → toast and return
- 401 handling: error toast "Api key is invalid" based on thrown SDK error shape
- Demo modal video exists at `public/audiobrief-demo.mp4`
- Output renders as tabs below `md` breakpoint (`GeneratedOutput`)

## Steps

### 1. Install dependencies

- `pnpm add -D @playwright/test`
- `pnpm exec playwright install chromium` (Chromium only; Firefox/WebKit can be added later)

### 2. Create `playwright.config.ts` (repo root)

- `testDir: "e2e"` — outside `src/`, so `tsc` build is unaffected
- `webServer`: run `pnpm dev` on `localhost:5173` with `reuseExistingServer: !process.env.CI`
- Two projects:
  - `desktop-chromium` (default 1280×720)
  - `mobile-chromium` (Pixel 7 viewport — to test tab behavior in `GeneratedOutput`)
- Reporters: `list` + `html` (`open: "never"`)

### 3. Commit tiny audio fixtures in `e2e/fixtures/`

- `sample-long.mp3` (>3s, passes the duration check)
- `sample-short.mp3` (<3s, triggers the "too short" toast)
- Generated once locally (ffmpeg) and committed as small binaries — ffmpeg is no longer needed; fixtures are committed
- "Not an audio file" case needs no fixture: use `setInputFiles({ name: "notes.txt", mimeType: "text/plain", buffer })`

### 4. Build OpenRouter mock helper — `e2e/helpers/openrouterMock.ts`

A `page.route()` handler on `**/api/v1/chat/completions` that inspects the POST body and responds by request type:

| Request (from body) | Mock response |
|---|---|
| `stream: true` + `input_audio` content (transcription) | SSE stream of a known fake transcript, split across chunks |
| `stream: true` + `responseFormat` json_schema (titles/descriptions) | SSE chunks that concatenate to `{"titles":[3 known strings],"descriptions":[3 known strings]}` — exercises streaming assembly + `JSON.parse` |
| `stream: false` + `modalities: ["image","text"]` (thumbnail ×3) | JSON with `choices[0].message.images[0].imageUrl.url` = inline data-URL image |
| Error variants (toggleable) | `INVALID_AUDIO` marker transcript; HTTP 401 for invalid-key path |

### 5. Test specs in `e2e/`

- **`upload.spec.ts`**
  - Generate button disabled until both key and file are present
  - Rejecting a `.txt` file shows "Please upload an audio file"
  - Audio player preview appears after selecting the long mp3
- **`generate.spec.ts`**
  - Happy path: fill key → upload → click Generate → loading message appears → 3 known mock titles, 3 descriptions and 3 thumbnails render
  - Short-audio toast
  - `INVALID_AUDIO` toast
  - 401 → "Api key is invalid" toast (assert against actual toast observed; SDK error shape verified live)
- **`api-key.spec.ts`**
  - Show/hide password toggle
  - Collapse/expand (aria-label flips between "Collapse"/"Expand")
  - Trimmed input behavior
- **`ui.spec.ts`**
  - Demo modal opens/closes
  - Mobile project asserts tab switching in `GeneratedOutput`

Selector strategy: roles/text first (accessible names like "Generate", "Select file", placeholder `Enter your api key`); add `data-testid` only if something proves unselectable.

### 6. Repo hygiene

- **`package.json` scripts**:
  - `test:e2e` → `playwright test`
  - `test:e2e:ui` → `playwright test --ui`
  - `test:e2e:headed` → `playwright test --headed`
  - `test:e2e:report` → `playwright show-report`
- **`.gitignore`**: add `test-results/`, `playwright-report/`, `blob-report/`, `playwright/.cache/`
- **ESLint**: run `pnpm lint` and fix fallout — e2e files get browser globals by default; likely need a config override giving `e2e/**` Node globals and/or ignoring `playwright-report`. Must stay at `--max-warnings 0`
- **`AGENTS.md`**: update the "no test framework" section with the new test commands

### 7. Verification (all must pass, in order)

1. `pnpm format` (new files)
2. `pnpm lint`
3. `pnpm build`
4. `pnpm test:e2e`

## Risks / notes

- The 401 toast test depends on how `@openrouter/sdk` shapes its thrown error — inspect the actual error during implementation and adjust the mock/assertion to match (worst case: assert generic error behavior instead)
- Fixtures were added once and committed
- Husky pre-commit hook runs lint-staged (`lint` + `format` on staged `*.ts`/`*.tsx`), so e2e files must pass ESLint before commit
