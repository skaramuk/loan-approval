import type { Metadata } from "next";
import { Suspense } from "react";

import { HistoryDetail } from "@/components/panel/history";
import { Skeleton } from "@/components/ui/skeleton";
import { SONUC } from "@/lib/metinler";

export const metadata: Metadata = { title: SONUC.baslik };

export default function HistoryDetailPage() {
  // The id is read on the client with useParams(), which needs a Suspense boundary.
  return (
    <Suspense fallback={<Skeleton aria-busy className="h-64 w-full" />}>
      <HistoryDetail />
    </Suspense>
  );
}
