"use client";

import * as React from "react";
import { useRef, useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { COUNTRIES, type CountryConfig } from "@/services/goldRates";

interface CountrySelectorProps {
  value: string;
  onChange: (countryName: string) => void;
}

export function CountrySelector({ value, onChange }: CountrySelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightIdx, setHighlightIdx] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // ─── Filtered list ───────────────────────────────────
  const filtered = React.useMemo(() => {
    if (!search.trim()) return COUNTRIES;
    const q = search.toLowerCase();
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.currency.toLowerCase().includes(q) ||
        c.flag.includes(q)
    );
  }, [search]);

  // ─── Selected config ─────────────────────────────────
  const selected: CountryConfig =
    COUNTRIES.find((c) => c.name === value) ?? COUNTRIES[0];

  // ─── Open / close ────────────────────────────────────
  const openDropdown = useCallback(() => {
    setOpen(true);
    setSearch("");
    setHighlightIdx(
      Math.max(
        0,
        COUNTRIES.findIndex((c) => c.name === value)
      )
    );
    // Focus the search input after render
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [value]);

  const closeDropdown = useCallback(() => {
    setOpen(false);
    setSearch("");
  }, []);

  // ─── Click outside ──────────────────────────────────
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        closeDropdown();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, closeDropdown]);

  // ─── Scroll highlighted item into view ──────────────
  useEffect(() => {
    if (!open || !listRef.current) return;
    const item = listRef.current.children[highlightIdx] as HTMLElement;
    item?.scrollIntoView({ block: "nearest" });
  }, [highlightIdx, open]);

  // ─── Keyboard handling ──────────────────────────────
  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        openDropdown();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightIdx((i) => Math.min(i + 1, filtered.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightIdx((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filtered[highlightIdx]) {
          onChange(filtered[highlightIdx].name);
          closeDropdown();
        }
        break;
      case "Escape":
        e.preventDefault();
        closeDropdown();
        break;
    }
  }

  // Reset highlight when filter changes
  useEffect(() => {
    setHighlightIdx(0);
  }, [search]);

  return (
    <div ref={containerRef} className="relative inline-block" onKeyDown={handleKeyDown}>
      {/* ── Trigger button ────────────────────────────── */}
      <button
        type="button"
        onClick={() => (open ? closeDropdown() : openDropdown())}
        className={cn(
          "flex h-10 items-center gap-2 rounded-md border border-gold/20 bg-midnight px-3 py-2 text-sm text-ivory",
          "hover:border-gold/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50",
          "cursor-pointer transition-colors duration-150 select-none",
          "w-full sm:w-auto"
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="text-base leading-none">{selected.flag}</span>
        <span className="truncate">{selected.name}</span>
        <span className="ml-auto text-[10px] font-mono text-gold/60">
          {selected.currency}
        </span>
        <svg
          className={cn(
            "h-3.5 w-3.5 shrink-0 fill-current text-gold/50 transition-transform duration-200",
            open && "rotate-180"
          )}
          viewBox="0 0 20 20"
        >
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      </button>

      {/* ── Dropdown panel ────────────────────────────── */}
      {open && (
        <div
          className={cn(
            "absolute right-0 z-50 mt-1.5 w-72 overflow-hidden rounded-lg border border-gold/20 bg-midnight shadow-xl shadow-black/40",
            "animate-in fade-in slide-in-from-top-2 duration-150"
          )}
        >
          {/* Search bar */}
          <div className="border-b border-gold/10 p-2">
            <div className="relative">
              <svg
                className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ivory/30"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country or currency…"
                className="h-9 w-full rounded-md border border-gold/10 bg-midnight/80 pl-8 pr-3 text-sm text-ivory placeholder:text-ivory/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/40"
                autoComplete="off"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Country list */}
          <ul
            ref={listRef}
            role="listbox"
            className="max-h-64 overflow-y-auto overscroll-contain py-1 scrollbar-thin scrollbar-thumb-gold/20 scrollbar-track-transparent"
          >
            {filtered.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-ivory/30">
                No countries found
              </li>
            )}
            {filtered.map((country, idx) => {
              const isSelected = country.name === value;
              const isHighlighted = idx === highlightIdx;

              return (
                <li
                  key={country.name}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setHighlightIdx(idx)}
                  onClick={() => {
                    onChange(country.name);
                    closeDropdown();
                  }}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 px-3 py-2.5 text-sm transition-colors duration-75",
                    isHighlighted && "bg-gold/10",
                    isSelected && "bg-gold/15 text-gold"
                  )}
                >
                  <span className="text-lg leading-none shrink-0">
                    {country.flag}
                  </span>
                  <span
                    className={cn(
                      "flex-1 truncate",
                      isSelected ? "text-gold font-medium" : "text-ivory"
                    )}
                  >
                    {country.name}
                  </span>
                  <span
                    className={cn(
                      "font-mono text-[11px] shrink-0",
                      isSelected ? "text-gold/80" : "text-ivory/40"
                    )}
                  >
                    {country.currency}
                  </span>
                  {isSelected && (
                    <svg
                      className="h-4 w-4 shrink-0 text-gold"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
