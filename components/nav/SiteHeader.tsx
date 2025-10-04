"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

type NavItem = { label: string; href: string };

const NAV: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Planner", href: "/planner/intake" },
  { label: "Pricing", href: "/pricing" },
  { label: "Labs", href: "/labs" },
];

function NavLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const active =
    item.href === "/"
      ? pathname === "/"
      : pathname === item.href || pathname.startsWith(item.href + "/");
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={[
        "rounded-md px-3 py-2 text-sm",
        active ? "bg-emerald-50 text-emerald-700" : "text-gray-700 hover:bg-gray-50",
      ].join(" ")}
    >
      {item.label}
    </Link>
  );
}

export default function SiteHeader() {
  const [open, setOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 md:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-emerald-600 text-white">₿</span>
          MoneyXprt
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <NavLink key={n.href} item={n} />
          ))}
        </nav>

        {/* Right-side CTAs */}
        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/planner/intake"
            className="rounded-md bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700"
          >
            Get Started
          </Link>
          <Link
            href="/signin"
            className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
          >
            Sign in
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="inline-flex items-center rounded-md border px-3 py-2 text-sm md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          Menu
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t bg-white md:hidden">
          <div className="mx-auto max-w-6xl px-4 py-3">
            <nav className="flex flex-col gap-1">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setOpen(false)}
                >
                  {n.label}
                </Link>
              ))}
              <div className="mt-2 flex gap-2">
                <Link
                  href="/planner/intake"
                  className="flex-1 rounded-md bg-emerald-600 px-3 py-2 text-center text-sm text-white hover:bg-emerald-700"
                  onClick={() => setOpen(false)}
                >
                  Get Started
                </Link>
                <Link
                  href="/signin"
                  className="flex-1 rounded-md border px-3 py-2 text-center text-sm hover:bg-gray-50"
                  onClick={() => setOpen(false)}
                >
                  Sign in
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

