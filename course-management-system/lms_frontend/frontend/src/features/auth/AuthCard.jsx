export default function AuthCard({ title, subtitle, children }) {
  return (
    <div className="mx-auto w-full max-w-md rounded-3xl border border-border/70 bg-card/95 p-6 shadow-[0_25px_60px_-35px_rgba(15,23,42,0.65)] backdrop-blur">
      <div className="mb-5">
        <h2 className="text-2xl font-extrabold tracking-tight">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      <div>{children}</div>
    </div>
  );
}
