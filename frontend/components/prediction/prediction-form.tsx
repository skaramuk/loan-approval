"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Check, CircleAlert, LoaderCircle, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, type Resolver, type UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Field } from "@/components/field";
import { PredictionResult } from "@/components/prediction/prediction-result";
import { PageHeading } from "@/components/site-chrome";
import { ErrorState } from "@/components/states";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  api,
  ApiError,
  queryKeys,
  type ModelInfo,
  type Prediction,
  type PredictionRequest,
} from "@/lib/api";
import { formatNumber, formatPercent } from "@/lib/bicim";
import { ALANLAR, DOGRULAMA, FORM, SECENEKLER, SONUC } from "@/lib/metinler";
import { gecmisDetay } from "@/lib/routes";
import { cn } from "@/lib/utils";

type NumericName =
  | "person_age"
  | "person_income"
  | "person_emp_exp"
  | "loan_amnt"
  | "loan_int_rate"
  | "cb_person_cred_hist_length"
  | "credit_score";
type ChoiceName = "person_education" | "person_home_ownership" | "loan_intent";
type FormValues = Record<NumericName, number> &
  Record<ChoiceName, string> & { previous_loan_defaults_on_file: "evet" | "hayir" | "" };
type FieldName = keyof FormValues;

const STEPS: FieldName[][] = [
  ["person_age", "person_education", "person_income", "person_emp_exp", "person_home_ownership"],
  ["loan_amnt", "loan_intent", "loan_int_rate"],
  ["cb_person_cred_hist_length", "credit_score", "previous_loan_defaults_on_file"],
];

const EMPTY = {
  person_education: "",
  person_home_ownership: "",
  loan_intent: "",
  previous_loan_defaults_on_file: "",
} as FormValues;

function fmt(value: number): string {
  return formatNumber(value, 2);
}

function buildSchema(fields: ModelInfo["fields"]) {
  const numeric = (name: NumericName) => {
    const { min, max, integer } = fields.numeric[name];
    let schema = z.number({ error: DOGRULAMA.zorunlu });
    if (integer) schema = schema.int(DOGRULAMA.tamSayi);
    return schema.min(min, DOGRULAMA.enAz(fmt(min))).max(max, DOGRULAMA.enFazla(fmt(max)));
  };
  const choice = (name: ChoiceName) =>
    z.enum(fields.categorical[name] as [string, ...string[]], { error: DOGRULAMA.sec });

  return z.object({
    person_age: numeric("person_age"),
    person_education: choice("person_education"),
    person_income: numeric("person_income"),
    person_emp_exp: numeric("person_emp_exp"),
    person_home_ownership: choice("person_home_ownership"),
    loan_amnt: numeric("loan_amnt"),
    loan_intent: choice("loan_intent"),
    loan_int_rate: numeric("loan_int_rate"),
    cb_person_cred_hist_length: numeric("cb_person_cred_hist_length"),
    credit_score: numeric("credit_score"),
    previous_loan_defaults_on_file: z.enum(["evet", "hayir"], { error: DOGRULAMA.sec }),
  });
}

const controlClass =
  "h-11 w-full rounded-lg border border-input bg-card px-3 text-base outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20";

export function PredictionForm() {
  const model = useQuery({ queryKey: queryKeys.model, queryFn: api.model, staleTime: Infinity });

  if (model.isPending) return <FormSkeleton />;
  if (model.isError) {
    return (
      <>
        <PageHeading title={FORM.baslik} />
        <div className="mt-6 max-w-2xl">
          <ErrorState title={FORM.yuklenemedi} error={model.error} onRetry={() => model.refetch()} />
        </div>
      </>
    );
  }
  return <LoadedForm fields={model.data.fields} />;
}

