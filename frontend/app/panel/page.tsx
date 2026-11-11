import type { Metadata } from "next";

import { Overview } from "@/components/panel/overview";
import { OZET } from "@/lib/metinler";

export const metadata: Metadata = { title: OZET.baslik };

export default function PanelPage() {
  return <Overview />;
}
