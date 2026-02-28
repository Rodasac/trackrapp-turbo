"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { DynamicIcon, dynamicIconImports } from "lucide-react/dynamic";
import { Input } from "@repo/ui/input";
import { cn } from "@repo/ui/lib/utils";

// Computed once at module level — avoids re-evaluating 1,400+ keys on every render
const ALL_ICON_NAMES = Object.keys(dynamicIconImports);

interface IconSearchProps {
  value: string | undefined;
  onChange: (name: string | undefined) => void;
}

export function IconSearch({ value, onChange }: IconSearchProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce query by 300ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter icons in-memory: split query on spaces, require all words to match
  const results = useMemo(() => {
    if (debouncedQuery.length < 2) return [];
    const words = debouncedQuery.toLowerCase().split(/\s+/).filter(Boolean);
    return ALL_ICON_NAMES.filter((name) =>
      words.every((word) => name.includes(word)),
    ).slice(0, 20);
  }, [debouncedQuery]);

  const showDropdown =
    open &&
    debouncedQuery.length >= 2 &&
    (results.length > 0 || query.trim().length >= 2);

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-2">
        {value && (
          <span className="flex shrink-0 items-center gap-1 text-sm">
            <DynamicIcon
              name={value as keyof typeof dynamicIconImports}
              size={16}
            />
            <span className="text-muted-foreground">{value}</span>
          </span>
        )}
        <Input
          placeholder="Search icons..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          autoComplete="off"
          className="flex-1"
        />
      </div>

      {showDropdown && (
        <div
          role="listbox"
          className="bg-background absolute z-20 mt-1 w-full rounded-md border shadow-md"
        >
          <div className="max-h-60 overflow-y-auto">
            {results.length === 0 ? (
              <div className="text-muted-foreground px-3 py-2 text-sm">
                No matching icons
              </div>
            ) : (
              results.map((name) => (
                <button
                  key={name}
                  type="button"
                  role="option"
                  aria-selected={name === value}
                  className={cn(
                    "hover:bg-muted flex w-full items-center gap-2 px-3 py-2 text-left text-sm",
                    name === value && "bg-muted",
                  )}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onChange(name);
                    setQuery("");
                    setOpen(false);
                  }}
                >
                  <DynamicIcon
                    name={name as keyof typeof dynamicIconImports}
                    size={16}
                  />
                  <span>{name}</span>
                </button>
              ))
            )}
          </div>

          {value && (
            <button
              type="button"
              aria-label="Clear icon"
              className="text-muted-foreground hover:bg-muted w-full border-t px-3 py-2 text-left text-sm"
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(undefined);
                setQuery("");
                setOpen(false);
              }}
            >
              <X className="mr-1 inline size-3" />
              Clear icon
            </button>
          )}
        </div>
      )}

      {value && !open && (
        <button
          type="button"
          aria-label="Clear icon"
          className="text-muted-foreground hover:text-foreground mt-1 flex items-center gap-1 text-xs"
          onClick={() => onChange(undefined)}
        >
          <X className="size-3" />
          Clear icon
        </button>
      )}
    </div>
  );
}
