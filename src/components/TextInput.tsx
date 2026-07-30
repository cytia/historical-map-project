import {
  forwardRef,
  type InputHTMLAttributes,
} from "react";

type TextInputProps = InputHTMLAttributes<HTMLInputElement>;

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { className, type = "text", ...props },
  ref,
) {
  const classes = ["ui-text-input", className].filter(Boolean).join(" ");
  return <input ref={ref} type={type} className={classes} {...props} />;
});
