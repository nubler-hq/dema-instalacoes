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
          <div className="hidden lg:block relative mx-auto aspect-video sm:aspect-[21/9] w-full rounded-t-md bg-primary/50 border-x border-t border-border overflow-hidden shadow-sm -mb-px">
            <Image
              src="/images/about/engineers-lifestyle.jpg"
              alt="Engenheiros da Dema em Campo"
              fill
              className="object-cover transition-all duration-700 hover:scale-[1.03] grayscale opacity-80"
            />
          </div>
        </div>
      </section>

      {/* MVV Section */}
      <section>
        <div className="shell section-space">
          <div className="grid gap-12 lg:grid-cols-3 sm:text-left divide-y sm:divide-y-0 sm:divide-x divide-border/20 text-center">
            <div className="flex flex-col items-center sm:items-start">
              <Target className="size-8 text-primary mb-6" />
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.25em] text-foreground/50 mb-4">Missão</p>
              <h3 className="section-title mb-4 text-3xl! font-semibold">Soluções e Eficiência</h3>
              <p className="text-secondary-foreground leading-relaxed text-sm max-w-sm">
                Atender nossos clientes com excelência, buscando soluções inovadoras para cada projeto que conciliem agilidade e economia sem jamais comprometer a qualidade técnica e a segurança.
              </p>
            </div>
            <div className="flex flex-col items-center sm:items-start">
              <Eye className="size-8 text-primary mb-6" />
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.25em] text-foreground/50 mb-4">Visão</p>
              <h3 className="section-title mb-4 text-3xl! font-semibold">Referência Técnica</h3>
              <p className="text-secondary-foreground leading-relaxed text-sm max-w-sm">
                Consolidar a trajetória de quase duas décadas no mercado como a principal autoridade em instalações elétricas e hidráulicas, sendo reconhecida pelo melhor custo-benefício e rigor normativo.
              </p>
            </div>
            <div className="flex flex-col items-center sm:items-start">
              <ShieldCheck className="size-8 text-primary mb-6" />
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.25em] text-foreground/50 mb-4">Valores</p>
              <h3 className="section-title mb-4 text-3xl! font-semibold">Comprometimento</h3>
              <p className="text-secondary-foreground leading-relaxed text-sm max-w-sm">
                Pautamos nossa atuação em uma equipe altamente especializada, agilidade operacional, conformidade técnica irrestrita e transparência absoluta em cada entrega e manutenção.
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
            <div className="hidden lg:block relative h-full min-h-[400px] w-full overflow-hidden rounded-md border border-border bg-primary/50 shadow-sm">
              <Image
                src="/images/about/team-meeting.jpg"
                alt="Equipe de engenheiros Dema em reunião"
                fill
                className="object-cover opacity-60 transition-all duration-700 hover:scale-105 grayscale"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
