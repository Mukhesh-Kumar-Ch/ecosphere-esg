import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { loginSchema, type LoginFormValues } from "./auth.schemas";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values.email, values.password);
      navigate("/", { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed.";
      setError("root", { message });
    }
  };

  return (
    <div className="min-h-screen px-4 py-10 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-white/60 bg-white/80 shadow-soft backdrop-blur md:grid-cols-[1.2fr_0.8fr]">
        <section className="flex flex-col justify-between bg-slate-950 px-8 py-10 text-white md:px-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-200">EcoSphere</p>
            <h1 className="mt-6 max-w-xl text-4xl font-semibold leading-tight md:text-5xl">
              Enterprise ESG operations with secure role-based access.
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-6 text-slate-300 md:text-base">
              Centralize environmental, social, and governance workflows in a single platform built for
              operational clarity.
            </p>
          </div>
          <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">JWT authentication</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">RBAC enforced</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Prisma + PostgreSQL</div>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-10 md:px-10">
          <Card className="w-full max-w-md border-slate-200/80 bg-white/95">
            <CardHeader>
              <CardTitle>Sign in</CardTitle>
              <CardDescription>Use your EcoSphere credentials to continue.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" autoComplete="email" {...register("email")} />
                  {errors.email ? <p className="text-sm text-danger">{errors.email.message}</p> : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
                  {errors.password ? <p className="text-sm text-danger">{errors.password.message}</p> : null}
                </div>

                {errors.root ? <Alert>{errors.root.message}</Alert> : null}

                <Button className="w-full" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Signing in..." : "Login"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
