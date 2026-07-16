import { createPortal } from "react-dom";
import {
  cloneElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
} from "react";

type TooltipProps = {
  content: ReactNode;
  children: ReactElement<{ "aria-describedby"?: string }>;
};

type TooltipPosition = {
  top: number;
  left: number;
  placement: "top" | "bottom";
  arrowLeft: number;
};

const VIEWPORT_PADDING = 12;
const TRIGGER_GAP = 8;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function Tooltip({ content, children }: TooltipProps) {
  const tooltipId = useId();
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<TooltipPosition>();
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current?.firstElementChild ?? triggerRef.current;
    const tooltip = tooltipRef.current;
    if (!(trigger instanceof HTMLElement) || !tooltip) return;

    const triggerRect = trigger.getBoundingClientRect();
    const tooltipWidth = tooltip.offsetWidth || Math.min(320, window.innerWidth - 24);
    const tooltipHeight = tooltip.offsetHeight || 60;
    const maxLeft = Math.max(VIEWPORT_PADDING, window.innerWidth - tooltipWidth - VIEWPORT_PADDING);
    const left = clamp(
      triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2,
      VIEWPORT_PADDING,
      maxLeft,
    );
    const bottomTop = triggerRect.bottom + TRIGGER_GAP;
    const topTop = triggerRect.top - TRIGGER_GAP - tooltipHeight;
    const fitsBottom = bottomTop + tooltipHeight <= window.innerHeight - VIEWPORT_PADDING;
    const fitsTop = topTop >= VIEWPORT_PADDING;
    const placement = fitsBottom || !fitsTop ? "bottom" : "top";
    const top = placement === "bottom" ? bottomTop : topTop;
    const triggerCenter = triggerRect.left + triggerRect.width / 2;

    setPosition({
      top,
      left,
      placement,
      arrowLeft: clamp(triggerCenter - left, 10, tooltipWidth - 10),
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setPosition(undefined);
      return undefined;
    }
    updatePosition();
    const frame = requestAnimationFrame(updatePosition);
    return () => cancelAnimationFrame(frame);
  }, [open, content, updatePosition]);

  useEffect(() => {
    if (!open) return undefined;
    const update = () => updatePosition();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const closeOnOutsidePointer = (event: globalThis.PointerEvent) => {
      if (!(event.target instanceof Node)) return;
      if (!triggerRef.current?.contains(event.target) && !tooltipRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
    };
  }, [open, updatePosition]);

  const show = () => setOpen(true);
  const hideUnlessFocused = () => {
    const activeElement = document.activeElement;
    const hasKeyboardFocus = activeElement instanceof HTMLElement &&
      triggerRef.current?.contains(activeElement) &&
      activeElement.matches(":focus-visible");
    if (!hasKeyboardFocus) setOpen(false);
  };
  const handlePointerEnter = (event: PointerEvent<HTMLSpanElement>) => {
    if (event.pointerType !== "touch") show();
  };
  const handlePointerLeave = (event: PointerEvent<HTMLSpanElement>) => {
    if (event.pointerType !== "touch") hideUnlessFocused();
  };
  const handlePointerDown = (event: PointerEvent<HTMLSpanElement>) => {
    if (event.pointerType === "touch") setOpen((current) => !current);
  };

  const describedBy = children.props["aria-describedby"];
  const trigger = cloneElement(children, {
    "aria-describedby": open
      ? [describedBy, tooltipId].filter(Boolean).join(" ")
      : describedBy,
  });
  const tooltipStyle = {
    top: position?.top ?? -9999,
    left: position?.left ?? 0,
    visibility: position ? "visible" : "hidden",
    "--tooltip-arrow-left": `${position?.arrowLeft ?? 50}px`,
  } as CSSProperties;

  return (
    <>
      <span
        ref={triggerRef}
        className="tooltip-trigger"
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        onFocusCapture={show}
        onBlurCapture={(event) => {
          if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) {
            hideUnlessFocused();
          }
        }}
      >
        {trigger}
      </span>
      {open && createPortal(
        <div
          ref={tooltipRef}
          id={tooltipId}
          className="app-tooltip"
          data-placement={position?.placement ?? "bottom"}
          role="tooltip"
          style={tooltipStyle}
        >
          {content}
        </div>,
        document.body,
      )}
    </>
  );
}
