"use client";

import { ErrorState } from "@/components/states";
import { HATALAR } from "@/lib/metinler";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="container-page flex-1 py-16">
      <div className="mx-auto max-w-xl">
        {/* The raw error is not shown: it may contain technical detail. */}
        <ErrorState title={HATALAR.genel} onRetry={reset} />
      </div>
    </main>
  );
}
