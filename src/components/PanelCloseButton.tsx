import { forwardRef } from "react";
import { Button } from "./Button";

interface PanelCloseButtonProps {
  label: string;
  onClick: () => void;
}

export const PanelCloseButton = forwardRef<HTMLButtonElement, PanelCloseButtonProps>(
  function PanelCloseButton({ label, onClick }, ref) {
    return (
      <Button
        ref={ref}
        variant="icon"
        className="panel-close"
        aria-label={label}
        onClick={onClick}
      >
        ×
      </Button>
    );
  },
);
