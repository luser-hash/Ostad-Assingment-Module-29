import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import Input from "@/components/ui/input-field";
import Button from "@/components/ui/button-loading";

const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  thumbnail: z
  .instanceof(File, { message: "Thumbnail is required" })
  .refine((file) => file.size <= 5 * 1024 * 1024, "Max file size is 5MB")
  .refine(
    (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
    "Only JPG, PNG or WEBP allowed"
  ),
});

export default function CourseForm({
  initialValues,
  onSubmit,
  submitLabel = "Save",
  loading,
  onCancel,
}) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues ?? { title: "", description: "" },
  });

  useEffect(() => {
    reset(initialValues ?? { title: "", description: "" });
  }, [initialValues, reset]);

  const busy = loading || isSubmitting;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
      <Input
        label="Title"
        placeholder="e.g. Django REST for Beginners"
        error={errors.title?.message}
        {...register("title")}
      />

      <div className="grid gap-1.5">
        <label className="text-sm font-medium">Description</label>
        <textarea
          rows={4}
          {...register("description")}
          className={`min-h-28 rounded-md border bg-background px-3 py-2 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-1 ${
            errors.description
              ? "border-destructive focus-visible:ring-destructive"
              : "border-input focus-visible:ring-ring"
          }`}
          placeholder="What will students learn? Outline topics, outcomes, prerequisites..."
        />
        {errors.description && (
          <span className="text-xs font-medium text-destructive">{errors.description.message}</span>
        )}
      </div>

      <div className="grid gap-1.5">
        <label className="text-sm font-medium">Thumbnail</label>
        <input
          type="file"
          accept="image/*"
          className="h-10 cursor-pointer rounded-md border border-input bg-background px-3 py-2 text-sm file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-xs file:font-semibold hover:file:bg-accent"
          onChange={(e) => {
            const file = e.target.files?.[0];
            setValue("thumbnail", file, { shouldValidate: true });
          }}
        />
        {errors.thumbnail && (
          <span className="text-xs font-medium text-destructive">{errors.thumbnail.message}</span>
        )}
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <Button type="submit" loading={busy} className="rounded-xl">
          {submitLabel}
        </Button>

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
