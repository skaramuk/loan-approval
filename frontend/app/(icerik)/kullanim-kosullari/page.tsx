import type { Metadata } from "next";

import { LegalPage } from "@/components/legal-page";
import { YASAL } from "@/lib/metinler";

export const metadata: Metadata = { title: YASAL.kosullar.baslik };

export default function TermsPage() {
  return <LegalPage title={YASAL.kosullar.baslik} sections={YASAL.kosullar.bolumler} />;
}
