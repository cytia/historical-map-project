const palette = {
  paper: "#e8e1d3",
  paperLight: "#f6f1e7",
  ink: "#282721",
  mutedInk: "#736f65",
  cinnabar: "#7a3027",
  water: "#9aaeb0",
  deepWater: "#84999d",
  vegetation: "#b8bea9",
  lowland: "#cdd0bc",
  relief: "#756b5b",
} as const;

export const defaultTheme = {
  ui: {
    "--color-page": palette.paper,
    "--color-panel": "rgba(246, 241, 231, 0.92)",
    "--color-panel-solid": palette.paperLight,
    "--color-panel-mobile": "rgba(246, 241, 231, 0.96)",
    "--color-text": palette.ink,
    "--color-text-muted": palette.mutedInk,
    "--color-border": "rgba(54, 49, 40, 0.18)",
    "--color-separator": "rgba(54, 49, 40, 0.1)",
    "--color-accent": palette.cinnabar,
    "--color-accent-contrast": "#f5eee0",
    "--color-accent-focus": "rgba(122, 48, 39, 0.58)",
    "--color-accent-soft": "rgba(122, 48, 39, 0.055)",
    "--color-accent-hover": "rgba(122, 48, 39, 0.08)",
    "--color-input": "rgba(255, 255, 255, 0.34)",
    "--color-disabled-text": "#a7a195",
    "--color-disabled-mark": "#c9c2b5",
    "--color-confidence": "#b3873e",
    "--color-track": "rgba(54, 49, 40, 0.35)",
    "--color-marker-ring": "#f4eee2",
    "--color-map-note": "rgba(40, 39, 33, 0.6)",
    "--color-paper-texture": "rgba(71, 61, 45, 0.055)",
  },
  map: {
    land: palette.paper,
    water: palette.water,
    waterway: palette.deepWater,
    vegetation: palette.vegetation,
    lowland: palette.lowland,
    relief: palette.relief,
    reliefHalo: palette.paperLight,
    seat: palette.cinnabar,
    seatHalo: "rgba(122, 48, 39, 0.11)",
    seatHaloStroke: "rgba(122, 48, 39, 0.18)",
    seatRing: "#f4eee2",
    seatLabel: palette.ink,
  },
} as const;

export function applyTheme(root: HTMLElement, theme = defaultTheme) {
  Object.entries(theme.ui).forEach(([token, value]) => {
    root.style.setProperty(token, value);
  });
}