function FormSkeleton() {
  return (
    <div aria-busy className="max-w-2xl space-y-6">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-5 w-full max-w-md" />
      <Card>
        <CardContent className="space-y-5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-11 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function LoadedForm({ fields }: { fields: ModelInfo["fields"] }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<Prediction | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const headingRef = useRef<HTMLDivElement>(null);

  const schema = useMemo(() => buildSchema(fields), [fields]);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as unknown as Resolver<FormValues>,
    defaultValues: EMPTY,
    mode: "onTouched",
  });

  // Move focus to the top of the new step / the result so keyboard and screen-reader users follow.
  useEffect(() => {
    headingRef.current?.focus();
  }, [step, result]);

  const mutation = useMutation({
    mutationFn: api.createPrediction,
    onSuccess: (prediction) => {
      setResult(prediction);
      toast.success(SONUC.kaydedildi);
      queryClient.invalidateQueries({ queryKey: queryKeys.predictions });
    },
    onError: (error) => {
      if (error instanceof ApiError && error.details.length > 0) {
        for (const detail of error.details) {
          form.setError(detail.field as FieldName, { message: detail.message });
        }
        const first = STEPS.findIndex((names) =>
          error.details.some((d) => names.includes(d.field as FieldName)),
        );
        if (first >= 0) setStep(first);
      }
      setFormError(error.message);
    },
  });

  function experienceFitsAge(): boolean {
    const { person_age, person_emp_exp } = form.getValues();
    const gap = fields.min_age_experience_gap;
    if (person_emp_exp > person_age - gap) {
      form.setError("person_emp_exp", { message: DOGRULAMA.tecrube(gap) }, { shouldFocus: true });
      return false;
    }
    return true;
  }

  async function next() {
    setFormError(null);
    const valid = await form.trigger(STEPS[step], { shouldFocus: true });
    if (!valid || (step === 0 && !experienceFitsAge())) return;
    setStep((s) => s + 1);
  }

  function onSubmit(values: FormValues) {
    setFormError(null);
    if (!experienceFitsAge()) return setStep(0);
    const payload: PredictionRequest = {
      ...values,
      previous_loan_defaults_on_file: values.previous_loan_defaults_on_file === "evet",
    };
    mutation.mutate(payload);
  }

  function restart() {
    form.reset(EMPTY);
    mutation.reset();
    setResult(null);
    setStep(0);
  }

  if (result) {
    return (
      <div>
        <div ref={headingRef} tabIndex={-1} className="outline-none">
          <PageHeading
            title={SONUC.baslik}
            action={
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="outline">
                  <Link href={gecmisDetay(result.id)}>{SONUC.detay}</Link>
                </Button>
                <Button onClick={restart}>
                  <Plus aria-hidden />
                  {SONUC.yeni}
                </Button>
              </div>
            }
          />
        </div>
        <div className="mt-6">
          <PredictionResult prediction={result} />
        </div>
      </div>
    );
  }

  const current = FORM.adimlar[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="max-w-2xl">
      <PageHeading title={FORM.baslik} description={FORM.altBaslik} />

      <ol className="mt-8 flex gap-2" aria-label={FORM.adim(step + 1, STEPS.length)}>
        {FORM.adimlar.map((item, index) => (
          <li key={item.baslik} className="flex-1" aria-current={index === step ? "step" : undefined}>
            <div
              className={cn("h-1.5 rounded-full", index <= step ? "bg-primary" : "bg-muted")}
              aria-hidden
            />
            <p
              className={cn(
                "mt-2 flex items-center gap-1.5 text-xs font-medium sm:text-sm",
                index === step ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {index < step ? <Check className="size-3.5 text-success" aria-hidden /> : null}
              <span className="sm:hidden">{index + 1}.</span>
              <span className="hidden sm:inline">{item.baslik}</span>
            </p>
          </li>
        ))}
      </ol>

      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="mt-6">
        <Card>
          <CardContent>
            <div ref={headingRef} tabIndex={-1} className="outline-none">
              <p className="text-sm font-medium text-primary">{FORM.adim(step + 1, STEPS.length)}</p>
              <h2 className="mt-1 text-xl font-bold">{current.baslik}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{current.aciklama}</p>
            </div>

            <div className="mt-6 space-y-5">
              {formError ? (
                <Alert variant="destructive" role="alert">
                  <CircleAlert aria-hidden />
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              ) : null}

              {step === 0 ? (
                <>
                  <NumberField form={form} fields={fields} name="person_age" />
                  <ChoiceField form={form} fields={fields} name="person_education" />
                  <NumberField form={form} fields={fields} name="person_income" />
                  <NumberField form={form} fields={fields} name="person_emp_exp" />
                  <ChoiceField form={form} fields={fields} name="person_home_ownership" />
                </>
              ) : null}

              {step === 1 ? (
                <>
                  <NumberField form={form} fields={fields} name="loan_amnt" />
                  <ChoiceField form={form} fields={fields} name="loan_intent" />
                  <NumberField form={form} fields={fields} name="loan_int_rate" step="0.01" />
                  <RatioPreview form={form} />
                </>
              ) : null}

              {step === 2 ? (
                <>
                  <NumberField form={form} fields={fields} name="cb_person_cred_hist_length" />
                  <NumberField form={form} fields={fields} name="credit_score" />
                  <YesNoField form={form} />
                </>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex items-center justify-between gap-3">
          {step > 0 ? (
            <Button type="button" variant="outline" size="lg" onClick={() => setStep((s) => s - 1)}>
              <ArrowLeft aria-hidden />
              {FORM.geri}
            </Button>
          ) : (
            <span />
          )}
          {isLast ? (
            <Button type="submit" size="lg" disabled={mutation.isPending}>
              {mutation.isPending ? <LoaderCircle className="animate-spin" aria-hidden /> : null}
              {mutation.isPending ? FORM.bekle : FORM.gonder}
            </Button>
          ) : (
            <Button type="button" size="lg" onClick={next}>
              {FORM.ileri}
              <ArrowRight aria-hidden />
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

type FieldProps = { form: UseFormReturn<FormValues>; fields: ModelInfo["fields"] };

function NumberField({ form, fields, name, step }: FieldProps & { name: NumericName; step?: string }) {
  const { min, max, integer } = fields.numeric[name];
  const hint = FORM.yardim[name as keyof typeof FORM.yardim];
  const range = FORM.aralik(fmt(min), fmt(max));

  return (
    <Field
      id={name}
      label={ALANLAR[name]}
      help={hint ? `${hint} ${range}` : range}
      error={form.formState.errors[name]?.message}
    >
      {(a11y) => (
        <Input
          {...a11y}
          type="number"
          inputMode={integer ? "numeric" : "decimal"}
          min={min}
          max={max}
          step={step ?? (integer ? "1" : "any")}
          className="figures"
          {...form.register(name, { valueAsNumber: true })}
        />
      )}
    </Field>
  );
}

function ChoiceField({ form, fields, name }: FieldProps & { name: ChoiceName }) {
  const labels = SECENEKLER[name] as Record<string, string>;
  return (
    <Field id={name} label={ALANLAR[name]} error={form.formState.errors[name]?.message}>
      {(a11y) => (
        <select {...a11y} className={controlClass} {...form.register(name)}>
          <option value="" disabled>
            {FORM.secin}
          </option>
          {fields.categorical[name].map((value) => (
            <option key={value} value={value}>
              {labels[value] ?? value}
            </option>
          ))}
        </select>
      )}
    </Field>
  );
}

function YesNoField({ form }: { form: UseFormReturn<FormValues> }) {
  const name = "previous_loan_defaults_on_file";
  const error = form.formState.errors[name]?.message;
  const errorId = `${name}-hata`;
  const helpId = `${name}-yardim`;

  return (
    <fieldset aria-describedby={[error ? errorId : null, helpId].filter(Boolean).join(" ")}>
      <legend className="text-sm font-medium">{ALANLAR[name]}</legend>
      <div className="mt-2 grid grid-cols-2 gap-3">
        {(["hayir", "evet"] as const).map((value) => (
          <label
            key={value}
            className="flex h-11 cursor-pointer items-center gap-2.5 rounded-lg border border-input bg-card px-3 text-base transition-colors has-checked:border-primary has-checked:bg-primary-soft has-focus-visible:ring-3 has-focus-visible:ring-ring/50"
          >
            <input
              type="radio"
              value={value}
              className="size-4 accent-(--primary)"
              {...form.register(name)}
            />
            {value === "evet" ? FORM.evet : FORM.hayir}
          </label>
        ))}
      </div>
      {error ? (
        <p id={errorId} className="mt-2 flex items-start gap-1.5 text-sm font-medium text-danger">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          {error}
        </p>
      ) : null}
      <p id={helpId} className="mt-2 text-sm text-muted-foreground">
        {FORM.yardim.previous_loan_defaults_on_file}
      </p>
    </fieldset>
  );
}

function RatioPreview({ form }: { form: UseFormReturn<FormValues> }) {
  const [amount, income] = form.watch(["loan_amnt", "person_income"]);
  const ratio = amount > 0 && income > 0 ? Math.round((amount / income) * 100) / 100 : null;

  return (
    <div className="rounded-lg border border-dashed bg-muted/40 px-3.5 py-3" aria-live="polite">
      <p className="flex items-baseline justify-between gap-3 text-sm">
        <span className="font-medium">{FORM.oran.etiket}</span>
        <span className="font-heading text-lg font-bold figures">
          {ratio === null ? "—" : formatPercent(ratio)}
        </span>
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{FORM.oran.aciklama}</p>
    </div>
  );
}
