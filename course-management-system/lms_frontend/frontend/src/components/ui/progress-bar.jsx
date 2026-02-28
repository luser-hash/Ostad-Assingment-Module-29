import { Progress } from "@/components/ui/progress";

export default function ProgressBar({ value = 0 }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between text-xs font-semibold">
        <span className="text-muted-foreground">Progress</span>
        <span>{v}%</span>
      </div>
      <Progress value={v} className="h-2.5" />
    </div>
  );
}
