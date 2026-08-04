import type { ExpressionSpecification, Map } from "maplibre-gl";

export const jimiMilitarySymbolImageId = "jimi-military-triangle";
export const jimiNativeOfficeSymbolImageId = "jimi-native-office-diamond";

function pointIconSize(selectedJimiId: string | null, normal: number, selected: number) {
  const isSelected = ["==", ["get", "id"], selectedJimiId ?? ""];
  return ["interpolate", ["linear"], ["zoom"],
    4, ["case", isSelected, selected, normal * 0.82],
    8, ["case", isSelected, selected * 1.28, normal],
  ] as unknown as ExpressionSpecification;
}

export function jimiPointIconSizes(selectedJimiId: string | null) {
  return {
    outline: pointIconSize(selectedJimiId, 0.34, 0.44),
    fill: pointIconSize(selectedJimiId, 0.25, 0.34),
  };
}

function createShapeImage(shape: "triangle" | "diamond") {
  const size = 32;
  const inset = 3;
  const center = size / 2;
  const context = document.createElement("canvas").getContext("2d");
  if (!context) throw new Error("Unable to create the jimi marker canvas");
  context.canvas.width = size;
  context.canvas.height = size;
  context.fillStyle = "#fff";
  context.beginPath();
  if (shape === "triangle") {
    context.moveTo(center, inset);
    context.lineTo(size - inset, size - inset);
    context.lineTo(inset, size - inset);
  } else {
    context.moveTo(center, inset);
    context.lineTo(size - inset, center);
    context.lineTo(center, size - inset);
    context.lineTo(inset, center);
  }
  context.closePath();
  context.fill();
  const imageData = context.getImageData(0, 0, size, size);
  return { width: size, height: size, data: new Uint8Array(imageData.data) };
}

export function ensureJimiSymbolImages(map: Map) {
  if (!map.hasImage(jimiMilitarySymbolImageId)) {
    map.addImage(jimiMilitarySymbolImageId, createShapeImage("triangle"), { sdf: true });
  }
  if (!map.hasImage(jimiNativeOfficeSymbolImageId)) {
    map.addImage(jimiNativeOfficeSymbolImageId, createShapeImage("diamond"), { sdf: true });
  }
}
