import type { ExpressionSpecification, Map } from "maplibre-gl";

export const jimiNativeOfficeSymbolImageId = "jimi-native-office-diamond";

interface IconSizeProfile {
  normal: number;
  selected: number;
}

function pointIconSize(
  selectedJimiId: string | null,
  nativeOffice: IconSizeProfile,
  militaryInstitution: IconSizeProfile,
) {
  const isSelected = ["==", ["get", "id"], selectedJimiId ?? ""];
  return ["interpolate", ["linear"], ["zoom"],
    4, ["case",
      ["==", ["get", "jimiKind"], "military-institution"],
      ["case", isSelected, militaryInstitution.selected, militaryInstitution.normal * 0.82],
      ["case", isSelected, nativeOffice.selected, nativeOffice.normal * 0.82],
    ],
    8, ["case",
      ["==", ["get", "jimiKind"], "military-institution"],
      ["case", isSelected, militaryInstitution.selected * 1.28, militaryInstitution.normal],
      ["case", isSelected, nativeOffice.selected * 1.28, nativeOffice.normal],
    ],
  ] as unknown as ExpressionSpecification;
}

export function jimiPointIconSizes(selectedJimiId: string | null) {
  return {
    outline: pointIconSize(selectedJimiId,
      { normal: 0.34, selected: 0.44 },
      { normal: 0.42, selected: 0.54 }),
    fill: pointIconSize(selectedJimiId,
      { normal: 0.25, selected: 0.34 },
      { normal: 0.31, selected: 0.42 }),
  };
}

function createShapeImage() {
  const size = 32;
  const inset = 3;
  const center = size / 2;
  const context = document.createElement("canvas").getContext("2d");
  if (!context) throw new Error("Unable to create the jimi marker canvas");
  context.canvas.width = size;
  context.canvas.height = size;
  context.fillStyle = "#fff";
  context.beginPath();
  context.moveTo(center, inset);
  context.lineTo(size - inset, center);
  context.lineTo(center, size - inset);
  context.lineTo(inset, center);
  context.closePath();
  context.fill();
  const imageData = context.getImageData(0, 0, size, size);
  return { width: size, height: size, data: new Uint8Array(imageData.data) };
}

export function ensureJimiSymbolImages(map: Map) {
  if (!map.hasImage(jimiNativeOfficeSymbolImageId)) {
    map.addImage(jimiNativeOfficeSymbolImageId, createShapeImage(), { sdf: true });
  }
}
