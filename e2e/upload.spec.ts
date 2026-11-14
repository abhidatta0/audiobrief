import { test, expect } from "@playwright/test";
import {
  FIXTURES,
  fillApiKey,
  generateButton,
  readFixture,
  uploadFile,
} from "./helpers/openrouter";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("shows the audio player after uploading an mp3", async ({ page }) => {
  await uploadFile(page, FIXTURES.beep);

  await expect(page.getByText("beep-1-second.mp3")).toBeVisible();
  await expect(page.getByRole("button", { name: "Change file" })).toBeVisible();
  await expect(page.getByText("Drag and drop file")).toBeHidden();
});

test("rejects a non-audio file", async ({ page }) => {
  await fillApiKey(page);
  await page.locator('input[type="file"]').setInputFiles({
    name: "notes.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("not audio"),
  });

  await expect(page.getByText("Please upload an audio file")).toBeVisible();
  await expect(generateButton(page)).toBeDisabled();
});

test("enables generate only when both key and file are present", async ({
  page,
}) => {
  await fillApiKey(page);
  await expect(generateButton(page)).toBeDisabled();

  await uploadFile(page, FIXTURES.beep);
  await expect(generateButton(page)).toBeEnabled();

  await page.getByPlaceholder("Enter your api key").fill("");
  await expect(generateButton(page)).toBeDisabled();
});

test("accepts a file dropped onto the upload area", async ({ page }) => {
  const bytes = [...readFixture(FIXTURES.beep)];
  const dataTransfer = await page.evaluateHandle((data) => {
    const dt = new DataTransfer();
    dt.items.add(
      new File([new Uint8Array(data)], "dropped.mp3", { type: "audio/mpeg" }),
    );
    return dt;
  }, bytes);

  await page.getByText("Drag and drop file").dispatchEvent("dragover");
  const dropZone = page.getByText("Drop here...");
  await expect(dropZone).toBeVisible();

  await dropZone.dispatchEvent("drop", { dataTransfer });
  await expect(page.getByText("dropped.mp3")).toBeVisible();
});

test("replaces the file via the change file button", async ({ page }) => {
  await uploadFile(page, FIXTURES.beep);
  await expect(page.getByText("beep-1-second.mp3")).toBeVisible();

  const fileChooser = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Change file" }).click();
  await (await fileChooser).setFiles(FIXTURES.ogg);

  await expect(page.getByText("file_example_OOG_1MG.ogg")).toBeVisible();
  await expect(page.getByText("beep-1-second.mp3")).toBeHidden();
});
