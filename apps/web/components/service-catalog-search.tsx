"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@repo/ui/input";
import type { ServiceCatalogEntry } from "@repo/database";

interface ServiceCatalogSearchProps {
  onSelect: (entry: ServiceCatalogEntry) => void;
}

export function ServiceCatalogSearch({ onSelect }: ServiceCatalogSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ServiceCatalogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/service-catalog?q=${encodeURIComponent(query)}&limit=8`,
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showDropdown = open && (loading || results.length > 0 || query.trim().length > 0);

  return (
    <div ref={containerRef} className="relative">
      <Input
        placeholder="Search for a service (e.g. Netflix, Spotify…)"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        autoComplete="off"
      />
      {showDropdown && (
        <div className="bg-background absolute z-20 mt-1 w-full rounded-md border shadow-md">
          {loading && (
            <div className="text-muted-foreground px-3 py-2 text-sm">
              Searching…
            </div>
          )}
          {!loading && results.length === 0 && query.trim() && (
            <div className="text-muted-foreground px-3 py-2 text-sm">
              No matches — enter details manually below
            </div>
          )}
          {results.map((entry) => (
            <button
              key={entry.id}
              type="button"
              className="hover:bg-muted flex w-full items-center gap-3 px-3 py-2 text-left text-sm"
              onMouseDown={(e) => {
                // mousedown fires before blur; prevent blur from closing first
                e.preventDefault();
                onSelect(entry);
                setQuery(entry.name);
                setOpen(false);
              }}
            >
              {entry.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={entry.logoUrl}
                  alt=""
                  className="size-5 shrink-0 rounded"
                />
              ) : (
                <span className="bg-muted flex size-5 shrink-0 items-center justify-center rounded text-xs font-medium uppercase">
                  {entry.name[0]}
                </span>
              )}
              <span className="flex-1 font-medium">{entry.name}</span>
              {entry.typicalMonthlyPrice && (
                <span className="text-muted-foreground text-xs">
                  ${entry.typicalMonthlyPrice}/mo
                </span>
              )}
            </button>
          ))}
          {results.length > 0 && (
            <button
              type="button"
              className="text-muted-foreground hover:bg-muted w-full border-t px-3 py-2 text-left text-sm"
              onMouseDown={(e) => {
                e.preventDefault();
                setQuery("");
                setOpen(false);
              }}
            >
              Enter manually
            </button>
          )}
        </div>
      )}
    </div>
  );
}
