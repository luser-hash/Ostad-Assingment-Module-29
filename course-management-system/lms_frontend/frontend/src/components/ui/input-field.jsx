import { useId } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function InputField({ label, error, id, className, ...props }) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="grid gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium">
          {label}
        </label>
      )}
      <Input
        id={inputId}
        aria-invalid={Boolean(error)}
        className={cn(error && "border-destructive focus-visible:ring-destructive", className)}
        {...props}
      />
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
