import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";

import Input from "@/components/ui/input-field";
import Button from "@/components/ui/button-loading";
import AuthCard from "../../features/auth/AuthCard";
import { registerApi } from "../../features/auth/authApi";

const schema = z
  .object({
    username: z.string().min(1, "At least 1 character long Username."),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["student", "instructor"], {
      errorMap: () => ({ message: "Role must be student or instructor"}),
    }),
  });

export default function RegisterPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [serverOk, setServerOk] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { username: "", email: "", password: "", role: "student" },
  });

  async function onSubmit(values) {
    setServerError("");
    setServerOk("");

    try {
      await registerApi(values);
      setServerOk("Registration successful. You can now login.");
      // navigate to login
      navigate("/login", { replace: true });
    } catch (e) {
      // DRF often returns {email:[...], password:[...]} etc
      const data = e?.response?.data;
      const msg =
        data?.detail ||
        data?.message ||
        (data && typeof data === "object"
          ? Object.values(data).flat().join(" ")
          : "Registration failed.");
      setServerError(msg);
    }
  }

  return (
    <AuthCard title="Register" subtitle="Create a new LMS account">
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
        <Input
          label="Username"
          placeholder="exampleUsername"
          type="text"
          error={errors.username?.message}
          {...register("username")}
        />
        <Input
          label="Email"
          placeholder="you@example.com"
          type="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label="Password"
          placeholder="••••••••"
          type="password"
          error={errors.password?.message}
          {...register("password")}
        />

        <div className="grid gap-1.5">
          <label className="text-sm font-medium">Role</label>
          <select
            className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none transition-colors focus-visible:ring-1 focus-visible:ring-ring"
            {...register("role")}
          >
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
          </select>
          {errors.role?.message && (
            <div className="text-xs font-medium text-destructive">{errors.role.message}</div>
          )}
        </div>

        {serverError && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs font-bold text-destructive">{serverError}</div>
        )}
        {serverOk && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-700">{serverOk}</div>
        )}

        <Button type="submit" loading={isSubmitting} className="h-10 rounded-xl">
          Create account
        </Button>

        <div className="text-xs text-muted-foreground">
          Already have an account? <Link to="/login" className="font-semibold text-primary">Login</Link>
        </div>
      </form>
    </AuthCard>
  );
}
