import { expect, test, type Page } from "@playwright/test";
import type { Map } from "maplibre-gl";
import {
  queryAdministrativeTargets,
  selectionHitRadius,
} from "../../src/mapSelectionInteraction";

const referenceStyle = {
  version: 8,
  sources: {},
  layers: [{
    id: "reference-background",
    type: "background",
    paint: { "background-color": "#ffffff" },
  }],
};

async function prepareMap(page: Page) {
  await page.route("https://tiles.openfreemap.org/styles/positron", (route) =>
    route.fulfill({ json: referenceStyle }),
  );
  await page.goto("/");
  await expect(page.locator(".maplibregl-canvas")).toBeVisible();
}

async function mapPoint(
  page: Page,
  target: [number, number],
  center: [number, number],
  zoom: number,
) {
  const bounds = await page.locator(".map").boundingBox();
  expect(bounds).not.toBeNull();
  const worldSize = 512 * (2 ** zoom);
  const mercatorX = (longitude: number) => (longitude + 180) / 360;
  const mercatorY = (latitude: number) => {
    const radians = latitude * Math.PI / 180;
    return (1 - Math.log(Math.tan(radians) + (1 / Math.cos(radians))) / Math.PI) / 2;
  };
  return {
    x: bounds!.x + (bounds!.width / 2) +
      ((mercatorX(target[0]) - mercatorX(center[0])) * worldSize),
    y: bounds!.y + (bounds!.height / 2) +
      ((mercatorY(target[1]) - mercatorY(center[1])) * worldSize),
  };
}

test("queries labels and points within the selection tolerance", ({ isMobile }) => {
  test.skip(isMobile, "The hit-test contract is viewport-independent");
  let queryGeometry: unknown;
  let queryLayers: unknown;
  const map = {
    getLayer: () => ({}),
    queryRenderedFeatures: (geometry: unknown, options: { layers: string[] }) => {
      queryGeometry = geometry;
      queryLayers = options.layers;
      return [
        { properties: { id: "yingtian-prefecture", regionId: "nanjing" } },
        { properties: { id: "yingtian-prefecture", regionId: "nanjing" } },
        { properties: {
          id: "shangyuan-county",
          kind: "county",
          parentId: "yingtian-prefecture",
          regionId: "nanjing",
        } },
      ];
    },
  } as unknown as Map;

  expect(queryAdministrativeTargets(map, [100, 80])).toEqual([
    { kind: "seat", id: "yingtian-prefecture", regionId: "nanjing" },
    { kind: "county", id: "shangyuan-county",
      parentId: "yingtian-prefecture", regionId: "nanjing" },
  ]);
  expect(queryGeometry).toEqual([
    [100 - selectionHitRadius, 80 - selectionHitRadius],
    [100 + selectionHitRadius, 80 + selectionHitRadius],
  ]);
  expect(queryLayers).toEqual([
    "county-labels",
    "county-points",
    "seat-labels",
    "seat-points",
  ]);
});

test("keeps the final scope after rapid switching and resolves co-located targets", async ({ page, isMobile }) => {
  test.skip(isMobile, "County scope rendering is covered once on desktop");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await prepareMap(page);
  const canvas = page.locator(".maplibregl-canvas");
  const seatScope = page.getByRole("button", { name: "总览" });
  const prefectureScope = page.getByRole("button", { name: "本级" });
  const regionScope = page.getByRole("button", { name: "全域" });

  await regionScope.click();
  await page.getByRole("textbox", { name: "搜索历史地名" }).fill("应天府");
  await page.getByRole("button", { name: "应天府 南京城", exact: true }).click();
  await page.waitForTimeout(700);
  const regionView = await canvas.screenshot();

  await seatScope.click();
  await expect(page.getByText("总览视图不显示下辖单位")).toBeVisible();
  await expect.poll(async () => (await canvas.screenshot()).equals(regionView)).toBe(false);
  await prefectureScope.click();
  await expect(page.getByRole("button", { name: "上元县" })).toBeVisible();

  await seatScope.click();
  await prefectureScope.click();
  await regionScope.click();
  await expect(regionScope).toHaveAttribute("aria-pressed", "true");
  await page.waitForTimeout(300);
  const suzhou = await mapPoint(page, [120.61862, 31.31271], [118.76899, 32.05256], 6.2);
  await page.mouse.click(suzhou.x, suzhou.y);
  const chooser = page.getByRole("dialog", { name: "选择共址单位" });
  await expect(chooser).toBeVisible();
  await chooser.getByRole("button", { name: "吴县 苏州府", exact: true }).click();
  await expect(page.getByRole("heading", { name: "吴县" })).toBeVisible();
});

test("clears a selection after a focused control blurs on pointer down", async ({ page, isMobile }) => {
  test.skip(isMobile, "Mouse gesture handling is covered once on desktop");
  await prepareMap(page);
  const search = page.getByRole("textbox", { name: "搜索历史地名" });
  await search.fill("句容县");
  await page.getByRole("button", { name: /句容县/ }).click();
  await expect(page.getByRole("heading", { name: "句容县" })).toBeVisible();
  await page.getByRole("button", { name: "府州治所" }).click();
  await page.waitForTimeout(700);
  const blank = await mapPoint(page, [116.5, 33], [119.16821, 31.94462], 6.2);

  await page.mouse.move(blank.x, blank.y);
  await page.mouse.down();
  await page.mouse.move(blank.x + 5, blank.y);
  await page.mouse.up();
  await expect(page.getByRole("heading", { name: "句容县" })).toHaveCount(0);

  await search.fill("句容县");
  await page.getByRole("button", { name: /句容县/ }).click();
  await page.mouse.move(blank.x, blank.y);
  await page.mouse.down();
  await page.mouse.move(blank.x + 12, blank.y);
  await page.mouse.up();
  await expect(page.getByRole("heading", { name: "句容县" })).toBeVisible();
});
