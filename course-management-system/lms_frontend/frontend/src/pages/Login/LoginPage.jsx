import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useNavigate } from "react-router-dom";

import Input from "../../shared/ui/Input";
import Button from "../../shared/ui/Button";
import AuthCard from "../../features/auth/AuthCard";
import { loginApi, meApi } from "../../features/auth/authApi";
import { useAuth } from "../../app/providers/AuthProvider";

const schema = z.object({
  username: z.string().min(1, "Enter your username"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function LoginPage() {
  const { login, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState("");

  const from = useMemo(() => location.state?.from || "/courses", [location.state]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { username: "", password: "" },
  });

  async function onSubmit(values) {
    setServerError("");
    try {
      const data = await loginApi(values);

      // Expecting: { access, refresh }
      login({
        access: data.access,
        refresh: data.refresh
      });

      // If backend doesn't return user, try to fetch /me
      try {
        const me = await meApi();
        setUser(me);
      } catch {
        // ok if /me not ready yet; role-based pages won't work until you add it
      }
      

      navigate(from, { replace: true });
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        "Login failed. Check credentials.";
      setServerError(msg);
    }
  }

  return (
    <AuthCard title="Login" subtitle="Access your LMS account">
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "grid", gap: 12 }}>
        <Input
          label="Username"
          placeholder="username"
          type="text"
          error={errors.username?.message}
          {...register("username")}
        />
        <Input
          label="Password"
          placeholder="••••••••"
          type="password"
          error={errors.password?.message}
          {...register("password")}
        />

        {serverError && (
          <div style={{ color: "#ef4444", fontSize: 13, fontWeight: 700 }}>
            {serverError}
          </div>
        )}

        <Button type="submit" loading={isSubmitting}>
          Login
        </Button>

        <div style={{ fontSize: 13, opacity: 0.75 }}>
          Don’t have an account? <Link to="/register">Register</Link>
        </div>
      </form>
    </AuthCard>
  );
}