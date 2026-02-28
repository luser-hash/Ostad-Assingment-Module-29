export default function Spinner({ label = "Loading..." }) {
  return (
    <div className="grid justify-items-center gap-3 py-4 text-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground/20 border-t-foreground" />
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
