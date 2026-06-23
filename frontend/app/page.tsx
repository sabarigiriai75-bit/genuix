import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "BIS Hallmark Checks",
    desc: "Validate fineness marks (916, 750) and assay codes against claimed karat for Indian retail gold.",
  },
  {
    title: "Claude AI Analysis",
    desc: "claude-opus-4-8 reviews weight, seller, and hallmark data to flag suspicious pieces.",
  },
  {
    title: "Live Gold Rates",
    desc: "22K, 24K, 18K, and 14K per-gram pricing in INR — updated from spot feeds.",
  },
  {
    title: "Verification History",
    desc: "Every assay is stored with verdict, confidence, and estimated value for your records.",
  },
];

const steps = [
  "Enter item weight, karat, and BIS hallmark details",
  "Genuix runs automated checks + Claude analysis",
  "Get verdict, value estimate, and actionable recommendations",
];

export default function Home() {
  return (
    <div className="min-h-screen genuix-grid">
      <Navbar />
      <section className="relative overflow-hidden border-b border-gold/10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(196,149,42,0.1),transparent_70%)]" />
        <div className="relative mx-auto max-w-6xl px-6 py-24 text-center">
          <Logo size={80} showWordmark={false} className="mb-8 justify-center" />
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-gold">Jewelry Gold Verification SaaS</p>
          <h1 className="mt-4 font-display text-5xl font-light tracking-wide text-ivory sm:text-6xl">
            Every karat, verified.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-ivory/60">
            Genuix helps jewellers, buyers, and pawnbrokers in India verify gold purity, hallmarks, and fair market
            value — powered by live rates and Claude AI.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button href="/verify" size="lg">
              Verify Jewelry
            </Button>
            <Button href="/dashboard" variant="outline" size="lg">
              View Dashboard
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <p className="font-mono text-[10px] uppercase tracking-widest text-gold/70">Platform</p>
        <h2 className="mt-2 font-display text-3xl font-light text-ivory">Built for the Indian gold market</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {features.map((f) => (
            <Card key={f.title}>
              <CardHeader>
                <CardTitle>{f.title}</CardTitle>
                <CardDescription>{f.desc}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-gold/10 bg-midnight/50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <p className="font-mono text-[10px] uppercase tracking-widest text-gold/70">How it works</p>
          <h2 className="mt-2 font-display text-3xl font-light text-ivory">Three steps to confidence</h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((step, i) => (
              <li key={step} className="rounded-xl border border-gold/15 p-6">
                <span className="font-mono text-2xl text-gold/40">0{i + 1}</span>
                <p className="mt-4 text-ivory/80">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-gold/70">SaaS Plans</p>
            <h2 className="mt-2 font-display text-3xl font-light text-ivory">Start free, scale with volume</h2>
            <p className="mt-4 text-ivory/60">
              From individual buyers to retail chains — verify hallmarks, track history, and access live MCX-linked
              rates.
            </p>
            <Button href="/pricing" className="mt-6">
              See Pricing
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Pro · ₹4,999/mo</CardTitle>
              <CardDescription>500 verifications · API access · Priority Claude analysis</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-ivory/70">
              <ul className="list-inside list-disc space-y-2">
                <li>BIS fineness validation</li>
                <li>Verification history & export</li>
                <li>Live 22K gold rate feed</li>
                <li>Estimated value in INR</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
