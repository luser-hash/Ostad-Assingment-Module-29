import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import Input from "../../shared/ui/Input";
import Button from "../../shared/ui/Button";

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
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: "grid", gap: 12 }}>
      <Input label="Title" placeholder="e.g. Django REST for Beginners" error={errors.title?.message} {...register("title")} />

      <div style={{ display: "grid", gap: 6 }}>
        <label style={{ fontSize: 13, fontWeight: 600 }}>Description</label>
        <textarea
          rows={4}
          {...register("description")}
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: `1px solid ${errors.description ? "#ef4444" : "#d1d5db"}`,
            outline: "none",
            resize: "vertical",
          }}
          placeholder="What will students learn? Outline topics, outcomes, prerequisites..."
        />
        {errors.description && (
          <span style={{ color: "#ef4444", fontSize: 12 }}>{errors.description.message}</span>
        )}
      </div>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
            const file = e.target.files?.[0];
            setValue("thumbnail", file);
        }}>
      </input>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Button type="submit" loading={busy}>
          {submitLabel}
        </Button>

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