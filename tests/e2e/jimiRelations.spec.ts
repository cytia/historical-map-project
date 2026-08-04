import { expect, test } from "@playwright/test";

test("opens a native-office jimi record from search", async ({ page, isMobile }) => {
  test.skip(isMobile, "The mobile panel layout is covered by the shared map tests.");
  await page.goto("/");
  const search = page.getByRole("textbox", { name: "搜索历史地名" });
  await search.fill("贵州宣慰");
  await page.getByRole("button", { name: /贵州宣慰使司/ }).click();
  await expect(page.locator(".detail-panel").getByRole("heading", {
    name: "贵州宣慰使司",
  })).toBeVisible();
  await expect(page.locator(".detail-panel")).toContainText("土司／土官衙门");
  await expect(page.locator(".detail-panel")).toContainText("宣慰司");
  await expect(page.locator(".left-panel")).toContainText("9 处直属下级");
  await expect(page.locator(".left-panel")).toContainText("青山长官司");
  await expect(page.locator(".left-panel")).toContainText("札佐长官司");
});

test("toggles the jimi point layer", async ({ page }) => {
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "羁縻关系" });
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".layer-bar")).toContainText("羁縻");
});

test("derives jimi levels from explicit subordination relations", async ({ page, isMobile }) => {
  test.skip(isMobile, "The hierarchy panel is covered by the desktop layout.");
  await page.goto("/");
  const hierarchy = await page.evaluate(async () => {
    const [{ jimiById }, { jimiHierarchyData }, { getHierarchyDisplayState }] = await Promise.all([
      import("/src/jimiData.ts"),
      import("/src/jimiHierarchyData.ts"),
      import("/src/hierarchyDisplay.ts"),
    ]);
    const root = jimiById.get("guizhou-xuanwei-military");
    const child = jimiById.get("shuidong-guizhou-military");
    const directChildren = [...jimiById.values()]
      .filter((record) => record.jimiParentId === "guizhou-xuanwei-military")
      .map((record) => record.unit.id);
    const domain = jimiHierarchyData(undefined, child?.unit.id ?? null, "domain");
    const domainWithoutSelection = jimiHierarchyData(undefined, null, "domain");
    const overview = jimiHierarchyData(undefined, child?.unit.id ?? null, "overview");
    return {
      rootDepth: root?.jimiDepth,
      childDepth: child?.jimiDepth,
      childRootId: child?.jimiRootId,
      directChildren,
      domainPointIds: domain.records.map((record) => record.unit.id),
      relationIds: domain.relations.features.map((feature) => feature.properties?.id),
      flowRelationIds: domain.flowRelations.features.map((feature) => feature.properties?.id),
      domainWithoutSelection: {
        recordCount: domainWithoutSelection.records.length,
        relationCount: domainWithoutSelection.relations.features.length,
        flowCount: domainWithoutSelection.flowRelations.features.length,
      },
      overviewDisplay: getHierarchyDisplayState("overview", true),
      overviewContainsChild: overview.records.some((record) => record.unit.id === child?.unit.id),
    };
  });
  expect(hierarchy.rootDepth).toBe(1);
  expect(hierarchy.childDepth).toBe(2);
  expect(hierarchy.childRootId).toBe("guizhou-xuanwei-military");
  expect(hierarchy.directChildren).toHaveLength(9);
  expect(hierarchy.directChildren).toEqual(expect.arrayContaining([
    "qingshan-guizhou-military",
    "zhazuo-guizhou-military",
  ]));
  expect(hierarchy.domainPointIds).toContain("shuidong-guizhou-military");
  expect(hierarchy.domainPointIds).toContain("jinzhu-guizhou-military");
  expect(hierarchy.relationIds).toContain("shuidong-guizhou-military");
  expect(hierarchy.relationIds).not.toContain("jinzhu-guizhou-military");
  expect(hierarchy.flowRelationIds).toContain("shuidong-guizhou-military");
  expect(hierarchy.domainWithoutSelection.relationCount).toBe(0);
  expect(hierarchy.domainWithoutSelection.flowCount).toBe(0);
  expect(hierarchy.overviewDisplay.showDescendants).toBe(false);
  expect(hierarchy.overviewDisplay.showRelations).toBe(true);
  expect(hierarchy.overviewDisplay.animateRelations).toBe(true);
  expect(hierarchy.overviewContainsChild).toBe(false);
});
