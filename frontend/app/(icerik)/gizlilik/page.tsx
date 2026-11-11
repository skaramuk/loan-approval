import type { Metadata } from "next";

import { LegalPage } from "@/components/legal-page";
import { YASAL } from "@/lib/metinler";

export const metadata: Metadata = { title: YASAL.gizlilik.baslik };

export default function PrivacyPage() {
  return <LegalPage title={YASAL.gizlilik.baslik} sections={YASAL.gizlilik.bolumler} />;
}
