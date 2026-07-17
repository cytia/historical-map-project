import { expect, test, type Page } from "@playwright/test";

async function expectMapReady(page: Page) {
  const canvas = page.locator(".maplibregl-canvas");
  await expect(canvas).toBeVisible();
  const bounds = await page.locator(".map").boundingBox();
  expect(bounds?.width).toBeGreaterThan(0);
  expect(bounds?.height).toBeGreaterThan(0);
  return canvas;
}

test("loads the map and toggles seat rendering", async ({ page, isMobile }) => {
  test.skip(isMobile, "Desktop interaction is covered separately from mobile layout");
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/");
  const canvas = await expectMapReady(page);
  const seatsToggle = page.getByRole("button", { name: "府州治所" });
  await expect(seatsToggle).toHaveAttribute("aria-pressed", "true");

  const withSeats = await canvas.screenshot();
  await seatsToggle.click();
  await expect(seatsToggle).toHaveAttribute("aria-pressed", "false");
  await expect.poll(async () => (await canvas.screenshot()).equals(withSeats)).toBe(false);

  await seatsToggle.click();
  await expect(seatsToggle).toHaveAttribute("aria-pressed", "true");
  expect(errors).toEqual([]);
});

test("keeps affiliation modes separate from base layer toggles", async ({ page }) => {
  await page.goto("/");

  const administrativeMode = page.getByRole("button", { name: "行政着色视图" });
  const jurisdictionMode = page.getByRole("button", { name: "管辖着色视图" });
  const controlMode = page.getByRole("button", { name: "势力着色视图" });

  await expect(administrativeMode).toBeEnabled();
  await expect(administrativeMode).toHaveAttribute("aria-pressed", "true");
  await expect(jurisdictionMode).toBeDisabled();
  await expect(controlMode).toBeDisabled();
  await expect(page.getByRole("button", { name: "府州治所" })).toBeEnabled();
  await expect(page.getByRole("button", { name: "山川地貌" })).toBeEnabled();
});

test("shows the selected seat's administrative region", async ({ page, isMobile }) => {
  test.skip(isMobile, "Region focus is covered once on desktop");
  await page.goto("/");
  await expectMapReady(page);

  await page.getByRole("textbox", { name: "搜索历史地名" }).fill("成都府");
  await page.getByRole("button", { name: "成都府 成都城", exact: true }).click();
  await expect(page.getByRole("heading", { name: "四川" })).toBeVisible();
  await expect(page.getByText("总录入 12 府，21 州，107 县")).toBeVisible();
  await expect(page.getByText("省级资料", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "成都府" })).toBeVisible();
  await expect(page.getByText("治所 · 成都城", { exact: true })).toBeVisible();

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
  await expect(page.getByText("暂无可靠县级户口记录")).toBeVisible();
  await expect.poll(async () => (await canvas.screenshot()).equals(collapsed)).toBe(false);
});

test("shows the Nanjing capital-region aggregation and missing-item notes", async ({ page, isMobile }) => {
  test.skip(isMobile, "Regional statistics are covered once on desktop");
  await page.goto("/");
  await expectMapReady(page);

  await page.getByRole("textbox", { name: "搜索历史地名" }).fill("应天府");
  await page.getByRole("button", { name: "应天府 南京城", exact: true }).click();
  await expect(page.getByText("直隶区资料", { exact: true })).toBeVisible();
  await expect(page.getByText("总录入 14 府，17 州")).toBeVisible();
  await expect(page.getByText("2,069,067 户")).toBeVisible();
  await expect(page.getByText("口数 10,501,651 口")).toBeVisible();
  await expect(page.getByText("本色小麦 942,302 石余")).toBeVisible();
  await expect(page.getByText("本色米 4,999,950 石余")).toBeVisible();
  const populationMarker = page.locator(".scope-primary sup");
  await populationMarker.hover();
  await expect(page.getByRole("tooltip")).toContainText("按14府、4直隶州登记值汇总");
  const taxMarker = page.getByText("赋税原额", { exact: true }).locator("sup");
  await taxMarker.hover();
  await expect(page.getByRole("tooltip")).toContainText("折色银等其他税目未纳入");
});

