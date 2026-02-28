import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import Input from "@/components/ui/input-field";
import Button from "@/components/ui/button-loading";

const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  video_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  order: z.coerce.number().int().min(1, "Order must be >= 1").optional(),
  duration: z.coerce.number().int().min(0, "Duration must be >= 0").optional(),
});

export default function LessonForm({ initialValues, onSubmit, submitLabel, loading, onCancel }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues ?? {
      title: "",
      video_url: "",
      order: 1,
      duration: 0,
    },
  });

  useEffect(() => {
    reset(
      initialValues ?? { title: "", video_url: "", order: 1, duration: 0 }
    );
  }, [initialValues, reset]);

  const busy = loading || isSubmitting;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
      <Input label="Title" error={errors.title?.message} {...register("title")} />

      <Input label="Video URL (optional)" error={errors.video_url?.message} {...register("video_url")} />

      <div className="grid gap-3 sm:grid-cols-2">
        <Input label="Order (optional)" type="number" error={errors.order?.message} {...register("order")} />
        <Input label="Duration (minutes, optional)" type="number" error={errors.duration?.message} {...register("duration")} />
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <Button type="submit" loading={busy} className="rounded-xl">{submitLabel}</Button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

