import { expect, test } from "@playwright/test";

const referenceStyle = {
  version: 8,
  sources: {},
  layers: [{
    id: "reference-background",
    type: "background",
    paint: { "background-color": "#ffffff" },
  }],
};

test.beforeEach(async ({ page }) => {
  await page.route("https://tiles.openfreemap.org/styles/positron", (route) =>
    route.fulfill({ json: referenceStyle }),
  );
  await page.goto("/");
});

test("closes a tooltip when the pointer leaves a clicked button", async ({ page }) => {
  for (const name of ["府级关系", "山川地貌"]) {
    const button = page.getByRole("button", { name });
    await button.hover();
    await expect(page.getByRole("tooltip")).toBeVisible();

    await button.click();
    await page.mouse.move(640, 500);

    await expect(button).toBeFocused();
    await expect(page.getByRole("tooltip")).toHaveCount(0);
  }
});

test("keeps a tooltip while its trigger has keyboard focus", async ({ page }) => {
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");

  const button = page.getByRole("button", { name: "府州治所" });
  await expect(button).toBeFocused();
  await expect(page.getByRole("tooltip")).toHaveText("府州治所");

  await page.mouse.move(640, 500);
  await expect(page.getByRole("tooltip")).toHaveText("府州治所");

  await page.keyboard.press("Tab");
  await expect(page.getByText("府州治所", { exact: true })).toHaveCount(0);
});
