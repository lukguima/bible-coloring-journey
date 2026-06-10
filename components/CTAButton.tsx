"use client";

import Link from "next/link";
import { ReactNode } from "react";

interface CTAButtonProps {
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline" | "gold";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}

const styles = {
  primary: {
    backgroundColor: "#C76F4A",
    color: "#FFFFFF",
    border: "2px solid #C76F4A",
  },
  secondary: {
    backgroundColor: "#263B5E",
    color: "#FFFFFF",
    border: "2px solid #263B5E",
  },
  outline: {
    backgroundColor: "transparent",
    color: "#263B5E",
    border: "2px solid #263B5E",
  },
  gold: {
    backgroundColor: "#D8B76A",
    color: "#263B5E",
    border: "2px solid #D8B76A",
  },
};

const sizes = {
  sm: { padding: "8px 16px", fontSize: "13px", borderRadius: "20px" },
  md: { padding: "12px 24px", fontSize: "15px", borderRadius: "28px" },
  lg: { padding: "14px 32px", fontSize: "17px", borderRadius: "32px" },
};

export default function CTAButton({
  href,
  onClick,
  variant = "primary",
  size = "md",
  children,
  className,
  type = "button",
  disabled,
}: CTAButtonProps) {
  const style = {
    ...styles[variant],
    ...sizes[size],
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontWeight: 700,
    fontFamily: "'Nunito', system-ui, sans-serif",
    textDecoration: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
    transition: "transform 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease",
  };

  if (href) {
    return (
      <Link href={href} style={style as React.CSSProperties}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} style={style as React.CSSProperties}>
      {children}
    </button>
  );
}
