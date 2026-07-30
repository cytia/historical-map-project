import type { AnchorHTMLAttributes } from "react";

interface ExternalLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  emphasis?: boolean;
}

export function ExternalLink({
  emphasis = false,
  className,
  target = "_blank",
  rel = "noopener noreferrer",
  ...props
}: ExternalLinkProps) {
  const classes = [
    "ui-action",
    emphasis ? "ui-action--primary" : "",
    className,
  ].filter(Boolean).join(" ");
  return <a className={classes} target={target} rel={rel} {...props} />;
}
