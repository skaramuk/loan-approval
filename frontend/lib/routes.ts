export const ROUTES = {
  anaSayfa: "/",
  giris: "/giris",
  kayit: "/kayit",
  sifremiUnuttum: "/sifremi-unuttum",
  sifreYenile: "/sifre-yenile",
  panel: "/panel",
  yeni: "/panel/yeni",
  gecmis: "/panel/gecmis",
  hesap: "/panel/hesap",
  model: "/model",
  gizlilik: "/gizlilik",
  kosullar: "/kullanim-kosullari",
  authOnay: "/auth/onay",
} as const;

export function gecmisDetay(id: string): string {
  return `${ROUTES.gecmis}/${id}`;
}

/** Only allow same-site relative targets for post-login redirects (no open redirect). */
export function safeNext(value: string | string[] | undefined | null): string {
  const target = Array.isArray(value) ? value[0] : value;
  if (target && target.startsWith("/") && !target.startsWith("//") && !target.includes("\\")) {
    return target;
  }
  return ROUTES.panel;
}
