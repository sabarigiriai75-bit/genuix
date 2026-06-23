import { cn } from "@/lib/utils";

type LogoProps = {
  size?: number;
  showWordmark?: boolean;
  className?: string;
};

export function Logo({ size = 48, showWordmark = true, className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        className="shrink-0 drop-shadow-[0_0_12px_rgba(196,149,42,0.2)]"
      >
        <polygon points="50,7 85,27.5 85,72.5 50,93 15,72.5 15,27.5" fill="none" stroke="#C4952A" strokeWidth="2" />
        <polygon
          points="50,16 76,30.5 76,69.5 50,84 24,69.5 24,30.5"
          fill="none"
          stroke="#C4952A"
          strokeWidth="0.6"
          opacity="0.35"
        />
        <text x="50" y="64" textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontSize="40" fontWeight="300" fill="#C4952A">
          G
        </text>
        <text x="66" y="68" textAnchor="middle" fontFamily="DM Mono, monospace" fontSize="13" fill="#C4952A" opacity="0.65">
          x
        </text>
        <circle cx="50" cy="7" r="3.5" fill="#1A7A6E" />
      </svg>
      {showWordmark && (
        <div>
          <div className="font-display text-2xl font-light tracking-[0.35em] text-ivory uppercase leading-none">Genuix</div>
          <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-gold/80">Every karat, verified.</div>
        </div>
      )}
    </div>
  );
}
