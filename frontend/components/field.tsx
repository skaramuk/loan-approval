import { CircleAlert } from "lucide-react";

import { Label } from "@/components/ui/label";

/**
 * Label + control + help text + error, wired together for assistive technology.
 * `children` receives the ids to put on the control.
 */
export function Field({
  id,
  label,
  help,
  error,
  children,
}: {
  id: string;
  label: string;
  help?: string;
  error?: string;
  children: (props: {
    id: string;
    "aria-invalid": boolean;
    "aria-describedby": string | undefined;
  }) => React.ReactNode;
}) {
  const helpId = help ? `${id}-yardim` : undefined;
  const errorId = error ? `${id}-hata` : undefined;
  const describedBy = [errorId, helpId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children({ id, "aria-invalid": Boolean(error), "aria-describedby": describedBy })}
      {error ? (
        <p id={errorId} className="flex items-start gap-1.5 text-sm font-medium text-danger">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          {error}
        </p>
      ) : null}
      {help ? (
        <p id={helpId} className="text-sm text-muted-foreground">
          {help}
        </p>
      ) : null}
    </div>
  );
}
