import {
  forwardRef,
  type ButtonHTMLAttributes,
} from "react";

export type ButtonVariant =
  | "plain"
  | "toolbar"
  | "action"
  | "primary-action"
  | "choice"
  | "text"
  | "icon"
  | "menu"
  | "outline"
  | "backdrop";

export type ButtonSize = "small" | "medium";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  plain: "",
  toolbar: "ui-toolbar-button",
  action: "ui-action",
  "primary-action": "ui-action ui-action--primary",
  choice: "ui-choice-button",
  text: "ui-text-button",
  icon: "ui-icon-button",
  menu: "ui-menu-button",
  outline: "ui-outline-button",
  backdrop: "ui-backdrop-button",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "plain", size, type = "button", className, ...props },
  ref,
) {
  const classes = [
    "ui-button",
    variantClasses[variant],
    size ? `ui-button--${size}` : "",
    className,
  ].filter(Boolean).join(" ");

  return <button ref={ref} type={type} className={classes} {...props} />;
});
