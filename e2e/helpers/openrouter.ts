import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { Page, Route } from "@playwright/test";
import type { ChatGenerationParams$Outbound } from "@openrouter/sdk/models";

export const FIXTURES = {
  speech: fileURLToPath(
    new URL(
      "../fixtures/Mahan Mj বিশ্বখ্যাত গণিতবিদ কেন সন্ন্যাসী হলেন.mp3",
      import.meta.url,
    ),
  ),
  beep: fileURLToPath(
    new URL("../fixtures/beep-1-second.mp3", import.meta.url),
  ),
  ogg: fileURLToPath(
    new URL("../fixtures/file_example_OOG_1MG.ogg", import.meta.url),
  ),
};

export const readFixture = (filePath: string) => readFileSync(filePath);

export const MOCK_TRANSCRIPT =
  "Today we talk about why a world famous mathematician chose to become a monk";

export const MOCK_TITLES = [
  "Mock Title One",
  "Mock Title Two",
  "Mock Title Three",
];

export const MOCK_DESCRIPTIONS = [
  "Mock description one about the mathematician.",
  "Mock description two about the monk.",
  "Mock description three about the journey.",
];

// 1x1 transparent PNG
export const MOCK_THUMBNAIL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

interface MockOptions {
  transcript?: string;
  // Respond to every request with this HTTP error status
  errorStatus?: number;
  // Delay before the transcription response, so loading state can be observed
  transcriptionDelayMs?: number;
}

export interface RequestCounts {
  transcription: number;
  text: number;
  thumbnail: number;
}

const MODEL = "mock/model";

const chunk = (content: string) => ({
  id: "gen-mock",
  object: "chat.completion.chunk",
  created: 0,
  model: MODEL,
  choices: [{ index: 0, delta: { content }, finish_reason: null }],
});

const fulfillStream = (route: Route, parts: string[]) =>
  route.fulfill({
    status: 200,
    headers: { "content-type": "text/event-stream" },
    body:
      parts.map((p) => `data: ${JSON.stringify(chunk(p))}\n\n`).join("") +
      "data: [DONE]\n\n",
  });

const splitInto = (text: string, size: number) => {
  const parts: string[] = [];
  for (let i = 0; i < text.length; i += size) {
    parts.push(text.slice(i, i + size));
  }
  return parts;
};

/**
 * Intercepts every OpenRouter chat completion request and answers it with
 * canned data, so tests never need a real API key.
 */
export const mockOpenRouter = async (page: Page, opts: MockOptions = {}) => {
  const counts: RequestCounts = { transcription: 0, text: 0, thumbnail: 0 };

  await page.route("**/api/v1/chat/completions", async (route) => {
    // The wire format (snake_case), not the SDK's camelCase input type
    const body = route
      .request()
      .postDataJSON() as ChatGenerationParams$Outbound;
    const isTranscription = body.messages.some(
      (m) =>
        Array.isArray(m.content) &&
        m.content.some((c) => c.type === "input_audio"),
    );

    if (isTranscription) counts.transcription++;
    else if (body.response_format) counts.text++;
    else counts.thumbnail++;

    if (opts.errorStatus) {
      return route.fulfill({
        status: opts.errorStatus,
        contentType: "application/json",
        body: JSON.stringify({
          error: { code: opts.errorStatus, message: "Mocked error" },
        }),
      });
    }

    if (isTranscription) {
      if (opts.transcriptionDelayMs) {
        await new Promise((r) => setTimeout(r, opts.transcriptionDelayMs));
      }
      return fulfillStream(
        route,
        splitInto(opts.transcript ?? MOCK_TRANSCRIPT, 20),
      );
    }

    if (body.response_format) {
      const json = JSON.stringify({
        titles: MOCK_TITLES,
        descriptions: MOCK_DESCRIPTIONS,
      });
      return fulfillStream(route, splitInto(json, 25));
    }

    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: "gen-mock",
        object: "chat.completion",
        created: 0,
        model: MODEL,
        choices: [
          {
            index: 0,
            finish_reason: "stop",
            message: {
              role: "assistant",
              content: "",
              images: [{ image_url: { url: MOCK_THUMBNAIL } }],
            },
          },
        ],
      }),
    });
  });

  return counts;
};

export const fillApiKey = (page: Page, key = "sk-or-test") =>
  page.getByPlaceholder("Enter your api key").fill(key);

export const uploadFile = (page: Page, filePath: string) =>
  page.locator('input[type="file"]').setInputFiles(filePath);

export const generateButton = (page: Page) =>
  page.getByRole("button", { name: "Generate", exact: true });
