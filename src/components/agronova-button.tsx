import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "icon";
};

export function AgroButton({
  children,
  className = "",
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: Props) {
  const variants = {
    primary: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    ghost: "bg-card text-foreground",
  };
  const sizes = {
    sm: "min-h-10 px-4 py-2 text-sm",
    md: "min-h-12 px-5 py-3 text-sm",
    icon: "h-11 w-11 p-0",
  };

  return (
    <button
      type={type}
      className={`clay-btn inline-flex shrink-0 items-center justify-center gap-2 font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
