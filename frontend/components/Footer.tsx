import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-gold/10 bg-midnight py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 sm:flex-row">
        <p className="font-mono text-[10px] uppercase tracking-widest text-ivory/30">
          Genuix · Gold Intelligence SaaS · India
        </p>
        <nav className="flex gap-6 text-sm text-ivory/50">
          <Link href="/pricing" className="hover:text-gold">
            Pricing
          </Link>
          <Link href="/dashboard" className="hover:text-gold">
            Dashboard
          </Link>
          <Link href="/verify" className="hover:text-gold">
            Verify
          </Link>
          <Link href="/history" className="hover:text-gold">
            History
          </Link>
        </nav>
      </div>
    </footer>
  );
}
