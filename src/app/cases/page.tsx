"use client";

import { allCases } from "@/content/site-content";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useState, useMemo } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CasesPage() {
  const [filter, setFilter] = useState("all");

  const filteredCases = useMemo(() => {
    if (filter === "all") return allCases;

    return allCases.filter((item) => {
      const segment = item.segment.toLowerCase();
      if (filter === "residencial") {
        return segment.includes("residencial") || segment.includes("residence");
      }
      if (filter === "comercial") {
        return segment.includes("comercial") || segment.includes("mixed-use") || segment.includes("corporativo");
      }
      if (filter === "industrial") {
        return segment.includes("industrial");
      }
      return true;
    });
  }, [filter]);

  return (
    <>
      <section>
        <div className="shell section-space pt-24! lg:pt-32!">
          <p className="eyebrow text-primary text-sm font-semibold uppercase tracking-widest">
            Cases de Sucesso
          </p>
          <h1 className="reveal-up reveal-delay-1 section-title">
            São <strong>+20 anos de experiência</strong> em instalações elétricas e hidráulicas.
          </h1>
          <p className="reveal-up reveal-delay-3 mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Uma seleção de projetos que demonstram nosso compromisso com a excelência técnica e a satisfação dos nossos clientes.
          </p>
        </div>
      </section>

      <section>
        <header className="shell pt-0! pb-2!">
          <h2 className="section-title reveal-up reveal-delay-3 text-xl! font-bold">Filtros</h2>
        </header>
        <div className="shell pt-0!">
          <Select value={filter} onValueChange={(value) => setFilter(value)}>
            <SelectTrigger className="lg:hidden bg-card h-12 w-full reveal-up reveal-delay-3">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="residencial">Residenciais</SelectItem>
              <SelectItem value="comercial">Comerciais</SelectItem>
              <SelectItem value="industrial">Industriais</SelectItem>
            </SelectContent>
          </Select>

          <ToggleGroup
            type="single"
            value={filter}
            onValueChange={(value) => {
              if (value) setFilter(value);
            }}
            variant="outline"
            className="lg:flex hidden reveal-up reveal-delay-3"
          >
            <ToggleGroupItem value="all" className="px-6 h-10 text-xs font-semibold uppercase tracking-widest">
              Todos
            </ToggleGroupItem>
            <ToggleGroupItem value="residencial" className="px-6 h-10 text-xs font-semibold uppercase tracking-widest">
              Residenciais
            </ToggleGroupItem>
            <ToggleGroupItem value="comercial" className="px-6 h-10 text-xs font-semibold uppercase tracking-widest">
              Comerciais
            </ToggleGroupItem>
            <ToggleGroupItem value="industrial" className="px-6 h-10 text-xs font-semibold uppercase tracking-widest">
              Industriais
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </section>

      <section className="border-y">
        <div className="shell section-space divide-y">
          {filteredCases.length > 0 ? (
            filteredCases.map((item, index) => (
              <article
                key={item.slug}
                className="grid gap-8 py-12 md:grid-cols-[200px_minmax(0,1fr)_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-16 group transition-all duration-500 animate-in fade-in slide-in-from-bottom-4"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    0{index + 1}
                  </p>
                  <Link href={`/cases/${item.slug}`}>
                    <h2 className="mt-4 font-display text-2xl text-foreground sm:text-3xl">
                      {item.title}
                    </h2>
                  </Link>
                  <p className="mt-2 text-sm uppercase tracking-wider text-primary">
                    {item.segment}
                  </p>

                  <div className="mt-8 space-y-3 text-sm text-foreground/80">
                    <div>
                      <span className="block text-xs uppercase text-muted-foreground tracking-wider mb-1">
                        Local
                      </span>
                      {item.neighborhood}
                    </div>
                    <div>
                      <span className="block text-xs uppercase text-muted-foreground tracking-wider mb-1">
                        Parceiro
                      </span>
                      {item.partner.name}
                    </div>
                    <div>
                      <span className="block text-xs uppercase text-muted-foreground tracking-wider mb-1">
                        Status
                      </span>
                      {item.status}
                    </div>
                  </div>
                </div>

                <Link
                  href={`/cases/${item.slug}`}
                  className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-secondary border border-border/50"
                >
                  <Image
                    src={item.coverImage}
                    alt={item.title}
                    fill
                    className="object-cover transition duration-1000 group-hover:scale-105"
                  />
                </Link>

                <div className="flex flex-col justify-between">
                  <div>
                    <p className="text-base leading-7 text-muted-foreground">
                      {item.summary}
                    </p>
                  </div>
                  <div className="mt-6">
                    <Link
                      href={`/cases/${item.slug}`}
                      className="inline-flex h-11 items-center gap-2 rounded-md bg-transparent px-0 font-semibold uppercase tracking-[0.2em] text-xs text-foreground transition-colors hover:text-primary"
                    >
                      Estudar Case Completo
                      <ArrowRight className="size-4" />
                    </Link>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="py-20 text-center">
              <p className="text-muted-foreground">Nenhum case encontrado para esta categoria.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
