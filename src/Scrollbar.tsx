import type { HTMLAttributes, ReactNode } from "react";

type ScrollbarProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function Scrollbar({ children, className, ...props }: ScrollbarProps) {
  const classes = ["panel-scrollbar", className].filter(Boolean).join(" ");
  return <div {...props} className={classes}>{children}</div>;
}
