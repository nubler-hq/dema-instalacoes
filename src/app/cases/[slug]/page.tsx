import { allCases } from "@/content/cases";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { ArrowRight, CheckIcon } from "lucide-react";
import { company } from "@/content/site-content";

interface CasePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return allCases.map((c) => ({
    slug: c.slug,
  }));
}

export async function generateMetadata({ params }: CasePageProps): Promise<Metadata> {
  const p = await params;
  const caseData = allCases.find((c) => c.slug === p.slug);
  if (!caseData) return {};

  return {
    title: `${caseData.title} | Portfolio Dema Instalações`,
    description: caseData.summary,
    openGraph: {
      images: [caseData.coverImage],
    },
  };
}

export default async function CasePage({ params }: CasePageProps) {
  const p = await params;
  const caseData = allCases.find((c) => c.slug === p.slug);

  if (!caseData) {
    notFound();
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: `Case Dema Instalações: ${caseData.title}`,
            image: [caseData.coverImage],
            author: {
              "@type": "Organization",
              name: company.displayName,
            },
            publisher: {
              "@type": "Organization",
              name: company.displayName,
              logo: {
                "@type": "ImageObject",
                url: "https://demainstalacoes.com.br/logo.png",
              },
            },
            description: caseData.summary,
          }),
        }}
      />

      {/* Hero Section */}
      <section className="relative isolate">
        <div className="shell z-10 pt-24! lg:pt-32!">
          <div className="max-w-4xl pb-10">
            <Link
              href="/cases"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground transition hover:text-foreground"
            >
              <ArrowRight className="size-4 rotate-180" />
              Retornar aos cases
            </Link>

            <h1 className="reveal-up reveal-delay-1 section-title">
              {caseData.title}
            </h1>
            <p className="reveal-up reveal-delay-3 mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              {caseData.summary}
            </p>
          </div>
        </div>

        <div className="relative aspect-[16/9] md:aspect-[21/9] w-full bg-secondary">
          <Image
            src={caseData.coverImage}
            alt={caseData.title}
            fill
            priority
            className="object-cover object-center"
          />
        </div>
      </section>

      {/* Ficha Técnica */}
      <section className="section-space">
        <div className="shell grid gap-10 lg:grid-cols-[1fr_2fr]">
          <div className="text-sm">
            <p className="eyebrow text-primary">Ficha Executiva</p>
            <dl className="mt-8 space-y-6">
              <div className="border-t border-border pt-4">
                <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Empreendimento</dt>
                <dd className="mt-2 text-base text-foreground">{caseData.title}</dd>
              </div>
              <div className="border-t border-border pt-4">
                <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Parceiro / Cliente</dt>
                <dd className="mt-2 text-base text-foreground">{caseData.partner.name}</dd>
              </div>
              <div className="border-t border-border pt-4">
                <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Segmento</dt>
                <dd className="mt-2 text-base text-foreground">{caseData.segment}</dd>
              </div>
              <div className="border-t border-border pt-4">
                <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Localização</dt>
                <dd className="mt-2 text-base text-foreground">{caseData.neighborhood}</dd>
              </div>
              <div className="border-t border-border pt-4">
                <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Status</dt>
                <dd className="mt-2 text-base text-foreground">{caseData.status}</dd>
              </div>
            </dl>
          </div>

          <div className="space-y-16 pl-0 lg:pl-10">
            <div>
              <h2 className="text-2xl font-display text-foreground">O Desafio</h2>
              <p className="mt-4 text-base leading-8 text-muted-foreground">
                {caseData.challenge}
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-display text-foreground">A Solução</h2>
              <p className="mt-4 text-base leading-8 text-muted-foreground">
                {caseData.solution}
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-display text-foreground">Resultados Alcançados</h2>
              <ul className="mt-6 space-y-4">
                {caseData.results.map((result, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <CheckIcon className="size-4" />
                    </span>
                    <span className="text-base leading-7 text-muted-foreground">
                      {result}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Galeria */}
      {caseData.galleryImages.length > 1 && (
        <section className="section-space pt-0">
          <div className="shell">
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              {caseData.galleryImages.map((img, i) => (
                <div key={i} className="relative w-full overflow-hidden rounded-md border border-border/50 bg-secondary">
                  <img src={img} alt={`${caseData.title} galeria ${i + 1}`} className="w-full h-auto object-cover hover:scale-[1.02] transition duration-700" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
