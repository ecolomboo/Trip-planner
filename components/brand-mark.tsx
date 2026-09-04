/** The Silk Road mark: a compass diamond on a ceramic-turquoise tile. */
export function BrandMark({
  className = "h-8 w-8 rounded-xl",
  iconClassName = "h-4 w-4",
}: {
  className?: string;
  iconClassName?: string;
}) {
  return (
    <span
      className={`grid shrink-0 place-items-center bg-gradient-to-br from-turquoise-bright to-turquoise-deep shadow-glow ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        className={`text-[#06231f] ${iconClassName}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 3l9 9-9 9-9-9z" />
        <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
      </svg>
    </span>
  );
}
