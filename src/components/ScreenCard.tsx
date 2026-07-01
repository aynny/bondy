export function ScreenCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`screen-card ${className}`}>{children}</section>;
}
