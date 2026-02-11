import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const heroData = {
  imageSrc: "/images/hero/banner_gattaz_livdesign1.jpg",
  title: "GR LIVING DESIGN VILA MADALENA",
  description:
    "Uma torre residencial de alto padrão, desenvolvida com a parceria inédita entre a Gattaz empreendimentos e a Dema Instalações.",
  link: "/contato",
  linkText: "CONHECER",
};

export function HeroSection() {
  return (
    <section className="relative w-full h-[590px] overflow-hidden">
      {/* Background Image */}
      <Image
        src={heroData.imageSrc}
        alt={heroData.title}
        fill
        className="object-cover"
        priority
      />
      {/* Darkening Overlay for text contrast */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Content */}
      <div className="relative h-full flex items-center justify-start">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl p-8">
            <h1 className="text-white text-4xl md:text-5xl font-semibold mb-5 uppercase tracking-wide">
              {heroData.title}
            </h1>
            <p className="text-gray-200 text-lg md:text-xl leading-relaxed">
              {heroData.description}
            </p>
            <Button
              asChild
              size="lg"
              className="mt-8 uppercase font-bold tracking-wider bg-primary hover:bg-primary/90 text-primary-foreground rounded-sm"
            >
              <Link href={heroData.link}>{heroData.linkText}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
