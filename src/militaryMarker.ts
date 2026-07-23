import type { ExpressionSpecification, Map } from "maplibre-gl";

export const militarySymbolImageId = "military-rounded-square";

export function pointIconSize(
  selectedMilitaryId: string | null,
  normalStartSize: number,
  normalEndSize: number,
  selectedStartSize: number,
  selectedEndSize: number,
): ExpressionSpecification {
  const selected = ["==", ["get", "id"], selectedMilitaryId ?? ""];
  return ["interpolate", ["linear"], ["zoom"],
    4, ["case", selected, selectedStartSize, normalStartSize],
    8, ["case", selected, selectedEndSize, normalEndSize],
  ] as unknown as ExpressionSpecification;
}

export function militaryPointIconSizes(selectedMilitaryId: string | null) {
  return {
    outline: pointIconSize(selectedMilitaryId, 0.24, 0.32, 0.32, 0.43),
    fill: pointIconSize(selectedMilitaryId, 0.18, 0.25, 0.25, 0.34),
  };
}

function createMilitarySymbolImage() {
  const size = 32;
  const inset = 2;
  const radius = 5;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Unable to create the military marker canvas");
  context.fillStyle = "#fff";
  context.beginPath();
  context.moveTo(inset + radius, inset);
  context.lineTo(size - inset - radius, inset);
  context.arcTo(size - inset, inset, size - inset, inset + radius, radius);
  context.lineTo(size - inset, size - inset - radius);
  context.arcTo(size - inset, size - inset, size - inset - radius, size - inset, radius);
  context.lineTo(inset + radius, size - inset);
  context.arcTo(inset, size - inset, inset, size - inset - radius, radius);
  context.lineTo(inset, inset + radius);
  context.arcTo(inset, inset, inset + radius, inset, radius);
  context.closePath();
  context.fill();
  const imageData = context.getImageData(0, 0, size, size);
  return { width: size, height: size, data: new Uint8Array(imageData.data) };
}

export function ensureMilitarySymbolImage(map: Map) {
  if (!map.hasImage(militarySymbolImageId)) {
    map.addImage(militarySymbolImageId, createMilitarySymbolImage(), { sdf: true });
  }
}
