import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";

import Input from "../../shared/ui/Input";
import Button from "../../shared/ui/Button";
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
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "grid", gap: 12 }}>
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

        <div style={{ display: "grid", gap: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 700 }}>Role</label>
          <select
            style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
            {...register("role")}
          >
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
          </select>
          {errors.role?.message && (
            <div style={{ color: "#ef4444", fontSize: 12 }}>{errors.role.message}</div>
          )}
        </div>

        {serverError && (
          <div style={{ color: "#ef4444", fontSize: 13, fontWeight: 700 }}>
            {serverError}
          </div>
        )}
        {serverOk && (
          <div style={{ color: "#16a34a", fontSize: 13, fontWeight: 700 }}>
            {serverOk}
          </div>
        )}

        <Button type="submit" loading={isSubmitting}>
          Create account
        </Button>

        <div style={{ fontSize: 13, opacity: 0.75 }}>
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </form>
    </AuthCard>
  );
}