import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    desc: "For individual buyers testing Genuix",
    features: ["10 verifications / month", "Live gold rates", "Basic BIS checks", "Email support"],
    cta: "Get Started",
    href: "/verify",
    highlight: false,
  },
  {
    name: "Pro",
    price: "₹4,999",
    period: "/ month",
    desc: "For jewellers and pawnbrokers",
    features: [
      "500 verifications / month",
      "Claude AI deep analysis",
      "Full verification history",
      "INR value estimates",
      "API access",
    ],
    cta: "Start Pro Trial",
    href: "/verify",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "For chains, NBFCs, and assayers",
    features: [
      "Unlimited verifications",
      "Dedicated Claude model tuning",
      "SSO & team seats",
      "SLA & on-prem option",
      "BIS registry integration",
    ],
    cta: "Contact Sales",
    href: "/verify",
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen genuix-grid">
      <Navbar active="/pricing" />
      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-gold/70">Pricing</p>
          <h1 className="mt-2 font-display text-4xl font-light text-ivory">Simple plans for Indian gold trade</h1>
          <p className="mx-auto mt-4 max-w-xl text-ivory/60">
            All plans include BIS hallmark parsing, live INR gold rates, and verification storage.
          </p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={cn(plan.highlight && "border-gold/40 ring-1 ring-gold/20")}
            >
              <CardHeader>
                {plan.highlight && (
                  <p className="font-mono text-[10px] uppercase tracking-widest text-teal">Most popular</p>
                )}
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.desc}</CardDescription>
                <p className="pt-4">
                  <span className="font-display text-4xl text-ivory">{plan.price}</span>
                  <span className="text-ivory/50">{plan.period}</span>
                </p>
              </CardHeader>
              <CardContent>
                <ul className="mb-8 space-y-3 text-sm text-ivory/70">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <span className="text-gold">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Button href={plan.href} variant={plan.highlight ? "default" : "outline"} className="w-full">
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
