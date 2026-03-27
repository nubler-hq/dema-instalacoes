import type { Metadata } from "next";
import {
  authorityStats,
  serviceCatalog,
  services,
} from "@/content/site-content";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Serviços | Dema Instalações",
  description:
    "Instalações elétricas, hidráulicas, combate a incêndio, SPDA, cabine primária e documentação técnica para obras em São Paulo.",
};

export default function ServicesPage() {
  return (
    <>
      {/* ─── Hero ──────────────────────────────────────────────────── */}
      <section>
        <div className="shell pt-24! lg:pt-32!">
          <p className="eyebrow text-primary text-sm font-semibold uppercase tracking-widest">
            Serviços
          </p>
          <h1 className="reveal-up reveal-delay-1 section-title">
            O rigor técnico que seu empreendimento merece para se tornar realidade.
          </h1>
          <p className="reveal-up reveal-delay-3 mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Cada projeto é único. Mas, nossa abordagem combina planejamento detalhado, execução precisa e acompanhamento contínuo para garantir que cada instalação atenda às necessidades específicas do seu empreendimento.
          </p>
        </div>
      </section>

      {/* ─── Authority strip ───────────────────────────────────────── */}
      <section className="border-y">
        <div className="shell py-0!">
          <div className="grid sm:grid-cols-3">
            {authorityStats.map((stat, index) => (
              <div
                key={stat.value}
                className={cn(
                  "py-5",
                  index > 0 && "lg:border-l border-border lg:pl-12",
                )}
              >
                <p className="font-display text-5xl text-foreground">
                  {stat.value}
                </p>
                <p className="mt-3 max-w-xs text-sm leading-7 text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Services 01–04 ────────────────────────────────────────── */}
      <section>
        <div className="shell">
          <div className="mb-14 flex flex-col gap-6">
            <div>
              <p className="eyebrow">O que a Dema executa</p>
              <h2 className="section-title mt-5 max-w-xl">
                Quatro especialidades. Uma operação integrada.
              </h2>
            </div>
            <p className="max-w-lg text-sm leading-7 text-muted-foreground lg:pb-1">
              Do centro de medição ao combate a incêndio, cada frente de
              atuação combina execução de campo, montagem, manutenção e
              documentação técnica entregues em conjunto.
            </p>
          </div>

          <div>
            {services.map((service, index) => (
              <article
                key={service.slug}
                className="group grid items-start gap-6 border-t border-border py-10 lg:grid-cols-[64px_1fr_1.6fr] lg:gap-14 lg:py-14"
              >
                <p className="hidden font-display text-5xl leading-none text-primary/18 transition-colors duration-300 group-hover:text-primary/38 lg:block">
                  0{index + 1}
                </p>

                <div>
                  <p className="eyebrow">{service.category}</p>
                  <h3 className="mt-3 font-display text-xl leading-tight text-foreground lg:text-2xl">
                    {service.title}
                  </h3>
                </div>

                <div>
                  <p className="text-sm leading-7 text-muted-foreground">
                    {service.summary}
                  </p>
                  <ul className="mt-6 space-y-2.5">
                    {service.deliverables.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-3 text-sm text-foreground/80"
                      >
                        <span className="h-px w-5 shrink-0 bg-primary/45" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Full scope list ───────────────────────────────────────── */}
      <section className="bg-secondary">
        <div className="shell">
          <div className="mb-12 flex flex-col gap-6">
            <div>
              <p className="eyebrow">Escopo completo</p>
              <h2 className="section-title mt-5 max-w-xl">
                Todas as especialidades disponíveis.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-7 text-muted-foreground lg:pb-1">
              Além dos quatro pilares principais, a Dema atua em um espectro
              técnico completo de instalações e regularizações prediais.
            </p>
          </div>

          <div className="grid border-t border-border sm:grid-cols-2 lg:grid-cols-3">
            {serviceCatalog.map((item) => (
              <div
                key={item.title}
                className="flex items-center gap-3 border-b border-border py-5 pr-6 text-sm font-medium text-foreground"
              >
                <span className="shrink-0 text-primary/55">—</span>
                {item.title}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
