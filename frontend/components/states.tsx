import { CircleAlert, RotateCw, type LucideIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { HATALAR } from "@/lib/metinler";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed px-6 py-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-primary-soft text-primary">
        <Icon className="size-6" aria-hidden />
      </span>
      <p className="mt-4 font-heading text-lg font-semibold">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title,
  error,
  onRetry,
}: {
  title: string;
  error?: unknown;
  onRetry?: () => void;
}) {
  const message = error instanceof Error ? error.message : HATALAR.genel;
  return (
    <Alert variant="destructive" role="alert">
      <CircleAlert aria-hidden />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <p>{message}</p>
        {onRetry ? (
          <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
            <RotateCw aria-hidden />
            {HATALAR.tekrarDene}
          </Button>
        ) : null}
      </AlertDescription>
    </Alert>
  );
}
