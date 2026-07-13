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
  const seatsToggle = page.getByRole("checkbox", { name: "州府" });
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

  await page.getByRole("textbox", { name: "搜索历史地名" }).fill("成都府");
  await page.getByRole("button", { name: /成都府/ }).click();
  await expect(page.getByRole("heading", { name: "四川" })).toBeVisible();
  await expect(page.getByText("已录入 12 府 · 6 直隶州 · 0 县")).toBeVisible();
  await expect(page.getByText("省级资料")).toBeVisible();
  await expect(page.getByRole("heading", { name: "成都府" })).toBeVisible();
  await expect(page.locator("dd").filter({ hasText: /^四川$/ })).toBeVisible();

  const peerRegions = page.locator(".scope-peer-regions");
  await expect(peerRegions).not.toHaveAttribute("open", "");
  await peerRegions.getByText("同级单位").click();
  await expect(peerRegions).toHaveAttribute("open", "");
  await peerRegions.getByRole("button", { name: "浙江" }).click();
  await expect(page.getByRole("heading", { name: "浙江" })).toBeVisible();
  await expect(peerRegions).toHaveAttribute("open", "");
});

test("finds a county and expands its prefecture", async ({ page, isMobile }) => {
  test.skip(isMobile, "County search and focus are covered once on desktop");
  await page.goto("/");
  const canvas = await expectMapReady(page);
  const collapsed = await canvas.screenshot();

  await page.getByRole("textbox", { name: "搜索历史地名" }).fill("句容县");
  await page.getByRole("button", { name: /句容县/ }).click();

  await expect(page.getByRole("heading", { name: "句容县" })).toBeVisible();
  await expect(page.getByText("应天府 · 南京", { exact: true })).toBeVisible();
  await expect(page.getByText("暂无可靠县级记录").first()).toBeVisible();
  await expect.poll(async () => (await canvas.screenshot()).equals(collapsed)).toBe(false);
});

test("clears selection after slight pointer movement on empty map", async ({ page, isMobile }) => {
  test.skip(isMobile, "Mouse gesture handling is covered once on desktop");
  await page.goto("/");
  await expectMapReady(page);

  const search = page.getByRole("textbox", { name: "搜索历史地名" });
  await search.fill("句容县");
  await page.getByRole("button", { name: /句容县/ }).click();
  await expect(page.getByRole("heading", { name: "句容县" })).toBeVisible();
  await page.getByRole("checkbox", { name: "州府" }).uncheck();

  await page.mouse.move(640, 300);
  await page.mouse.down();
  await page.mouse.move(645, 300);
  await page.mouse.up();
  await expect(page.getByRole("heading", { name: "句容县" })).toHaveCount(0);

  await search.fill("句容县");
  await page.getByRole("button", { name: /句容县/ }).click();
  await expect(page.getByRole("heading", { name: "句容县" })).toBeVisible();

  await page.mouse.move(640, 300);
  await page.mouse.down();
  await page.mouse.move(652, 300);
  await page.mouse.up();
  await expect(page.getByRole("heading", { name: "句容县" })).toBeVisible();
});

test("shows Yingtian statistics and opens a county from its jurisdiction", async ({ page, isMobile }) => {
  test.skip(isMobile, "Administrative detail navigation is covered once on desktop");
  await page.goto("/");
  await expectMapReady(page);

  await page.getByRole("textbox", { name: "搜索历史地名" }).fill("应天府");
  await page.getByRole("button", { name: /应天府/ }).click();
  await expect(page.getByText("143,597 户")).toBeVisible();
  await expect(page.getByText("口数 790,513 口")).toBeVisible();
  await expect(page.getByText("明神宗万历六年（公元 1578 年）登记")).toBeVisible();
  await expect(page.getByText("小麦 11,654 石余")).toBeVisible();
  await expect(page.getByText("8 县")).toBeVisible();

  await page.getByRole("button", { name: "上元县" }).click();
  await expect(page.getByRole("heading", { name: "上元县" })).toBeVisible();
  await expect(page.getByText("下辖单位")).toHaveCount(0);
  await expect(page.getByText("同级单位")).toBeVisible();

  await page.getByRole("button", { name: "江宁县" }).click();
  await expect(page.getByRole("heading", { name: "江宁县" })).toBeVisible();

  await page.getByRole("button", { name: "返回应天府" }).click();
  await expect(page.getByRole("heading", { name: "应天府" })).toBeVisible();
  await expect(page.getByRole("button", { name: "上元县" })).toBeVisible();
});

test("preserves the prefecture-state-county hierarchy", async ({ page, isMobile }) => {
  test.skip(isMobile, "Nested administrative navigation is covered once on desktop");
  await page.goto("/");
  await expectMapReady(page);

  await page.getByRole("textbox", { name: "搜索历史地名" }).fill("苏州府");
  await page.getByRole("button", { name: /苏州府/ }).click();
  await expect(page.getByRole("button", { name: "太仓州" })).toBeVisible();

  await page.getByRole("button", { name: "太仓州" }).click();
  await expect(page.getByRole("heading", { name: "太仓州" })).toBeVisible();
  await expect(page.getByRole("button", { name: "崇明县" })).toBeVisible();
  await expect(page.getByRole("button", { name: "返回苏州府" })).toBeVisible();

  await page.getByRole("button", { name: "崇明县" }).click();
  await expect(page.getByText("太仓州 · 南京", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "返回太仓州" })).toBeVisible();
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
  const referenceToggle = page.getByRole("checkbox", { name: "地貌" });
  const seatsToggle = page.getByRole("checkbox", { name: "州府" });

  await expect(referenceToggle).toBeChecked();
  await referenceToggle.uncheck();
  await expect(referenceToggle).not.toBeChecked();
  await referenceToggle.check();
  await expect(referenceToggle).toBeChecked();

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

  await page.getByRole("button", { name: "全国与省级资料" }).click();
  await expect(page.getByText("全国总览")).toBeVisible();
  await expect(page.getByRole("checkbox", { name: "府州治所" })).toBeVisible();
  expect(errors).toEqual([]);
});
