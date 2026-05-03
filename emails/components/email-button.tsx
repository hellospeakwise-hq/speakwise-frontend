import { Button } from "@react-email/components";
import * as React from "react";
import { brand } from "./email-layout";

interface EmailButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "success" | "ghost";
}

const variantStyles: Record<string, React.CSSProperties> = {
  primary: {
    backgroundColor: brand.blue,
    color: brand.white,
    border: "none",
  },
  secondary: {
    backgroundColor: brand.dark,
    color: brand.white,
    border: "none",
  },
  success: {
    backgroundColor: brand.success,
    color: brand.white,
    border: "none",
  },
  ghost: {
    backgroundColor: "transparent",
    color: brand.blue,
    border: `2px solid ${brand.blue}`,
  },
};

export function EmailButton({
  href,
  children,
  variant = "primary",
}: EmailButtonProps) {
  return (
    <Button
      href={href}
      style={{
        ...variantStyles[variant],
        borderRadius: "50px",
        display: "inline-block",
        fontSize: "15px",
        fontWeight: "700",
        letterSpacing: "0.01em",
        padding: "14px 36px",
        textDecoration: "none",
        cursor: "pointer",
      }}
    >
      {children}
    </Button>
  );
}
