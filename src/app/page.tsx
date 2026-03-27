import { Button } from "@/components/ui/button";
import {
  authorityStats,
  company,
  partnerLogos,
  services,
} from "@/content/site-content";
import { CasesSection } from "@/components/sections/cases-section";
import { ProcessSection } from "@/components/sections/process-section";
import { ArrowRight, ArrowUpRight, CheckIcon, CheckSquare2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <>
      <section className="relative border-b bg-[#e8e2d1]! isolate min-h-[calc(84svh-64px)] overflow-hidden bg-[color:var(--secondary)] sm:min-h-[calc(100svh-73px)]">
        <Image
          src="/images/hero/hero-xray-sepia.jpg"
          alt="Esboço tecnico das instalacoes prediais Dema"
          fill
          priority
          className="object-contain object-right-top opacity-20"
        />

        <div className="shell relative flex border-r min-h-[calc(84svh-64px)] items-end py-10 sm:min-h-[calc(100svh-73px)] sm:py-16 lg:py-18">
          <div className="grid w-full gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end lg:gap-12">
            <div className="max-w-4xl">
              <p className="eyebrow reveal-up">Engenharia Predial Desde 2006</p>
              <h1 className="reveal-up reveal-delay-1 section-title">
                Elétrica, Hidráulica e SPDA com 100% de conformidade para garantir a previsibilidade total em obras de alto padrão.
              </h1>
              <div className="reveal-up reveal-delay-3 mt-10 flex flex-col gap-4 sm:flex-row">
                <Button
                  className="h-12 rounded-md bg-primary px-6 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground hover:bg-primary/90"
                  asChild
                >
                  <a href={company.whatsappHref} target="_blank" rel="noreferrer">
                    Solicite um orcamento
                    <ArrowUpRight className="size-4" />
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="h-12 rounded-md border-border/20 bg-white/6 px-6 text-xs font-semibold uppercase tracking-[0.2em] hover:bg-white hover:text-[color:var(--surface-strong)]"
                  asChild
                >
                  <Link href="/cases">
                    Ver cases
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b">
        <div className="shell section-space pb-8!">
          <div className="flex flex-col gap-10 text-left lg:items-start">
            <div>
              <p className="eyebrow">Rigor Executivo</p>
              <h2 className="section-title mt-5 max-w-lg">
                Projetos complexos exigem engenharia de precisão, cumprimento estrito de prazos e aderência normativa.
              </h2>
            </div>
          </div>
        </div>
        <div className="shell border-t py-0!">
          <div className="grid sm:grid-cols-3 gap-6 divide-x divide-border" style={{ verticalAlign: "bottom" }}>
            {authorityStats.map((stat) => (
              <div key={stat.value} className="py-5">
                <p className="font-display text-5xl text-foreground">
                  {stat.value}
                </p>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b">
        <div className="shell section-space">
          <div>
            <p className="eyebrow">Escopo de Operação</p>
            <h2 className="section-title mt-5">
              Infraestrutura crítica projetada sob os maiores níveis de exigência.
            </h2>
            <p className="mt-6 max-w-md text-sm leading-7 text-muted-foreground">
              Do projeto minucioso do centro de medição às redes hídricas e proteção de incêndio robustas, nossa operação une montagem impecável em campo a laudos certificadores incontestáveis baseados puramente na engenharia de resultados.
            </p>
          </div>

          <div className="grid md:grid-cols-2 border rounded-md mt-12 bg-secondary/50">
            {services.map((service, index) => (
              <article
                key={service.slug}
                className={cn(
                  "flex flex-col gap-4 p-8",
                  (index === 0 || index === 2) && "border-r",
                  (index === 0 || index === 1) && "border-b",
                )}
              >
                <div>
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-primary">
                    {service.slug.replace(/-/g, " ")}
                  </p>
                  <h3 className="mt-3 font-display text-2xl text-foreground">
                    {service.title}
                  </h3>
                </div>
                <div>
                  <p className="max-w-xl text-sm leading-7 text-muted-foreground">
                    {service.summary}
                  </p>
                  <div className="mt-5 flex flex-col gap-2">
                    {service.deliverables.map((item) => (
                      <p
                        key={item}
                        className="flex items-center gap-2 text-sm text-foreground/82"
                      >
                        <CheckIcon className="size-4" />
                        {item}
                      </p>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CasesSection />

      <ProcessSection />

      <section>
        <div className="shell section-space">
          <div className="flex flex-col gap-6">
            <div>
              <p className="eyebrow">Chancela Institucional</p>
              <h2 className="section-title">
                A sustentação estrutural das frentes mais emblemáticas do Brasil.
              </h2>
            </div>
            <p className="text-muted-foreground max-w-2xl leading-relaxed text-lg reveal-up reveal-delay-2">
              A competência da Dema é atestada por incorporadoras de elite. Uma presença de infraestrutura tática em múltiplos centros geográficos voltada à exclusão de atrasos operacionais ou contingênciamentos de cronograma.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {partnerLogos.map((logo) => (
              <div
                key={logo}
                className="relative flex h-22 items-center justify-center rounded-md border border-border bg-white/70 px-5"
              >
                <Image
                  src={logo}
                  alt="Marca parceira ou cliente"
                  fill
                  className="object-contain p-5 opacity-75 grayscale"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
