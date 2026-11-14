import { test, expect } from "@playwright/test";
import { generateButton } from "./helpers/openrouter";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("renders header, hero and a disabled generate button", async ({
  page,
}) => {
  await expect(page.getByText("AudioBrief", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Upload Your Audio File" }),
  ).toBeVisible();
  await expect(generateButton(page)).toBeDisabled();
});

test.describe("API key input", () => {
  test("is masked by default and the eye icon toggles visibility", async ({
    page,
  }) => {
    const input = page.getByPlaceholder("Enter your api key");
    await expect(input).toHaveAttribute("type", "password");

    const eyeIcon = input.locator("xpath=preceding-sibling::*[1]");
    await eyeIcon.click();
    await expect(input).toHaveAttribute("type", "text");

    await eyeIcon.click();
    await expect(input).toHaveAttribute("type", "password");
  });

  test("trims whitespace from the key", async ({ page }) => {
    const input = page.getByPlaceholder("Enter your api key");
    await input.fill("  sk-or-123  ");
    await expect(input).toHaveValue("sk-or-123");
  });

  test("collapses and expands, keeping the entered key", async ({ page }) => {
    const input = page.getByPlaceholder("Enter your api key");
    await input.fill("sk-or-123");

    await page.getByRole("button", { name: "Collapse" }).click();
    await expect(input).toBeHidden();

    await page.getByRole("button", { name: "Expand" }).click();
    await expect(input).toHaveValue("sk-or-123");
  });

  test("links to the OpenRouter keys page in a new tab", async ({ page }) => {
    const link = page.getByRole("link", {
      name: "Click here for Openrouter API key",
    });
    await expect(link).toHaveAttribute(
      "href",
      "https://openrouter.ai/settings/keys",
    );
    await expect(link).toHaveAttribute("target", "_blank");
  });
});

test.describe("demo modal", () => {
  test("opens with the demo video and closes with the close button", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Watch demo" }).click();

    await expect(page.locator("video source")).toHaveAttribute(
      "src",
      "/audiobrief-demo.mp4",
    );
    await expect(page.locator("body")).toHaveClass(/overflow-y-hidden/);

    await page.getByRole("button", { name: "Close" }).click();
    await expect(page.locator("video")).toHaveCount(0);
    await expect(page.locator("body")).not.toHaveClass(/overflow-y-hidden/);
  });

  test("closes when the backdrop is clicked but not the content", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Watch demo" }).click();
    const video = page.locator("video");
    await expect(video).toBeVisible();

    // Clicking inside the modal content must not close it
    await page.mouse.click(640, 200);
    await expect(video).toBeVisible();

    // Top-left corner is outside the centered content box
    await page.mouse.click(5, 5);
    await expect(video).toHaveCount(0);
  });
});
