import { useEffect } from "react";
import { counties, seats } from "./data";
import type { AdministrativeTarget } from "./mapSelectionInteraction";

interface AdministrativeTargetChooserProps {
  anchor: { x: number; y: number };
  targets: AdministrativeTarget[];
  onClose: () => void;
  onSelect: (target: AdministrativeTarget) => void;
}

function targetDetails(target: AdministrativeTarget) {
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

  const height = 42 + targets.length * 38;
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
        <button type="button" onClick={onClose} aria-label="关闭共址单位选择">×</button>
      </div>
      {targets.map((target, index) => {
        const details = targetDetails(target);
        return (
          <button type="button" key={`${target.kind}-${target.id}`} autoFocus={index === 0}
            onClick={() => onSelect(target)}>
            <strong>{details.name}</strong>
            <small>{details.context}</small>
          </button>
        );
      })}
    </div>
  );
}
