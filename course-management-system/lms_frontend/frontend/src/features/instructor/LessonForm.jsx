import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import Input from "../../shared/ui/Input";
import Button from "../../shared/ui/Button";

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
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: "grid", gap: 12 }}>
      <Input label="Title" error={errors.title?.message} {...register("title")} />

      <Input label="Video URL (optional)" error={errors.video_url?.message} {...register("video_url")} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Input label="Order (optional)" type="number" error={errors.order?.message} {...register("order")} />
        <Input label="Duration (sec, optional)" type="number" error={errors.duration?.message} {...register("duration")} />
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Button type="submit" loading={busy}>{submitLabel}</Button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #e5e7eb",
              background: "white",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}