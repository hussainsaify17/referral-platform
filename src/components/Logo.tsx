import React from "react";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export function Logo({ size = 32, ...props }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      {...props}
    >
      <defs>
        <linearGradient id="logo-grad-inline" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00f0ff" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <g
        fill="none"
        stroke="url(#logo-grad-inline)"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Top hook of the R */}
        <path d="M 35 32 H 60 C 71 32 71 54 60 54 H 56" />
        {/* Bottom-left leg of the R */}
        <path d="M 45 48 C 38 52 35 60 35 72" />
        {/* Bottom-right leg of the R */}
        <path d="M 50 52 L 68 74" />
      </g>
    </svg>
  );
}
