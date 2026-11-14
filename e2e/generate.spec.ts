import { test, expect } from "@playwright/test";
import {
  FIXTURES,
  MOCK_DESCRIPTIONS,
  MOCK_THUMBNAIL,
  MOCK_TITLES,
  fillApiKey,
  generateButton,
  mockOpenRouter,
  uploadFile,
} from "./helpers/openrouter";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await fillApiKey(page);
});

test("generates titles, descriptions and thumbnails", async ({ page }) => {
  const counts = await mockOpenRouter(page, { transcriptionDelayMs: 500 });
  await uploadFile(page, FIXTURES.speech);

  await generateButton(page).click();

  const generatingButton = page.getByRole("button", { name: "Generating" });
  await expect(generatingButton).toBeDisabled();

  await expect(page.getByText("Generated Results")).toBeVisible();
  for (const title of MOCK_TITLES) {
    await expect(page.getByText(title, { exact: true })).toBeVisible();
  }
  for (const description of MOCK_DESCRIPTIONS) {
    await expect(page.getByText(description, { exact: true })).toBeVisible();
  }

  const thumbnails = page.getByRole("img", { name: /^Thumbnail \d$/ });
  await expect(thumbnails).toHaveCount(3);
  for (const thumbnail of await thumbnails.all()) {
    await expect(thumbnail).toHaveAttribute("src", MOCK_THUMBNAIL);
  }

  await expect(generateButton(page)).toBeEnabled();
  expect(counts).toEqual({ transcription: 1, text: 1, thumbnail: 3 });
});

test("rejects audio shorter than 3 seconds without calling the API", async ({
  page,
}) => {
  const counts = await mockOpenRouter(page);
  await uploadFile(page, FIXTURES.beep);

  await generateButton(page).click();

  await expect(page.getByText(/Audio is too short/)).toBeVisible();
  expect(counts).toEqual({ transcription: 0, text: 0, thumbnail: 0 });
});

for (const [name, transcript] of [
  ["the INVALID_AUDIO marker", "INVALID_AUDIO"],
  ["fewer than 3 words", "hi"],
]) {
  test(`stops when the transcript has ${name}`, async ({ page }) => {
    const counts = await mockOpenRouter(page, { transcript });
    await uploadFile(page, FIXTURES.speech);

    await generateButton(page).click();

    await expect(page.getByText(/Audio isn't clear enough/)).toBeVisible();
    await expect(generateButton(page)).toBeEnabled();
    expect(counts).toEqual({ transcription: 1, text: 0, thumbnail: 0 });
  });
}

test("shows an invalid key error on 401", async ({ page }) => {
  await mockOpenRouter(page, { errorStatus: 401 });
  await uploadFile(page, FIXTURES.speech);

  await generateButton(page).click();

  await expect(page.getByText("Api key is invalid")).toBeVisible();
  await expect(generateButton(page)).toBeEnabled();
  await expect(page.getByText(MOCK_TITLES[0])).toHaveCount(0);
});

test.describe("generated output actions", () => {
  test.beforeEach(async ({ page }) => {
    await mockOpenRouter(page);
    await uploadFile(page, FIXTURES.speech);
    await generateButton(page).click();
    await expect(page.getByText(MOCK_TITLES[0])).toBeVisible();
  });

  test("copies a title to the clipboard", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    await page.getByRole("button", { name: "Copy title" }).first().click();

    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboard).toBe(MOCK_TITLES[0]);
  });

  test("downloads a thumbnail", async ({ page }) => {
    const download = page.waitForEvent("download");
    await page
      .getByRole("button", { name: "Download thumbnail" })
      .first()
      .click();

    expect((await download).suggestedFilename()).toBe("thumbnail-1.jpg");
  });
});
