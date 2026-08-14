import { allCases } from "@/content/cases";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { JsonLd } from "@/components/seo/json-ld";
import { caseArticleJsonLd, pageMetadata } from "@/lib/seo";

interface CasePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return allCases.map((c) => ({
    slug: c.slug,
  }));
}

export async function generateMetadata({
  params,
}: CasePageProps): Promise<Metadata> {
  const p = await params;
  const caseData = allCases.find((c) => c.slug === p.slug);
  if (!caseData) return {};

  return pageMetadata({
    title: `${caseData.title} | Portfolio Dema Instalações`,
    description: caseData.summary,
    path: `/cases/${caseData.slug}`,
    image: caseData.coverImage,
  });
}

export default async function CasePage({ params }: CasePageProps) {
  const p = await params;
  const caseData = allCases.find((c) => c.slug === p.slug);

  if (!caseData) {
    notFound();
  }

  return (
    <>
      <JsonLd data={caseArticleJsonLd(caseData)} />

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
            alt={`${caseData.title} — ${caseData.neighborhood}, São Paulo`}
            fill
            priority
            className="object-cover object-center"
          />
        </div>
      </section>

      {/* Ficha Executiva + Galeria */}
      <section className="section-space">
        <div className="shell grid gap-10 lg:grid-cols-[minmax(280px,1fr)_2fr] lg:items-start">
          <div className="text-sm lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow text-primary">Ficha Executiva</p>
            <dl className="mt-8 space-y-6">
              <div className="border-t border-border pt-4">
                <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Empreendimento
                </dt>
                <dd className="mt-2 text-base text-foreground">
                  {caseData.title}
                </dd>
              </div>
              <div className="border-t border-border pt-4">
                <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Parceiro / Cliente
                </dt>
                <dd className="mt-2 text-base text-foreground">
                  {caseData.partner.name}
                </dd>
              </div>
              <div className="border-t border-border pt-4">
                <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Segmento
                </dt>
                <dd className="mt-2 text-base text-foreground">
                  {caseData.segment}
                </dd>
              </div>
              <div className="border-t border-border pt-4">
                <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Localização
                </dt>
                <dd className="mt-2 text-base text-foreground">
                  {caseData.neighborhood}
                </dd>
              </div>
              <div className="border-t border-border pt-4">
                <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Status
                </dt>
                <dd className="mt-2 text-base text-foreground">
                  {caseData.status}
                </dd>
              </div>
            </dl>
          </div>

          {caseData.galleryImages.length > 0 && (
            <div className="columns-1 gap-6 space-y-6 sm:columns-2">
              {caseData.galleryImages.map((img, i) => (
                <div
                  key={i}
                  className="mb-6 break-inside-avoid overflow-hidden rounded-md border border-border/50 bg-secondary"
                >
                  <img
                    src={img}
                    alt={`${caseData.title} — registro ${i + 1} das instalações em ${caseData.neighborhood}`}
                    className="h-auto w-full object-cover transition duration-700 hover:scale-[1.02]"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
