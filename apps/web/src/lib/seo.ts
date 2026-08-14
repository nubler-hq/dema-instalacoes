import type { Metadata } from "next";
import { company } from "@/content/site-content";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://demainstalacoes.com.br";

export const SITE_NAME = company.displayName;

export const DEFAULT_OG_IMAGE = "/images/hero/hero-xray-sepia.jpg";

export const DEFAULT_DESCRIPTION =
  "Empresa de instalações elétricas e hidráulicas em São Paulo. Entrada de energia, SPDA, cabine primária, combate a incêndio e execução para empreendimentos de alto padrão desde 2006.";

export function absoluteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

export function pageMetadata({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  noIndex = false,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  noIndex?: boolean;
}): Metadata {
  const url = absoluteUrl(path);

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      siteName: SITE_NAME,
      title,
      description,
      url,
      images: [
        {
          url: image,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: company.displayName,
        legalName: company.legalName,
        url: SITE_URL,
        logo: absoluteUrl("/images/logo.png"),
        email: company.email,
        telephone: company.phoneHref.replace("tel:", ""),
        foundingDate: "2006",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Av. Brigadeiro Luís Antônio, 3097",
          addressLocality: "São Paulo",
          addressRegion: "SP",
          addressCountry: "BR",
        },
        sameAs: [company.whatsappHref],
      },
      {
        "@type": "LocalBusiness",
        "@id": `${SITE_URL}/#localbusiness`,
        name: company.displayName,
        image: absoluteUrl(DEFAULT_OG_IMAGE),
        url: SITE_URL,
        telephone: company.phoneHref.replace("tel:", ""),
        email: company.email,
        foundingDate: "2006",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Av. Brigadeiro Luís Antônio, 3097",
          addressLocality: "Jardim Paulista",
          addressRegion: "SP",
          addressCountry: "BR",
        },
        areaServed: {
          "@type": "City",
          name: "São Paulo",
        },
        description: DEFAULT_DESCRIPTION,
      },
    ],
  };
}

export function caseArticleJsonLd(caseData: {
  title: string;
  summary: string;
  coverImage: string;
  slug: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `Case Dema Instalações: ${caseData.title}`,
    mainEntityOfPage: absoluteUrl(`/cases/${caseData.slug}`),
    image: [absoluteUrl(caseData.coverImage)],
    author: {
      "@type": "Organization",
      name: company.displayName,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: company.displayName,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/images/logo.png"),
      },
    },
    description: caseData.summary,
  };
}
