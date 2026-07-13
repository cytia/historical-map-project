import { expect, test, type Page } from "@playwright/test";

const referenceStyle = {
  version: 8,
  sources: {},
  layers: [
    {
      id: "reference-background",
      type: "background",
      paint: { "background-color": "#ffffff" },
    },
  ],
};

async function mockReferenceStyle(page: Page) {
  await page.route("https://tiles.openfreemap.org/styles/positron", (route) =>
    route.fulfill({ json: referenceStyle }),
  );
}

async function expectMapReady(page: Page) {
  const canvas = page.locator(".maplibregl-canvas");
  await expect(canvas).toBeVisible();
  const bounds = await page.locator(".map").boundingBox();
  expect(bounds?.width).toBeGreaterThan(0);
  expect(bounds?.height).toBeGreaterThan(0);
  return canvas;
}

test.beforeEach(async ({ page }) => {
  await mockReferenceStyle(page);
});

test("loads the map and toggles seat rendering", async ({ page, isMobile }) => {
  test.skip(isMobile, "Desktop interaction is covered separately from mobile layout");
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/");
  const canvas = await expectMapReady(page);
  const seatsToggle = page.getByRole("checkbox", { name: "府州治所" });
  await expect(seatsToggle).toBeChecked();

  const withSeats = await canvas.screenshot();
  await seatsToggle.uncheck();
  await expect(seatsToggle).not.toBeChecked();
  await expect.poll(async () => (await canvas.screenshot()).equals(withSeats)).toBe(false);

  await seatsToggle.check();
  await expect(seatsToggle).toBeChecked();
  expect(errors).toEqual([]);
});

test("shows the selected seat's administrative region", async ({ page, isMobile }) => {
  test.skip(isMobile, "Region focus is covered once on desktop");
  await page.goto("/");
  await expectMapReady(page);

  await page.getByRole("textbox", { name: "搜索历史地名" }).fill("太原府");
  await page.getByRole("button", { name: /太原府/ }).click();
  await expect(page.getByRole("heading", { name: "山西" })).toBeVisible();
  await expect(page.getByText("5 府 · 2 直隶州 · 7 治所")).toBeVisible();
  await expect(page.getByRole("heading", { name: "太原府" })).toBeVisible();
  await expect(page.locator("dd").filter({ hasText: /^山西$/ })).toBeVisible();
});

test("loads the local terrain archive with attribution", async ({ page, isMobile }) => {
  test.skip(isMobile, "Terrain archive loading is covered once on desktop");
  await page.goto("/");
  await expectMapReady(page);
  await page.getByRole("checkbox", { name: "山川地貌" }).check();
  await expect(page.getByText(/ETOPO 2022/)).toBeAttached();
  const archiveResponse = await page.request.get("/terrain/china-terrain.pmtiles", {
    headers: { Range: "bytes=0-126" },
  });
  expect(archiveResponse.status()).toBe(206);
  expect((await archiveResponse.body()).byteLength).toBe(127);
});

test("keeps seat rendering after the natural style changes", async ({ page, isMobile }) => {
  test.skip(isMobile, "Desktop interaction is covered separately from mobile layout");
  await page.goto("/");
  const canvas = await expectMapReady(page);
  const referenceToggle = page.getByRole("checkbox", { name: "山川地貌" });
  const seatsToggle = page.getByRole("checkbox", { name: "府州治所" });

  await referenceToggle.check();
  await expect(referenceToggle).toBeChecked();
  await expect(page.getByText("现代自然地理参考")).toBeVisible();

  const withSeats = await canvas.screenshot();
  await seatsToggle.uncheck();
  await expect.poll(async () => (await canvas.screenshot()).equals(withSeats)).toBe(false);
  await seatsToggle.check();
  await expectMapReady(page);
});

test("opens map controls on a mobile viewport", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Mobile-only layout check");
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expectMapReady(page);

  await page.getByRole("button", { name: "图层与时期" }).click();
  await expect(page.getByText("当前时间切片")).toBeVisible();
  await expect(page.getByRole("checkbox", { name: "府州治所" })).toBeVisible();
  expect(errors).toEqual([]);
});
