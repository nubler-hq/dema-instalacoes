'use client'

import { Button } from "@/components/ui/button";
import { company } from "@/content/site-content";
import { cn } from "@/lib/utils";
import { ArrowUpRight, Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Separator } from "../ui/separator";
import { usePathname } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState, useEffect } from "react";

const navLinks = [
  { href: "/", text: "Inicio" },
  { href: "/servicos", text: "Serviços" },
  { href: "/cases", text: "Cases" },
  { href: "/sobre-nos", text: "Sobre nós" },
  { href: company.whatsappHref, text: "Contato", target: "_blank" },
];

export function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Close sheet on path change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <header className="fixed w-full top-0 z-50">
      <div className="shell border-x-0! lg:px-0!">
        <div className="flex min-h-16 items-center justify-between gap-4 py-3 sm:min-h-18 sm:py-4">
          <div className="flex items-center h-11 lg:h-14 gap-0 lg:gap-8 bg-secondary/80 backdrop-blur-sm border border-border shadow-xs rounded-md px-6 lg:pl-10">
            <Link href="/" className="flex items-center gap-4">
              <Image
                src="/images/logos/logo-light.png"
                alt="Logo da Dema Instalacoes"
                className="object-contain w-fit h-6 lg:h-8"
                width={160}
                height={160}
                priority
              />
            </Link>

            <Separator orientation="vertical" className="hidden lg:block h-14 bg-border ml-8" />

            <nav className="hidden lg:flex items-center">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  target={link.target}
                  className={cn(
                    "text-[13px] font-semibold h-9 px-4 rounded-md tracking-[0.18em] uppercase transition-all duration-300 border flex items-center text-muted-foreground",
                    link.href === pathname && "text-foreground bg-secondary/60 border-border",
                    link.href !== pathname && "border-transparent hover:border-border/20",
                  )}
                >
                  {link.text}
                </Link>
              ))}
            </nav>
          </div>

          <div className="hidden lg:flex items-center gap-8">
            <Button
              variant="outline"
              className="h-14 rounded-md text-[13px] pr-12! font-bold uppercase tracking-[0.2em] shadow-[0_20px_60px_rgba(204,97,28,0.2)] hover:bg-primary/90"
              asChild
            >
              <a href={company.whatsappHref} target="_blank" rel="noreferrer">
                Fale com a nossa equipe
                <ArrowUpRight className="size-5" />
              </a>
            </Button>
          </div>

          <div className="flex items-center lg:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  aria-label="Menu de navegacao"
                  className="h-11 w-11 flex items-center justify-center rounded-md border border-border bg-secondary/80 backdrop-blur-sm text-foreground hover:bg-secondary/90 transition-colors shadow-xs"
                >
                  <Menu className="size-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85vw] sm:max-w-sm bg-background/98 backdrop-blur-xl border-l border-white/10 p-0 flex flex-col">
                <div className="flex flex-col h-full">
                  <SheetHeader className="p-6 border-b border-white/5">
                    <SheetTitle className="text-left">
                      <Image
                        src="/images/logos/logo-light.png"
                        alt="Logo da Dema"
                        className="object-contain h-5"
                        width={100}
                        height={100}
                      />
                    </SheetTitle>
                  </SheetHeader>

                  <nav className="flex flex-col py-6">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        target={link.target}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "px-6 py-4 text-xs font-semibold tracking-[0.2em] uppercase transition-colors border-l-4",
                          link.href === pathname
                            ? "text-foreground border-primary bg-primary/5"
                            : "text-muted-foreground border-transparent hover:text-foreground hover:bg-white/5"
                        )}
                      >
                        {link.text}
                      </Link>
                    ))}
                  </nav>

                  <div className="mt-auto p-6 border-t border-white/5">
                    <Button
                      className="w-full h-14 rounded-md text-xs font-bold uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(204,97,28,0.15)]"
                      asChild
                    >
                      <a href={company.whatsappHref} target="_blank" rel="noreferrer">
                        Orçamento gratuito
                      </a>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
