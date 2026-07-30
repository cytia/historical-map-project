import { expect, test } from "@playwright/test";

test("groups national administrative and military information into reusable disclosures", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "Desktop coverage is sufficient for the shared overview structure");
  await page.goto("/");

  const panel = page.locator(".left-panel");
  const administrative = panel.locator("details").filter({
    has: page.getByRole("heading", { name: "两京十三布政司" }),
  }).first();
  const military = panel.locator("details").filter({
    has: page.getByRole("heading", { name: "五军都督府" }),
  }).first();

  await expect(administrative).toHaveAttribute("open", "");
  await expect(administrative).toContainText("户口登记");
  await expect(administrative).toContainText("赋税原额");
  await expect(military).not.toHaveAttribute("open", "");
  await military.locator(":scope > summary").click();

  const expectedGroups = [
    ["中军都督府", "2 处"],
    ["左军都督府", "3 处"],
    ["右军都督府", "7 处"],
    ["前军都督府", "7 处"],
    ["后军都督府", "4 处"],
  ] as const;
  for (const [name, count] of expectedGroups) {
    const group = military.locator("details").filter({ hasText: name }).first();
    await expect(group.locator(":scope > summary")).toContainText(count);
  }

  const central = military.locator("details").filter({ hasText: "中军都督府" }).first();
  await central.locator(":scope > summary").click();
  await expect(central.getByRole("button", { name: "河南都司" })).toBeVisible();
  await expect(panel.locator(".scope-details")).toContainText(
    "军事总览只列五军都督府及所属都司级单位",
  );
});
