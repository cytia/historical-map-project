import type { ReactNode } from "react";
import { Tooltip } from "./Tooltip";

interface FootnoteProps {
  marker: ReactNode;
  content: ReactNode;
  label?: string;
}

export function Footnote({ marker, content, label }: FootnoteProps) {
  return (
    <Tooltip content={content}>
      <sup className="ui-footnote" tabIndex={0} aria-label={label}>{marker}</sup>
    </Tooltip>
  );
}
