import type {
  DetailsHTMLAttributes,
  ReactNode,
} from "react";

interface DisclosureProps extends DetailsHTMLAttributes<HTMLDetailsElement> {
  summary: ReactNode;
  summaryClassName?: string;
}

export function Disclosure({
  summary,
  summaryClassName,
  children,
  ...props
}: DisclosureProps) {
  return (
    <details {...props}>
      <summary className={summaryClassName}>{summary}</summary>
      {children}
    </details>
  );
}
