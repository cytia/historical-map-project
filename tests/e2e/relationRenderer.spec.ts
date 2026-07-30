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

test("uses the administrative relation style for reusable renderers", async ({ page }) => {
  await page.route("https://tiles.openfreemap.org/styles/positron", (route) =>
    route.fulfill({ json: referenceStyle }),
  );
  await page.goto("/");

  const result = await page.evaluate(async () => {
    const [{ createRelationRenderer }, { defaultTheme }] = await Promise.all([
      import("/src/relationRenderer.ts"),
      import("/src/theme.ts"),
    ]);
    const sources = new Map<string, { setData: (data: unknown) => void }>();
    const layers = new Map<string, { paint?: Record<string, unknown> }>();
    const map = {
      addSource: (id: string) => sources.set(id, { setData: () => undefined }),
      getSource: (id: string) => sources.get(id),
      addLayer: (layer: { id: string; paint?: Record<string, unknown> }) =>
        layers.set(layer.id, layer),
    };
    const renderer = createRelationRenderer({
      relationSourceId: "relations",
      flowSourceId: "flow",
      pulseSourceId: "pulse-point",
      relationLayerId: "relation-layer",
      flowLayerId: "flow-layer",
      pulseLayerId: "pulse-layer",
    });
    renderer.add(map as never, {
      relations: { type: "FeatureCollection", features: [] },
      pulsePoint: { type: "FeatureCollection", features: [] },
    });
    return {
      relation: layers.get("relation-layer")?.paint,
      flow: layers.get("flow-layer")?.paint,
      pulse: layers.get("pulse-layer")?.paint,
      tokens: defaultTheme.map,
    };
  });

  expect(result.relation?.["line-color"]).toEqual([
    "case",
    ["get", "selected"],
    result.tokens.relationLineSelected,
    result.tokens.relationLine,
  ]);
  expect(result.relation?.["line-width"]).toEqual([
    "case",
    ["get", "selected"],
    result.tokens.relationLineSelectedWidth,
    result.tokens.relationLineWidth,
  ]);
  expect(result.flow?.["line-color"]).toBe(result.tokens.relationFlow);
  expect(result.flow?.["line-width"]).toBe(result.tokens.relationFlowWidth);
  expect(result.pulse?.["circle-stroke-color"]).toBe(result.tokens.relationCapitalPulse);
});
