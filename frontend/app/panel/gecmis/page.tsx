import type { Metadata } from "next";

import { HistoryList } from "@/components/panel/history";
import { GECMIS } from "@/lib/metinler";

export const metadata: Metadata = { title: GECMIS.baslik };

export default function HistoryPage() {
  return <HistoryList />;
}