test("shows Yingtian statistics and opens a county from its jurisdiction", async ({ page, isMobile }) => {
  test.skip(isMobile, "Administrative detail navigation is covered once on desktop");
  await page.goto("/");
  await expectMapReady(page);

  await page.getByRole("textbox", { name: "搜索历史地名" }).fill("应天府");
  await page.getByRole("button", { name: "应天府 南京城", exact: true }).click();
  await expect(page.getByText("143,597 户")).toBeVisible();
  await expect(page.getByText("口数 790,513 口")).toBeVisible();
  await expect(page.getByText("明神宗万历六年（公元 1578 年）登记")).toBeVisible();
  const populationMarker = page.locator(".population-primary strong sup");
  await expect(populationMarker).not.toHaveAttribute("title");
  await populationMarker.hover();
  await expect(page.getByRole("tooltip")).toContainText(
    "本项目不另行统计军户、匠户、灶户等特殊户籍",
  );
  const taxMarker = page.locator(".tax-evidence .eyebrow sup");
  await expect(taxMarker).not.toHaveAttribute("title");
  await taxMarker.focus();
  await expect(page.getByRole("tooltip").filter({ hasText: "《大明会典》万历六年实征" }))
    .toBeVisible();
  await expect(page.getByText("本色小麦 11,654 石余")).toBeVisible();
  await expect(page.getByText("本色米 215,159 石余")).toBeVisible();
  await expect(page.locator(".tax-evidence").getByText("折色银", { exact: true })).toBeVisible();
  await expect(page.locator(".tax-evidence").getByText("暂无可靠记录", { exact: true })).toBeVisible();
  const taxFootnotes = page.locator(".tax-ledger .tax-footnote");
  await expect(taxFootnotes).toHaveCount(4);
  await taxFootnotes.nth(0).hover();
  await expect(page.getByRole("tooltip").filter({ hasText: "未分列官田、民田" })).toBeVisible();
  await page.getByRole("button", { name: "上元县" }).click();
  await expect(page.getByRole("heading", { name: "上元县" })).toBeVisible();
  const detailPanel = page.locator(".detail-panel");
  await expect(detailPanel.getByText("下辖单位")).toHaveCount(0);
  await expect(detailPanel.getByText("同级单位")).toBeVisible();

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
  await page.getByRole("button", { name: "苏州府 苏州城", exact: true }).click();
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
  await expect(page.getByRole("button", { name: "山川地貌" }))
    .toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText(/ETOPO 2022/)).toBeAttached();
  const archiveResponse = await page.request.get("/terrain/china-terrain.pmtiles", {
    headers: { Range: "bytes=0-126" },
  });
  expect(archiveResponse.status()).toBe(206);
  expect((await archiveResponse.body()).byteLength).toBe(127);
});

test("loads the local natural reference layer", async ({ page, isMobile }) => {
  test.skip(isMobile, "The reference archive is covered once on desktop");
  const referenceResponsePromise = page.waitForResponse((response) =>
    response.url().endsWith("/reference/natural-reference.geojson"),
  );
  await page.goto("/");
  await expectMapReady(page);
  const referenceResponse = await referenceResponsePromise;
  expect(referenceResponse.ok()).toBe(true);
  const reference = await referenceResponse.json();
  expect(reference.name).toBe("natural-reference");
  expect(reference.features).toEqual(expect.arrayContaining([
    expect.objectContaining({ properties: expect.objectContaining({ kind: "ocean" }) }),
    expect.objectContaining({ properties: expect.objectContaining({ kind: "land" }) }),
    expect.objectContaining({ properties: expect.objectContaining({ kind: "lake" }) }),
    expect.objectContaining({
      properties: expect.objectContaining({
        kind: "river",
        sourceId: expect.stringMatching(/^natural-earth:river:/),
        featurecla: expect.any(String),
        scalerank: expect.any(Number),
        min_zoom: expect.any(Number),
      }),
    }),
    expect.objectContaining({ properties: expect.objectContaining({ kind: "coastline" }) }),
  ]));
});

test("keeps seat rendering after the natural style changes", async ({ page, isMobile }) => {
  test.skip(isMobile, "Desktop interaction is covered separately from mobile layout");
  await page.goto("/");
  const canvas = await expectMapReady(page);
  const referenceToggle = page.getByRole("button", { name: "山川地貌" });
  const seatsToggle = page.getByRole("button", { name: "府州治所" });

  await expect(referenceToggle).toHaveAttribute("aria-pressed", "true");
  await referenceToggle.click();
  await expect(referenceToggle).toHaveAttribute("aria-pressed", "false");
  await referenceToggle.click();
  await expect(referenceToggle).toHaveAttribute("aria-pressed", "true");

  const withSeats = await canvas.screenshot();
  await seatsToggle.click();
  await expect.poll(async () => (await canvas.screenshot()).equals(withSeats)).toBe(false);
  await seatsToggle.click();
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
  await expect(page.getByRole("button", { name: "府州治所" })).toBeVisible();
  await expect(page.getByRole("button", { name: "府级关系" })).toBeEnabled();
  await expect(page.getByRole("button", { name: "当前州府" })).toBeEnabled();
  expect(errors).toEqual([]);
});
