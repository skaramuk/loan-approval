"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { AuthError } from "@supabase/supabase-js";
import { CircleAlert, Eye, EyeOff, LoaderCircle, MailCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Field } from "@/components/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AUTH, DOGRULAMA } from "@/lib/metinler";
import { ROUTES } from "@/lib/routes";
import { createClient } from "@/lib/supabase/client";

const email = z.email(DOGRULAMA.eposta);
const password = z.string().min(8, DOGRULAMA.sifreKisa);

const ERROR_BY_CODE: Record<string, string> = {
  invalid_credentials: AUTH.hatalar.gecersizGiris,
  email_not_confirmed: AUTH.hatalar.onaylanmamis,
  user_already_exists: AUTH.hatalar.kayitli,
  email_exists: AUTH.hatalar.kayitli,
  weak_password: AUTH.hatalar.zayifSifre,
  same_password: AUTH.hatalar.ayniSifre,
  over_request_rate_limit: AUTH.hatalar.cokFazla,
  over_email_send_rate_limit: AUTH.hatalar.cokFazla,
  otp_expired: AUTH.hatalar.baglantiGecersiz,
};

function authMessage(error: AuthError): string {
  if (error.code && ERROR_BY_CODE[error.code]) return ERROR_BY_CODE[error.code];
  if (error.status === 429) return AUTH.hatalar.cokFazla;
  return AUTH.hatalar.genel;
}

function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <Alert variant="destructive" role="alert">
      <CircleAlert aria-hidden />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

function SubmitButton({ pending, label, pendingLabel }: { pending: boolean; label: string; pendingLabel: string }) {
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? <LoaderCircle className="animate-spin" aria-hidden /> : null}
      {pending ? pendingLabel : label}
    </Button>
  );
}

function PasswordInput(props: React.ComponentProps<typeof Input>) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input {...props} type={visible ? "text" : "password"} className="pr-11" />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? AUTH.gizle : AUTH.goster}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-muted-foreground hover:text-foreground"
      >
        {visible ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
      </button>
    </div>
  );
}

function SentNotice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="text-center" role="status">
      <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-success-soft text-success">
        <MailCheck className="size-6" aria-hidden />
      </span>
      <h2 className="mt-4 text-xl font-bold">{title}</h2>
      <div className="mt-2 space-y-2 text-sm text-muted-foreground">{children}</div>
      <Button asChild variant="outline" className="mt-6">
        <Link href={ROUTES.giris}>{AUTH.unuttum.geri}</Link>
      </Button>
    </div>
  );
}

function confirmUrl(next: string): string {
  const url = new URL(ROUTES.authOnay, window.location.origin);
  url.searchParams.set("sonraki", next);
  return url.toString();
}

// ---------------------------------------------------------------- login

const loginSchema = z.object({ email, password: z.string().min(1, DOGRULAMA.zorunlu) });

export function LoginForm({ next, notice }: { next: string; notice?: string }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(notice ?? null);
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const { errors, isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setFormError(null);
    const { error } = await createClient().auth.signInWithPassword(values);
    if (error) return setFormError(authMessage(error));
    router.replace(next);
    router.refresh();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-5">
      <FormError message={formError} />
      <Field id="email" label={AUTH.eposta} error={errors.email?.message}>
        {(a11y) => (
          <Input {...a11y} type="email" autoComplete="email" inputMode="email" {...form.register("email")} />
        )}
      </Field>
      <Field id="password" label={AUTH.sifre} error={errors.password?.message}>
        {(a11y) => (
          <PasswordInput {...a11y} autoComplete="current-password" {...form.register("password")} />
        )}
      </Field>
      <div className="text-right text-sm">
        <Link href={ROUTES.sifremiUnuttum} className="font-medium text-primary underline-offset-4 hover:underline">
          {AUTH.giris.unuttum}
        </Link>
      </div>
      <SubmitButton pending={isSubmitting} label={AUTH.giris.dugme} pendingLabel={AUTH.giris.bekle} />
    </form>
  );
}

// ---------------------------------------------------------------- sign up

const signupSchema = z
  .object({ email, password, confirm: z.string() })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: DOGRULAMA.sifreEslesmiyor });

