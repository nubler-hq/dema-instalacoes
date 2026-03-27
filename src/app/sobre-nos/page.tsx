import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ArrowRight, Target, Eye, ShieldCheck } from "lucide-react";
import { company } from "@/content/site-content";

export const metadata: Metadata = {
  title: "Sobre a Dema | Engenharia de Instalações Prediais Premium",
  description:
    "Conheça a história, visão e o time por trás da Dema Instalações. Referência em execução técnica e manutenção predial desde 2006 em São Paulo.",
};

export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="border-b overflow-hidden">
        <div className="shell pt-24! lg:pt-32! pb-0!">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <p className="eyebrow text-primary text-sm font-semibold uppercase tracking-widest">
              Identidade Institucional
            </p>
            <h1 className="reveal-up reveal-delay-1 section-title">
              Engenharia de instalações orientada à exclusão da imprevisibilidade.
            </h1>
            <p className="reveal-up reveal-delay-3 mt-6 text-lg leading-8 text-muted-foreground lg:max-w-2xl">
              A Dema atua como base técnica fundamental para empreendimentos de alto padrão em São Paulo desde 2006. Execução rigorosa, laudos incontestáveis e transparência total em cada projeto.
            </p>
            <div className="mt-10 mb-20 lg:mb-24">
              <Button className="h-12 px-6" asChild>
                <Link href={company.whatsappHref} target="_blank">
                  Falar com um Especialista
                  <ArrowUpRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="relative mx-auto aspect-video sm:aspect-[21/9] w-full rounded-t-md border-x border-t border-border bg-secondary/10 overflow-hidden shadow-sm -mb-px">
            <Image
              src="/images/about/engineers-lifestyle.png"
              alt="Engenheiros da Dema em Campo"
              fill
              className="object-cover opacity-90 transition-all duration-700 hover:scale-[1.03]"
            />
          </div>
        </div>
      </section>

      {/* MVV Section */}
      <section>
        <div className="shell section-space">
          <div className="grid gap-12 lg:grid-cols-3 sm:text-left divide-y sm:divide-y-0 sm:divide-x divide-border/20 text-center">
            <div className="pt-8 sm:pt-0 sm:pr-8 lg:pr-12 flex flex-col items-center sm:items-start">
              <Target className="size-8 text-primary mb-6" />
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.25em] text-foreground/50 mb-4">Missão</p>
              <h3 className="section-title mb-4 text-3xl! font-semibold">O Esqueleto Vital</h3>
              <p className="text-secondary-foreground/80 leading-relaxed text-sm max-w-sm">
                Projetar e executar a infraestrutura predial de alto padrão em São Paulo, entregando sistemas elétricos e hidráulicos que superem os mais rigorosos crivos construtivos.
              </p>
            </div>
            <div className="pt-8 sm:pt-0 sm:px-8 lg:px-12 flex flex-col items-center sm:items-start">
              <Eye className="size-8 text-primary mb-6" />
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.25em] text-foreground/50 mb-4">Visão</p>
              <h3 className="section-title mb-4 text-3xl! font-semibold">A Previsibilidade</h3>
              <p className="text-secondary-foreground/80 leading-relaxed text-sm max-w-sm">
                Ser o padrão definitivo de eficiência no mercado civil, garantindo uma instalação impecável, zero atrasos por incompatibilidades e previsibilidade absoluta em sua entrega.
              </p>
            </div>
            <div className="pt-8 sm:pt-0 sm:pl-8 lg:pl-12 flex flex-col items-center sm:items-start">
              <ShieldCheck className="size-8 text-primary mb-6" />
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.25em] text-foreground/50 mb-4">Valores</p>
              <h3 className="section-title mb-4 text-3xl! font-semibold">Rigor Inegociável</h3>
              <p className="text-secondary-foreground/80 leading-relaxed text-sm max-w-sm">
                Zelar pela primazia técnica em campo, rigor normativo indiscutível, transparência irrestrita no cronograma estipulado e profundo compromisso documental as-built em cada obra.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* Careers Section */}
      <section className="border-b">
        <div className="shell section-space">
          <div className="grid gap-6 md:grid-cols-2 lg:h-[600px]">
            {/* Left Card */}
            <div className="flex h-full flex-col justify-between rounded-md border border-border bg-card p-8 lg:p-12">
              <h2 className="section-title">
                Faça parte do<br />
                nosso time
              </h2>
              <div className="mt-20 flex flex-col items-start gap-6 sm:mt-auto">
                <p className="text-sm leading-7 text-muted-foreground">
                  Se você valoriza o rigor normativo tanto quanto o trabalho bem executado, confira nossas vagas e junte-se à linha de frente da Dema.
                </p>
                <Button className="rounded-md px-8 h-12" asChild>
                  <Link href="/trabalhe-conosco">
                    VAGAS ABERTAS <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right Card / Image */}
            <div className="relative h-full min-h-[400px] w-full overflow-hidden rounded-md border border-border bg-secondary/10 shadow-sm">
              <Image
                src="/images/about/team-meeting.png"
                alt="Equipe de engenheiros Dema em reunião"
                fill
                className="object-cover opacity-90 transition-all duration-700 hover:scale-105 grayscale hover:grayscale-0"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
