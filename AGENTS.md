# AGENTS.md

Guidance for AI coding agents working in this repository.

## Project

AudioBrief is a client-only React app: the user pastes their own OpenRouter API key, uploads an audio file, and gets back 3 YouTube titles, 3 descriptions, and 3 AI-generated 16:9 thumbnails. There is no backend. The API key lives only in React state and is sent straight from the browser to OpenRouter.

## Commands

The package manager is pnpm (`pnpm-lock.yaml`).

- `pnpm dev`: Vite dev server
- `pnpm build`: type-check (`tsc`), then `vite build` into `dist/`
- `pnpm lint`: ESLint with `--max-warnings 0`, so any warning fails the run
- `pnpm format <files>`: Prettier

There is no test framework. Verify changes with `pnpm build` (strict TS with `noUnusedLocals`/`noUnusedParameters`) and `pnpm lint`.

A Husky pre-commit hook runs `lint-staged`, which runs lint and format on staged `*.ts`/`*.tsx` files.

## Architecture

- Import from `src/` with the `@/` alias (set in both `vite.config.ts` and `tsconfig.json`).
- `src/HeroSection.tsx` owns all app state: the API key, the selected file, the generated result and the loading flag. It wires together `ApiInputKey`, `FileUploader`, the generate button and `GeneratedOutput`.
- `src/services/OpenRouterAudio.tsx` holds all the AI logic, in `generateYouTubeContent(file, apiKey, onOutput)`:
  1. Rejects audio shorter than 3s. It reads the duration through an `Audio` element; if the browser can't read it, the file is let through.
  2. Base64-encodes the file and streams a verbatim transcription from `google/gemini-3.1-flash-lite:nitro`. The audio `format` is taken from the file extension.
  3. Treats the transcript as invalid if the model returns the `INVALID_AUDIO` marker or the transcript has fewer than 3 words.
  4. Runs 4 requests in parallel with `Promise.all`: one text request (Gemini with a strict `json_schema` response format, giving `{titles, descriptions}`) and three separate thumbnail requests (`openai/gpt-5-image-mini`, `modalities: ["image","text"]`, `aspectRatio: "16:9"`). Thumbnails come back as image URLs/data URLs.
  5. Shows errors to the user through `react-fox-toast` (`toast.error`) inside the service, not by throwing. A 401 is mapped to "Api key is invalid".
- `GeneratedResponse` (`{images, titles, descriptions}`) is defined in `src/GeneratedOutput.tsx` and imported by the service. On mobile, the output shows tabs; from `md` up, all sections are visible at once.
- `FileUploader` handles drag-and-drop and file picking, with validation supplied by the parent. It previews audio with `@sina_byn/re-audio`. The input currently accepts only `.mp3,audio/mpeg`.

## Styling

- Tailwind CSS v4 through `@tailwindcss/postcss`, configured CSS-first in `src/index.css` (no `tailwind.config`). Use the `brand-*` color scale, which is aliased to red, rather than raw colors. The font is Syne.
- Animations use `motion` (`motion/react`), and icons come from `lucide-react`.

## Agent skills

`.agents/skills/` has `frontend-design` (visual design guidance) and `openrouter-models` (scripts for querying OpenRouter models, pricing and endpoints). The latter is useful when changing the model IDs in `OpenRouterAudio.tsx`.
