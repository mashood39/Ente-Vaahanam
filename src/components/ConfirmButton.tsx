"use client";

import { ReactNode } from "react";

export default function ConfirmButton({
  confirmMessage,
  children,
  className,
  type = "submit",
}: {
  confirmMessage: string;
  children: ReactNode;
  className?: string;
  type?: "submit" | "button";
}) {
  return (
    <button
      type={type}
      className={className}
      onClick={(e) => {
        if (!window.confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
    >
      {children}
    </button>
  );
}

