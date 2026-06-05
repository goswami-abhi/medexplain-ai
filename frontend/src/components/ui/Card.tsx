import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
}

export function Card({ children, className = "", hover, ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card ${hover ? "transition-shadow duration-200 hover:shadow-lift" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
