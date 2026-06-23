import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/verify", label: "Verify" },
  { href: "/history", label: "History" },
  { href: "/pricing", label: "Pricing" },
];

export function Navbar({ active }: { active?: string }) {
  return (
    <header className="sticky top-0 z-50 border-b border-gold/10 bg-midnight/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/">
          <Logo size={40} />
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md px-4 py-2 text-sm font-medium transition-colors",
                active === link.href ? "bg-gold/15 text-gold" : "text-ivory/70 hover:text-gold",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Button href="/verify" size="sm" className="md:hidden">
          Verify
        </Button>
        <Button href="/verify" size="sm" className="hidden md:inline-flex">
          Start Verification
        </Button>
      </div>
    </header>
  );
}
