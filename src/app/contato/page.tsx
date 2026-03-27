import { Button } from "@/components/ui/button";
import { company } from "@/content/site-content";
import { ArrowUpRight } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="section-space">
      <div className="shell grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
        <div>
          <p className="eyebrow">Contato</p>
          <h1 className="section-title mt-5">
            Fale com a Dema sobre instalações, laudos, medições ou manutenção.
          </h1>
          <p className="mt-6 max-w-lg text-sm leading-7 text-muted-foreground">
            Atendimento direto para entrada de energia, SPDA, cabine primária,
            combate a incêndio, quadros elétricos, CFTV, cabeamento e suporte
            técnico em campo.
          </p>
          <div className="mt-8 space-y-4 text-sm leading-7 text-muted-foreground">
            <p>{company.address}</p>
            <a
              href={company.phoneHref}
              className="block transition hover:text-foreground"
            >
              {company.phoneDisplay}
            </a>
            <a
              href={`mailto:${company.email}`}
              className="block transition hover:text-foreground"
            >
              {company.email}
            </a>
          </div>
          <Button
            className="mt-8 h-12 rounded-md bg-primary px-6 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground hover:bg-primary/90"
            asChild
          >
            <a href={company.whatsappHref} target="_blank" rel="noreferrer">
              Falar pelo WhatsApp
              <ArrowUpRight className="size-4" />
            </a>
          </Button>
        </div>

        <section className="rounded-[2rem] border border-border bg-white/80 p-8 sm:p-10">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-primary">
            Briefing inicial
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2 text-sm text-foreground">
              Nome
              <input
                className="h-12 rounded-md border border-border bg-background px-5"
                placeholder="Seu nome"
              />
            </label>
            <label className="grid gap-2 text-sm text-foreground">
              Empresa
              <input
                className="h-12 rounded-md border border-border bg-background px-5"
                placeholder="Empresa ou incorporadora"
              />
            </label>
            <label className="grid gap-2 text-sm text-foreground">
              Telefone
              <input
                className="h-12 rounded-md border border-border bg-background px-5"
                placeholder="(11) 99999-9999"
              />
            </label>
            <label className="grid gap-2 text-sm text-foreground">
              Tipo de projeto
              <input
                className="h-12 rounded-md border border-border bg-background px-5"
                placeholder="Residencial, retrofit, institucional..."
              />
            </label>
            <label className="grid gap-2 text-sm text-foreground sm:col-span-2">
              Escopo
              <textarea
                className="min-h-36 rounded-[1.5rem] border border-border bg-background px-5 py-4"
                placeholder="Conte o contexto do projeto, prazo e disciplina principal."
              />
            </label>
          </div>
          <Button
            className="mt-8 h-12 rounded-md bg-[color:var(--surface-strong)] px-6 text-xs font-semibold uppercase tracking-[0.2em] text-white hover:bg-[color:color-mix(in_oklab,var(--surface-strong)_88%,black)]"
            type="button"
          >
            Solicitar contato
          </Button>
        </section>
      </div>
    </div>
  );
}
