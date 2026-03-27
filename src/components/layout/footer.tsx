import Link from "next/link";
import { company } from "@/content/site-content";
import Image from "next/image";

export function Footer() {
  return (
    <>
      <section className="bg-[color:var(--surface-strong)] text-primary-foreground">
        <div className="shell border-border/20 section-space flex flex-col">
          <div>
            <h2 className="section-title text-primary-foreground! max-w-2xl!">
              Tenha o acompanhamento técnico que o seu empreendimento merece.
            </h2>
            <p className="mt-4 text-lg leading-8 text-primary-foreground/60">
              Acompanhamento técnico, documentação contínua e foco no avanço físico que clientes de ponta exigem.
            </p>
          </div>
          <div className="flex items-center flex-wrap gap-4 mt-12">
            <Link
              href={company.whatsappHref}
              target="_blank"
              className="inline-flex h-12 items-center justify-center rounded-md border border-white/10 bg-primary px-8 text-sm font-semibold uppercase tracking-[0.2em] transition-colors hover:bg-white/10"
            >
              Falar com a equipe
            </Link>
            <Link
              href="/cases"
              className="inline-flex text-sm font-semibold uppercase tracking-[0.2em] transition-colors"
            >
              Conhecer os cases
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-[color:var(--surface-strong)] border-t border-border/20 text-white">
        <div className="shell section-space pb-6! border-white/10 pt-12">
          <div className="grid gap-12 pb-12 lg:grid-cols-[1fr_0.8fr]">
            <div className="space-y-6">
              <div className="relative h-10 w-[150px]">
                <Image
                  src="/images/logos/logo-full-white.png"
                  alt="Logo da Dema Instalações"
                  fill
                  className="object-contain object-left"
                />
              </div>
              <p className="max-w-xl text-sm leading-7 text-white/68">
                {company.tagline} Atuação voltada a empreendimentos urbanos,
                retrofit e operações que pedem confiança de campo.
              </p>
            </div>
            <div className="ml-auto">
              <p className="eyebrow">Contato</p>
              <div className="mt-4 space-y-4 text-sm text-white/68">
                <p>{company.address}</p>
                <a
                  href={company.phoneHref}
                  className="block transition hover:text-white"
                >
                  {company.phoneDisplay}
                </a>
                <a
                  href={`mailto:${company.email}`}
                  className="block transition hover:text-white"
                >
                  {company.email}
                </a>
                <Link href="/contato" className="block transition hover:text-white">
                  Solicite um contato
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="shell border-t border-white/10 pb-6">
          <div className="flex flex-col gap-3 pt-6 text-xs text-white/42 sm:flex-row sm:items-center sm:justify-between">
            <p>
              {company.displayName} ©{new Date().getFullYear()}. Todos os
              direitos reservados.
            </p>
            <p>
              <a
                href="http://nubler.com.br/"
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-white"
              >
                Website e tecnologia por Nubler
              </a>
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
