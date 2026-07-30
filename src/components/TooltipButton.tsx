import type { ReactNode } from "react";
import { Button, type ButtonProps } from "./Button";
import { Tooltip } from "./Tooltip";

interface TooltipButtonProps extends ButtonProps {
  tooltip: ReactNode;
}

export function TooltipButton({ tooltip, ...buttonProps }: TooltipButtonProps) {
  return (
    <Tooltip content={tooltip}>
      <Button {...buttonProps} />
    </Tooltip>
  );
}
