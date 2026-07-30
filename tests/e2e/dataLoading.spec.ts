import { expect, test } from "@playwright/test";

function includesAsset(url: string, developmentPath: string, productionPrefix: string) {
  return url.includes(developmentPath) || url.includes(`/assets/${productionPrefix}-`);
}

test("loads split historical data without requesting a full aggregate", async ({ page, isMobile }) => {
  test.skip(isMobile, "Desktop coverage is sufficient for the shared data repository");
  const fetches: string[] = [];
  page.on("request", (request) => {
    if (request.resourceType() === "fetch") fetches.push(request.url());
  });

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "明代历史地图" })).toBeVisible();
  await expect(page.getByText("两京十三布政司", { exact: true })).toBeVisible();
  await expect.poll(() => fetches.some((url) =>
    includesAsset(url, "runtime-index.json", "runtime-index"))).toBe(true);
  await expect.poll(() => fetches.some((url) =>
    includesAsset(url, "/statistics/scope.json", "scope"))).toBe(true);
  expect(fetches.some((url) => url.includes("project-data.json"))).toBe(false);
  expect(fetches.some((url) =>
    includesAsset(url, "/catalog/sources.json", "sources"))).toBe(false);

  await page.getByRole("textbox", { name: "搜索历史地名" }).fill("贵州都司");
  await page.getByRole("button", { name: /贵州都司/ }).click();
  await expect(page.locator(".left-panel").getByRole("heading", {
    name: "贵州都指挥使司",
  })).toBeVisible();
  await expect.poll(() => fetches.some((url) =>
    includesAsset(url, "/statistics/military.json", "military"))).toBe(true);
  await expect.poll(() => fetches.some((url) =>
    includesAsset(url, "/catalog/sources.json", "sources"))).toBe(true);
  expect(fetches.some((url) => url.includes("project-data.json"))).toBe(false);
});
