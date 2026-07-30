import { useEffect } from "react";
import { Button } from "./components/Button";
import { counties, seats } from "./data";
import { militaryById } from "./militaryData";
import type { MapTarget } from "./mapSelectionInteraction";
import { Scrollbar } from "./Scrollbar";

const visibleTargetLimit = 8;
const targetRowHeight = 38;

interface AdministrativeTargetChooserProps {
  anchor: { x: number; y: number };
  targets: MapTarget[];
  onClose: () => void;
  onSelect: (target: MapTarget) => void;
}

function targetDetails(target: MapTarget) {
  if (target.kind === "military") {
    const military = militaryById.get(target.id);
    return { name: military?.unit.name ?? target.id, context: "军事单位" };
  }
  if (target.kind === "county") {
    const county = counties.find(({ unit }) => unit.id === target.id);
    return {
      name: county?.unit.name ?? target.id,
      context: county?.parent.name ?? "县",
    };
  }
  const seat = seats.find(({ unit }) => unit.id === target.id);
  const level = seat?.unit.level === "prefecture" ? "府" : "州";
  return { name: seat?.unit.name ?? target.id, context: level };
}

export function AdministrativeTargetChooser({
  anchor,
  targets,
  onClose,
  onSelect,
}: AdministrativeTargetChooserProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const height = 42 + Math.min(targets.length, visibleTargetLimit) * targetRowHeight;
  const left = Math.max(10, Math.min(anchor.x + 10, window.innerWidth - 230));
  const top = Math.max(10, Math.min(anchor.y + 10, window.innerHeight - height - 10));

  return (
    <div
      className="administrative-target-chooser"
      role="dialog"
      aria-label="选择共址单位"
      style={{ left, top }}
    >
      <div className="administrative-target-chooser-heading">
        <span>共址单位</span>
        <Button variant="icon" onClick={onClose} aria-label="关闭共址单位选择">×</Button>
      </div>
      <Scrollbar className="administrative-target-list">
        {targets.map((target, index) => {
          const details = targetDetails(target);
          return (
            <Button variant="menu" key={`${target.kind}-${target.id}`} autoFocus={index === 0}
              onClick={() => onSelect(target)}>
              <strong>{details.name}</strong>
              <small>{details.context}</small>
            </Button>
          );
        })}
      </Scrollbar>
    </div>
  );
}
