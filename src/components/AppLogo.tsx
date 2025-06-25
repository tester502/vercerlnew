
import type { SVGProps } from 'react';

export function AppLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      width="120"
      height="30"
      aria-label="AutoTube AI Logo"
      {...props}
    >
      <rect width="200" height="50" rx="5" fill="hsl(var(--primary))" />
      <text
        x="10"
        y="35"
        fontFamily="var(--font-geist-sans), Arial, sans-serif"
        fontSize="28"
        fill="hsl(var(--primary-foreground))"
        fontWeight="bold"
      >
        AutoTube
      </text>
      <text
        x="150"
        y="35"
        fontFamily="var(--font-geist-mono), monospace"
        fontSize="28"
        fill="hsl(var(--primary-foreground))"
        opacity="0.8"
      >
        AI
      </text>
    </svg>
  );
}
