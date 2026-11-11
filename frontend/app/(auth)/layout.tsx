import { Disclaimer, Logo, SkipLink } from "@/components/site-chrome";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SkipLink />
      <header className="container-page flex h-16 items-center justify-between">
        <Logo />
        <ThemeToggle />
      </header>
      <main id="icerik" className="container-page flex flex-1 flex-col items-center py-8 sm:py-14">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">{children}</div>
          <Disclaimer className="mt-6" />
        </div>
      </main>
    </>
  );
}