export function SignupForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", password: "", confirm: "" },
  });
  const { errors, isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof signupSchema>) {
    setFormError(null);
    const { data, error } = await createClient().auth.signUp({
      email: values.email,
      password: values.password,
      options: { emailRedirectTo: confirmUrl(ROUTES.panel) },
    });
    if (error) return setFormError(authMessage(error));
    // With email confirmation on, an existing address comes back as a user without identities.
    if (data.user && data.user.identities?.length === 0) {
      return setFormError(AUTH.hatalar.kayitli);
    }
    if (data.session) {
      router.replace(ROUTES.panel);
      router.refresh();
      return;
    }
    setSentTo(values.email);
  }

  if (sentTo) {
    return (
      <SentNotice title={AUTH.kayit.onay.baslik}>
        <p>{AUTH.kayit.onay.aciklama(sentTo)}</p>
        <p>{AUTH.kayit.onay.spam}</p>
      </SentNotice>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-5">
      <FormError message={formError} />
      <Field id="email" label={AUTH.eposta} error={errors.email?.message}>
        {(a11y) => (
          <Input {...a11y} type="email" autoComplete="email" inputMode="email" {...form.register("email")} />
        )}
      </Field>
      <Field id="password" label={AUTH.sifre} help={AUTH.sifreIpucu} error={errors.password?.message}>
        {(a11y) => <PasswordInput {...a11y} autoComplete="new-password" {...form.register("password")} />}
      </Field>
      <Field id="confirm" label={AUTH.sifreTekrar} error={errors.confirm?.message}>
        {(a11y) => <PasswordInput {...a11y} autoComplete="new-password" {...form.register("confirm")} />}
      </Field>
      <SubmitButton pending={isSubmitting} label={AUTH.kayit.dugme} pendingLabel={AUTH.kayit.bekle} />
    </form>
  );
}

// ---------------------------------------------------------------- forgot password

const forgotSchema = z.object({ email });

export function ForgotPasswordForm() {
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const form = useForm<z.infer<typeof forgotSchema>>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });
  const { errors, isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof forgotSchema>) {
    setFormError(null);
    const { error } = await createClient().auth.resetPasswordForEmail(values.email, {
      redirectTo: confirmUrl(ROUTES.sifreYenile),
    });
    // Same message whether or not the address exists, so accounts cannot be enumerated.
    if (error && error.status === 429) return setFormError(AUTH.hatalar.cokFazla);
    setSent(true);
  }

  if (sent) {
    return (
      <SentNotice title={AUTH.unuttum.gonderildi.baslik}>
        <p>{AUTH.unuttum.gonderildi.aciklama}</p>
      </SentNotice>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-5">
      <FormError message={formError} />
      <Field id="email" label={AUTH.eposta} error={errors.email?.message}>
        {(a11y) => (
          <Input {...a11y} type="email" autoComplete="email" inputMode="email" {...form.register("email")} />
        )}
      </Field>
      <SubmitButton pending={isSubmitting} label={AUTH.unuttum.dugme} pendingLabel={AUTH.unuttum.bekle} />
    </form>
  );
}

// ---------------------------------------------------------------- set a new password

const newPasswordSchema = z
  .object({ password, confirm: z.string() })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: DOGRULAMA.sifreEslesmiyor });

export function NewPasswordForm({
  redirectTo,
  submitLabel,
  pendingLabel,
  successMessage,
}: {
  redirectTo?: string;
  submitLabel: string;
  pendingLabel: string;
  successMessage: string;
}) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<z.infer<typeof newPasswordSchema>>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: "", confirm: "" },
  });
  const { errors, isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof newPasswordSchema>) {
    setFormError(null);
    const { error } = await createClient().auth.updateUser({ password: values.password });
    if (error) return setFormError(authMessage(error));
    toast.success(successMessage);
    form.reset();
    if (redirectTo) {
      router.replace(redirectTo);
      router.refresh();
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-5">
      <FormError message={formError} />
      <Field id="new-password" label={AUTH.yeniSifre} help={AUTH.sifreIpucu} error={errors.password?.message}>
        {(a11y) => <PasswordInput {...a11y} autoComplete="new-password" {...form.register("password")} />}
      </Field>
      <Field id="new-password-confirm" label={AUTH.sifreTekrar} error={errors.confirm?.message}>
        {(a11y) => <PasswordInput {...a11y} autoComplete="new-password" {...form.register("confirm")} />}
      </Field>
      <SubmitButton pending={isSubmitting} label={submitLabel} pendingLabel={pendingLabel} />
    </form>
  );
}
