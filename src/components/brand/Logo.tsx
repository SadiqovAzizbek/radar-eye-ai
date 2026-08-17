export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      role="img"
      aria-label="Smart Helmet logo"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    >
      <path d="M24 3 6 9v14c0 11 8 18 18 22 10-4 18-11 18-22V9L24 3Z" />
      <circle cx="24" cy="24" r="4" fill="currentColor" stroke="none" />
      <circle cx="24" cy="24" r="9" opacity="0.75" />
      <circle cx="24" cy="24" r="14.5" opacity="0.4" />
      <path d="M24 24 36 14" opacity="0.9" />
    </svg>
  );
}
