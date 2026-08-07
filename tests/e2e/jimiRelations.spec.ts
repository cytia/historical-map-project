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
  await expect(page.getByRole("button", { name: "羁縻关系" })).toBeVisible();
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

test("keeps the Wusizang root visible while expanding its subordinate points by scope", async ({ page, isMobile }) => {
  test.skip(isMobile, "The hierarchy projection is covered on desktop.");
  await page.goto("/");
  await expect(page.getByRole("button", { name: "羁縻关系" })).toBeVisible();
  const hierarchy = await page.evaluate(async () => {
    const [{ jimiById }, { jimiHierarchyData }] = await Promise.all([
      import("/src/jimiData.ts"),
      import("/src/jimiHierarchyData.ts"),
    ]);
    const rootId = "wusizang-dusi-jimi";
    const rootSystem = [...jimiById.values()]
      .filter((record) => record.jimiRootId === rootId);
    const independentMilitaryIds = [
      "elis-yuanshuai-fu-jimi",
      "biligongwa-wanhu-fu-jimi",
      "pamu-zhu-ba-wanhu-fu-jimi",
      "yangsiduo-wanhu-fu-jimi",
      "shalu-wanhu-fu-jimi",
      "zhuoyou-wanhu-fu-jimi",
    ];
    const primaryIds = rootSystem
      .filter((record) => record.jimiDisplayLevel === 1)
      .map((record) => record.unit.id);
    const secondaryIds = rootSystem
      .filter((record) => record.jimiDisplayLevel === 2)
      .map((record) => record.unit.id);
    const pointIds = (scope: "overview" | "unit" | "domain", selectedId: string | null) =>
      jimiHierarchyData(undefined, selectedId, scope).records.map((record) => record.unit.id);
    const relationIds = (scope: "overview" | "unit" | "domain", selectedId: string | null) =>
      jimiHierarchyData(undefined, selectedId, scope).relations.features
        .map((feature) => feature.properties?.id);
    const secondaryId = secondaryIds[0];
    return {
      primaryIds,
      secondaryIds,
      overview: pointIds("overview", rootId),
      unit: pointIds("unit", rootId),
      domain: pointIds("domain", rootId),
      unitFromSecondary: pointIds("unit", secondaryId),
      overviewRelations: relationIds("overview", rootId),
      unitRelations: relationIds("unit", rootId),
      domainRelations: relationIds("domain", rootId),
      unitFlowRelations: jimiHierarchyData(undefined, rootId, "unit")
        .flowRelations.features.map((feature) => feature.properties?.id),
      domainFlowRelations: jimiHierarchyData(undefined, rootId, "domain")
        .flowRelations.features.map((feature) => feature.properties?.id),
      independentRelations: jimiHierarchyData(undefined, independentMilitaryIds[0], "unit")
        .relations.features.map((feature) => feature.properties?.id),
      independentDomainRelations: jimiHierarchyData(undefined, independentMilitaryIds[0], "domain")
        .relations.features.map((feature) => feature.properties?.id),
      independentMilitary: independentMilitaryIds.map((id) => {
        const record = jimiById.get(id);
        return {
          id,
          displayLevel: record?.jimiDisplayLevel,
          parentId: record?.jimiParentId,
          rootId: record?.jimiRootId,
        };
      }),
      excludedFiefNames: [...jimiById.values()]
        .filter((record) => /教王|法王/.test(record.unit.name))
        .map((record) => record.unit.name),
    };
  });

  expect(hierarchy.primaryIds).toEqual(expect.arrayContaining([
    "wusizang-dusi-jimi",
    "anbuluo-xing-dusi-jimi",
    "shangqiongbu-wei-jimi",
    "niuerzongzhai-xing-dusi-jimi",
    "lingsiben-xing-dusi-jimi",
  ]));
  expect(hierarchy.secondaryIds).toEqual(expect.arrayContaining([
    "dalong-qianhusuo-jimi",
    "gelatang-qianhusuo-jimi",
  ]));
  expect(hierarchy.overview).toEqual(expect.arrayContaining(hierarchy.primaryIds));
  expect(hierarchy.overview).not.toEqual(expect.arrayContaining(hierarchy.secondaryIds));
  expect(hierarchy.unit).toEqual(expect.arrayContaining([
    ...hierarchy.primaryIds,
    ...hierarchy.secondaryIds,
  ]));
  expect(hierarchy.domain).toEqual(expect.arrayContaining([
    ...hierarchy.primaryIds,
    ...hierarchy.secondaryIds,
  ]));
  expect(hierarchy.unitFromSecondary).toEqual(expect.arrayContaining([
    ...hierarchy.primaryIds,
    ...hierarchy.secondaryIds,
  ]));
  expect(hierarchy.overviewRelations).toEqual(expect.arrayContaining([
    "anbuluo-xing-dusi-jimi",
    "niuerzongzhai-xing-dusi-jimi",
    "lingsiben-xing-dusi-jimi",
  ]));
  expect(hierarchy.overviewRelations).not.toEqual(expect.arrayContaining(hierarchy.secondaryIds));
  expect(hierarchy.unitRelations).toHaveLength(6);
  expect(hierarchy.unitRelations).toEqual(expect.arrayContaining([
    ...hierarchy.primaryIds.filter((id) => id !== "wusizang-dusi-jimi"),
    ...hierarchy.secondaryIds,
  ]));
  expect(hierarchy.domainRelations).toHaveLength(6);
  expect(hierarchy.domainRelations).toEqual(expect.arrayContaining([
    ...hierarchy.primaryIds.filter((id) => id !== "wusizang-dusi-jimi"),
    ...hierarchy.secondaryIds,
  ]));
  expect(hierarchy.unitFlowRelations).toHaveLength(4);
  expect(hierarchy.unitFlowRelations).toEqual(expect.arrayContaining(
    hierarchy.primaryIds.filter((id) => id !== "wusizang-dusi-jimi"),
  ));
  expect(hierarchy.unitFlowRelations).not.toEqual(expect.arrayContaining(hierarchy.secondaryIds));
  expect(hierarchy.domainFlowRelations).toHaveLength(4);
  expect(hierarchy.domainFlowRelations).toEqual(expect.arrayContaining(
    hierarchy.primaryIds.filter((id) => id !== "wusizang-dusi-jimi"),
  ));
  expect(hierarchy.domainFlowRelations).not.toEqual(expect.arrayContaining(hierarchy.secondaryIds));
  expect(hierarchy.independentRelations).toEqual([]);
  expect(hierarchy.independentDomainRelations).toEqual([]);
  expect(hierarchy.independentMilitary).toEqual(expect.arrayContaining(
    [
      "elis-yuanshuai-fu-jimi",
      "biligongwa-wanhu-fu-jimi",
      "pamu-zhu-ba-wanhu-fu-jimi",
      "yangsiduo-wanhu-fu-jimi",
      "shalu-wanhu-fu-jimi",
      "zhuoyou-wanhu-fu-jimi",
    ].map((id) => ({ id, displayLevel: 1, parentId: null, rootId: id })),
  ));
  expect(hierarchy.excludedFiefNames).toEqual([]);
});

