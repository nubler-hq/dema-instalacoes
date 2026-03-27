'use client'

import { Button } from "@/components/ui/button";
import { company } from "@/content/site-content";
import { cn } from "@/lib/utils";
import { ArrowUpRight, Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Separator } from "../ui/separator";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", text: "Inicio" },
  { href: "/servicos", text: "Serviços" },
  { href: "/cases", text: "Cases" },
  { href: "/sobre-nos", text: "Sobre nós" },
  { href: company.whatsappHref, text: "Contato", target: "_blank" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="fixed w-full top-0 z-50">
      <div className="shell border-x-0! px-0!">
        <div className="flex min-h-16 items-center justify-between gap-4 py-3 sm:min-h-18 sm:py-4">
          <div className="flex items-center h-12 gap-6 bg-secondary/80 pl-9 backdrop-blur-sm border shadow-xs rounded-md px-4">
            <Link href="/" className="flex items-center gap-4">
              <Image
                src="/images/logos/logo-light.png"
                alt="Logo da Dema Instalacoes"
                className="object-contain h-6"
                width={128}
                height={128}
                priority
              />
            </Link>

            <Separator orientation="vertical" className="h-12 bg-border" />

            <nav className="flex items-center">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  target={link.target}
                  className={cn(
                    "text-xs font-medium h-8 px-3 rounded-md tracking-[0.18em] uppercase transition-all duration-300 border flex items-center text-muted-foreground",
                    link.href === pathname && "text-foreground bg-secondary/60 border-border",
                    link.href !== pathname && "border-transparent hover:border-border/20",
                  )}
                >
                  {link.text}
                </Link>
              ))}
            </nav>
          </div>

          <div className="hidden items-center gap-8 lg:flex">
            <Button
              variant="outline"
              className="h-12 rounded-md text-xs pr-11! font-semibold uppercase tracking-[0.2em] shadow-[0_20px_60px_rgba(204,97,28,0.2)] hover:bg-primary/90"
              asChild
            >
              <a href={company.whatsappHref} target="_blank" rel="noreferrer">
                Fale com a nossa equipe
                <ArrowUpRight className="size-4" />
              </a>
            </Button>
          </div>

          <div className="flex items-center gap-3 lg:hidden">
            <a
              href={company.whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/88 transition hover:border-primary/60 hover:text-white"
            >
              WhatsApp
            </a>
            <button
              type="button"
              aria-label="Menu de navegacao"
              className="rounded-md border border-white/15 bg-white/5 p-2 text-white/88"
            >
              <Menu className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="hidden border-t border-white/10 lg:hidden">
        <div className="shell">
          <nav className="flex gap-5 overflow-x-auto py-3 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white/65">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="whitespace-nowrap">
                {link.text}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
