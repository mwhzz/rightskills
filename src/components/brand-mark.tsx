export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={className}
    >
      <rect width="32" height="32" rx="8" fill="currentColor" />
      <path
        d="M8 22.5V10.8c0-.7.5-1.3 1.2-1.4 2.6-.4 5.2.1 7.3 1.4 2.1-1.3 4.7-1.8 7.3-1.4.7.1 1.2.7 1.2 1.4v11.7"
        fill="none"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M16.5 11.2v11.2"
        fill="none"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="23.2" cy="8.4" r="1.6" fill="#F4C430" />
    </svg>
  );
}
