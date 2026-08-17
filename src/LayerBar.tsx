import { TooltipButton } from "./components/TooltipButton";
import { mapDisplayModes, militaryColorModes } from "./mapDisplay";
import { militaryTrialPublished } from "./militaryData";
import { useAppStore } from "./store";

const colorOptions = [
  ...mapDisplayModes.slice(0, 1).map((mode) => ({ ...mode, type: "map" as const })),
  ...militaryColorModes.map((mode) => ({
    ...mode,
    available: militaryTrialPublished,
    type: "military" as const,
  })),
  ...mapDisplayModes.slice(1).map((mode) => ({ ...mode, type: "map" as const })),
];

export function LayerBar() {
  const seatsVisible = useAppStore((state) => state.seatsVisible);
  const militaryVisible = useAppStore((state) => state.militaryVisible);
  const jimiVisible = useAppStore((state) => state.jimiVisible);
  const boundariesVisible = useAppStore((state) => state.boundariesVisible);
  const mapDisplayMode = useAppStore((state) => state.mapDisplayMode);
  const militaryColorMode = useAppStore((state) => state.militaryColorMode);
  const setSeatsVisible = useAppStore((state) => state.setSeatsVisible);
  const setMilitaryVisible = useAppStore((state) => state.setMilitaryVisible);
  const setJimiVisible = useAppStore((state) => state.setJimiVisible);
  const setBoundariesVisible = useAppStore((state) => state.setBoundariesVisible);
  const setMapDisplayMode = useAppStore((state) => state.setMapDisplayMode);
  const setMilitaryColorMode = useAppStore((state) => state.setMilitaryColorMode);
  const chooseMapDisplayMode = (mode: (typeof mapDisplayModes)[number]["id"]) => {
    setMapDisplayMode(mode);
    if (mode === "administrative") setMilitaryColorMode("administrative");
  };
  const chooseColorMode = (option: (typeof colorOptions)[number]) => {
    if (option.type === "military") {
      setMilitaryColorMode(militaryColorMode === option.id ? "administrative" : option.id);
      return;
    }
    chooseMapDisplayMode(option.id);
  };

  return (
    <nav className="layer-bar" aria-label="地图视图与图层">
      <span className="layer-bar-label" aria-hidden="true">图层</span>
      <TooltipButton
        variant="toolbar"
        tooltip="府州治所"
        aria-label="府州治所"
        aria-pressed={seatsVisible}
        onClick={() => setSeatsVisible(!seatsVisible)}
      >
        州府
      </TooltipButton>
      <TooltipButton
        variant="toolbar"
        tooltip="都司、卫所军事点位"
        aria-label="都司"
        aria-pressed={militaryTrialPublished && militaryVisible}
        disabled={!militaryTrialPublished}
        onClick={() => setMilitaryVisible(!militaryVisible)}
      >
        都司
      </TooltipButton>
      <TooltipButton
        variant="toolbar"
        tooltip="羁縻军事机构与土司／土官衙门"
        aria-label="羁縻关系"
        aria-pressed={jimiVisible}
        onClick={() => setJimiVisible(!jimiVisible)}
      >
        羁縻
      </TooltipButton>
      <TooltipButton
        variant="toolbar"
        tooltip="省级行政疆界（基于现代省界的未修正基线）"
        aria-label="行政边界"
        aria-pressed={boundariesVisible}
        onClick={() => setBoundariesVisible(!boundariesVisible)}
      >
        边界
      </TooltipButton>
      <span className="layer-bar-divider" aria-hidden="true" />
      <span className="layer-bar-label layer-bar-label-secondary" aria-hidden="true">着色</span>
      {colorOptions.map((option) => (
        <TooltipButton
          key={option.id}
          variant="toolbar"
          tooltip={option.description}
          aria-label={`${option.label}着色视图`}
          aria-pressed={option.type === "military"
            ? militaryTrialPublished && militaryColorMode === option.id
            : mapDisplayMode === option.id}
          disabled={!option.available}
          onClick={() => chooseColorMode(option)}
        >
          {option.label}
        </TooltipButton>
      ))}
    </nav>
  );
}
