import { expect, test, type Page } from "@playwright/test";

async function selectMilitarySearchResult(page: Page, query: string, name: string, headingName = name) {
  await page.getByRole("textbox", { name: "搜索历史地名" }).fill(query);
  await page.locator(".search-results").getByRole("button", { name: new RegExp(name) }).click();
  await expect(page.getByRole("heading", { name: headingName }).last()).toBeVisible();
  await page.waitForTimeout(800);
}

async function expectAnimatedMap(page: Page) {
  const canvas = page.locator(".maplibregl-canvas");
  const firstFrame = await canvas.screenshot();
  await page.waitForTimeout(180);
  await expect.poll(async () => (await canvas.screenshot()).equals(firstFrame)).toBe(false);
}

test("reuses animated prefecture relations across the Dusi hierarchy", async ({ page, isMobile }) => {
  test.skip(isMobile, "Pointer hover priority and animated map relations are desktop interactions");
  const consoleErrors: string[] = [];
  const notFoundRequests: string[] = [];
  page.on("pageerror", (error) => consoleErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("response", (response) => {
    if (response.status() === 404) notFoundRequests.push(response.url());
  });

  await page.goto("/");
  await expect(page.locator(".maplibregl-canvas")).toBeVisible();
  await page.getByRole("button", { name: "都司" }).click();
  await expect(page.getByRole("button", { name: "都司" })).toHaveAttribute("aria-pressed", "true");

  const leftPanel = page.locator(".left-panel");
  await page.evaluate(async () => {
    const { useAppStore } = await import("/src/store.ts");
    useAppStore.getState().setHoveredMilitaryUnit("longliwei-guizhou-military");
  });
  await expect(leftPanel.getByText("都司系统资料", { exact: true })).toBeVisible();
  await expect(leftPanel.getByRole("heading", { name: "贵州都指挥使司" })).toBeVisible();
  await page.evaluate(async () => {
    const { useAppStore } = await import("/src/store.ts");
    useAppStore.getState().setHoveredMilitaryUnit(null);
  });
  await expect(leftPanel.getByRole("heading", { name: "两京十三布政司" })).toBeVisible();

  await selectMilitarySearchResult(page, "贵州都指挥使司", "贵州都司", "贵州都指挥使司");
  await expect(leftPanel.getByText("都司系统资料", { exact: true })).toBeVisible();
  await expect(leftPanel.getByText("驻所 · 新贵", { exact: true })).toBeVisible();
  await expect(leftPanel.getByText("五军都督府 · 右军都督府", { exact: true })).toBeVisible();
  await expect(leftPanel.getByText("已核验 18 卫，7 所", { exact: true })).toBeVisible();
  const statisticsSection = leftPanel.locator(".scope-section").filter({ hasText: "军额／屯田／屯粮" });
  await expect(statisticsSection).toBeVisible();
  const sectionOrder = await leftPanel.locator(".scope-section").evaluateAll((sections) =>
    sections.map((section) => section.textContent ?? ""));
  expect(sectionOrder.findIndex((text) => text.includes("军额／屯田／屯粮")))
    .toBeLessThan(sectionOrder.findIndex((text) => text.includes("直属卫")));
  for (const marker of ["①", "②", "③"]) {
    const footnote = statisticsSection.locator("sup", { hasText: marker });
    await footnote.hover();
    await expect(page.getByRole("tooltip")).toContainText("来源：");
  }
  const mapBounds = await page.locator(".map").boundingBox();
  expect(mapBounds).not.toBeNull();
  await page.mouse.move(
    mapBounds!.x + (mapBounds!.width / 2),
    mapBounds!.y + (mapBounds!.height / 2),
  );
  await expect(leftPanel.getByRole("heading", { name: "贵州", exact: true })).toBeVisible();
  await page.getByRole("heading", { name: "明代历史地图" }).hover();
  await expect(leftPanel.getByRole("heading", { name: "贵州都指挥使司" })).toBeVisible();
  const militaryFocusPaint = await page.evaluate(async () => {
    const { applyMapPointFocus } = await import("/src/mapPointFocus.ts");
    const paint: Record<string, unknown> = {};
    const map = {
      getLayer: () => ({}),
      setPaintProperty: (layerId: string, property: string, value: unknown) => {
        paint[`${layerId}.${property}`] = value;
      },
    };
    applyMapPointFocus(map as never, {
      selectedUnitId: null,
      selectedMilitaryUnitId: "guizhou-dusi",
      hoveredRegionId: null,
      hoveredMilitaryUnitId: null,
      activeRegionId: "guizhou",
    });
    return paint;
  });
  expect(militaryFocusPaint["seat-points.circle-opacity"]).toBe(0.28);
  expect(militaryFocusPaint["seat-labels.text-opacity"]).toBe(0.2);
  expect(militaryFocusPaint["military-points.icon-opacity"]).toEqual([
    "case",
    ["==", ["get", "commandId"], "guizhou-dusi"],
    1,
    0.28,
  ]);
  const administrativeFocusPaint = await page.evaluate(async () => {
    const { applyMapPointFocus } = await import("/src/mapPointFocus.ts");
    const paint: Record<string, unknown> = {};
    const map = {
      getLayer: () => ({}),
      setPaintProperty: (layerId: string, property: string, value: unknown) => {
        paint[`${layerId}.${property}`] = value;
      },
    };
    applyMapPointFocus(map as never, {
      selectedUnitId: "guiyang-prefecture",
      selectedMilitaryUnitId: null,
      hoveredRegionId: null,
      hoveredMilitaryUnitId: null,
      activeRegionId: "guizhou",
    });
    return paint;
  });
  expect(administrativeFocusPaint["seat-points.circle-opacity"]).toEqual([
    "case",
    ["==", ["get", "regionId"], "guizhou"],
    1,
    0.28,
  ]);
  expect(administrativeFocusPaint["military-points.icon-opacity"]).toBe(0.28);
  await expectAnimatedMap(page);

  await selectMilitarySearchResult(page, "龙里卫", "龙里卫", "龙里卫军民指挥使司");
  await expect(leftPanel.getByRole("heading", { name: "贵州都指挥使司" })).toBeVisible();
  const focusCommandId = await page.evaluate(async () => {
    const { getMilitaryCommandRecord } = await import("/src/militaryData.ts");
    return getMilitaryCommandRecord("longliwei-guizhou-military")?.unit.id;
  });
  expect(focusCommandId).toBe("guizhou-dusi");
  await expectAnimatedMap(page);

  await page.getByRole("button", { name: "全域" }).click();
  const domainData = await page.evaluate(async () => {
    const [{ publishedMilitaryRecords }, { militaryHierarchyData }] = await Promise.all([
      import("/src/militaryData.ts"),
      import("/src/militaryRelationData.ts"),
    ]);
    const data = militaryHierarchyData(
      publishedMilitaryRecords,
      "longliwei-guizhou-military",
      "domain",
    );
    return {
      secondaryPointIds: data.records
        .filter((record) => record.unit.militaryKind === "qianhu-suo")
        .map((record) => record.unit.id),
      secondaryRelationIds: data.secondaryRelations.features
        .map((feature) => feature.properties?.id),
      flowIds: data.flowRelations.features.map((feature) => feature.properties?.id),
      inheritedFiveArmyId: data.records.find(({ unit }) => unit.id === "moni-chishui-military")
        ?.fiveArmyId,
    };
  });
  const subordinateIds = [
    "moni-chishui-military",
    "baisa-chishui-military",
    "aluomi-chishui-military",
    "qian-chishui-military",
  ];
  expect(domainData.secondaryPointIds).toEqual(expect.arrayContaining(subordinateIds));
  expect(domainData.secondaryRelationIds).toEqual(expect.arrayContaining(subordinateIds));
  expect(domainData.flowIds).toEqual(expect.not.arrayContaining(subordinateIds));
  expect(domainData.flowIds).toContain("chishui-guizhou-military");
  expect(domainData.inheritedFiveArmyId).toBe("right");
  await expectAnimatedMap(page);

  expect(consoleErrors).toEqual([]);
  expect(notFoundRequests).toEqual([]);
});