test("keeps the Dugan roster levels and suppresses qianhu flow animation", async ({ page, isMobile }) => {
  test.skip(isMobile, "The hierarchy projection is covered on desktop.");
  await page.goto("/");
  await expect(page.getByRole("button", { name: "羁縻关系" })).toBeVisible();
  const hierarchy = await page.evaluate(async () => {
    const [{ jimiById }, { jimiHierarchyData }] = await Promise.all([
      import("/src/jimiData.ts"),
      import("/src/jimiHierarchyData.ts"),
    ]);
    const rootId = "dugan-xing-dusi-jimi";
    const primaryIds = [
      rootId,
      "longda-wei-jimi",
      "dugansi-xuanwei-jimi",
      "dongbu-hanhu-xuanwei-jimi",
      "changhexi-yutong-ningyuan-xuanwei-jimi",
      "dugansi-zhaotao-jimi",
      "dugan-longda-zhaotao-jimi",
      "dugan-dan-zhaotao-jimi",
      "dugan-cangtang-zhaotao-jimi",
      "dugan-chuan-zhaotao-jimi",
      "moerkan-zhaotao-jimi",
      "shaerke-wanhu-fu-jimi",
      "naizhu-wanhu-fu-jimi",
      "luosiduan-wanhu-fu-jimi",
      "biesima-wanhu-fu-jimi",
    ];
    const secondaryIds = [
      "dugansi-qianhusuo-jimi",
      "lazong-qianhusuo-jimi",
      "bolijia-qianhusuo-jimi",
      "changhexi-qianhusuo-jimi",
      "duobasansun-qianhusuo-jimi",
      "jiaba-qianhusuo-jimi",
      "zhaori-qianhusuo-jimi",
      "nazhu-qianhusuo-jimi",
      "lunda-qianhusuo-jimi",
      "guoyou-qianhusuo-jimi",
      "shalikehuhudi-qianhusuo-jimi",
      "bolijiasi-qianhusuo-jimi",
      "salituer-qianhusuo-jimi",
      "canbulang-qianhusuo-jimi",
      "lacuoya-qianhusuo-jimi",
      "xieliba-qianhusuo-jimi",
      "runzelusun-qianhusuo-jimi",
    ];
    const overview = jimiHierarchyData(undefined, rootId, "overview");
    const unit = jimiHierarchyData(undefined, rootId, "unit");
    const domain = jimiHierarchyData(undefined, rootId, "domain");
    return {
      primaryIds,
      secondaryIds,
      primaryLevels: primaryIds.map((id) => jimiById.get(id)?.jimiDisplayLevel),
      primaryRoots: primaryIds.map((id) => ({
        id,
        parentId: jimiById.get(id)?.jimiParentId,
        rootId: jimiById.get(id)?.jimiRootId,
      })),
      secondaryLevels: secondaryIds.map((id) => jimiById.get(id)?.jimiDisplayLevel),
      overviewPointIds: overview.records.map((record) => record.unit.id),
      unitPointIds: unit.records.map((record) => record.unit.id),
      domainPointIds: domain.records.map((record) => record.unit.id),
      unitRelationIds: unit.relations.features.map((feature) => feature.properties?.id),
      domainRelationIds: domain.relations.features.map((feature) => feature.properties?.id),
      unitFlowRelationIds: unit.flowRelations.features.map((feature) => feature.properties?.id),
      domainFlowRelationIds: domain.flowRelations.features.map((feature) => feature.properties?.id),
    };
  });

  expect(hierarchy.primaryLevels).toEqual(hierarchy.primaryLevels.map(() => 1));
  expect(hierarchy.primaryRoots).toEqual(expect.arrayContaining([
    { id: "dugan-xing-dusi-jimi", parentId: null, rootId: "dugan-xing-dusi-jimi" },
    { id: "longda-wei-jimi", parentId: "dugan-xing-dusi-jimi", rootId: "dugan-xing-dusi-jimi" },
    { id: "dugansi-xuanwei-jimi", parentId: null, rootId: "dugansi-xuanwei-jimi" },
    { id: "dugansi-zhaotao-jimi", parentId: null, rootId: "dugansi-zhaotao-jimi" },
    { id: "shaerke-wanhu-fu-jimi", parentId: null, rootId: "shaerke-wanhu-fu-jimi" },
  ]));
  expect(hierarchy.secondaryLevels).toEqual(hierarchy.secondaryLevels.map(() => 2));
  expect(hierarchy.overviewPointIds).toEqual(expect.arrayContaining(hierarchy.primaryIds));
  expect(hierarchy.overviewPointIds).not.toEqual(expect.arrayContaining(hierarchy.secondaryIds));
  expect(hierarchy.unitPointIds).toEqual(expect.arrayContaining([
    ...hierarchy.primaryIds,
    ...hierarchy.secondaryIds,
  ]));
  expect(hierarchy.domainPointIds).toEqual(hierarchy.unitPointIds);
  expect(hierarchy.unitRelationIds).toHaveLength(18);
  expect(hierarchy.domainRelationIds).toHaveLength(18);
  expect(hierarchy.unitRelationIds).toContain("longda-wei-jimi");
  expect(hierarchy.unitFlowRelationIds).toEqual(["longda-wei-jimi"]);
  expect(hierarchy.domainFlowRelationIds).toEqual(["longda-wei-jimi"]);
});
