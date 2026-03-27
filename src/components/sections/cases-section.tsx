"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { featuredCases } from "@/content/site-content";
import { Button } from "../ui/button";

export function CasesSection() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return (
    <section className="overflow-hidden">
      <div className="shell section-space pb-0!">
        {/* Header with Navigation */}
        <div className="mb-12 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <p className="eyebrow text-primary/80">Cases em destaque</p>
            <h2 className="section-title mt-5">
              Empreendimentos que mostram a atuação da Dema Instalações em São Paulo.
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-md border border-secondary/10 bg-secondary px-1.5 h-12 backdrop-blur-sm">
              <button
                onClick={() => api?.scrollPrev()}
                className="flex size-8 items-center justify-center rounded-full transition-colors hover:bg-foreground/10 disabled:opacity-30"
                disabled={!api?.canScrollPrev()}
              >
                <ChevronLeft className="size-4" />
              </button>

              <div className="flex gap-1.5 px-1">
                {Array.from({ length: count }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1 rounded-full transition-all duration-300",
                      current === i + 1 ? "w-6 bg-foreground" : "w-1 bg-foreground/20"
                    )}
                  />
                ))}
              </div>

              <button
                onClick={() => api?.scrollNext()}
                className="flex size-8 items-center justify-center rounded-full transition-colors hover:bg-foreground/10 disabled:opacity-30"
                disabled={!api?.canScrollNext()}
              >
                <ChevronRight className="size-4" />
              </button>
            </div>

            <Button variant="secondary" className="h-12" asChild>
              <Link
                href="/cases"
              >
                Explorar todos os cases
                <div className="flex size-8 items-center justify-center rounded-full border border-secondary/20 transition-all group-hover:border-secondary/40 group-hover:bg-secondary/5">
                  <ChevronRight className="size-4" />
                </div>
              </Link>
            </Button>
          </div>
        </div>

        {/* Carousel */}
        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            loop: false,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4 md:-ml-6">
            {featuredCases.map((project) => (
              <CarouselItem
                key={project.slug}
                className="pl-4 md:basis-1/2 md:pl-6 lg:basis-1/3"
              >
                <Link href={`/cases/${project.slug}`} className="group block">
                  {/* Top Text Info */}
                  <div className="mb-8 space-y-1">
                    <h3 className="font-display text-3xl leading-[1.1] text-muted-foreground transition-colors group-hover:text-foreground sm:text-4xl">
                      {project.title}
                    </h3>
                    <p className="text-[0.6rem] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                      {project.segment} • {project.neighborhood}
                    </p>
                  </div>

                  {/* Image Card */}
                  <div className="relative aspect-[4/5] overflow-hidden rounded-md border border-secondary/10 bg-secondary/10 shadow-md transition-all duration-500 hover:shadow-primary/10">
                    <Image
                      src={project.coverImage}
                      alt={project.title}
                      fill
                      className="object-cover transition-all duration-700 group-hover:scale-105"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-40" />

                    {/* Link Icon Indicator */}
                    <div
                      className="absolute top-6 right-6 z-20 flex size-10 items-center justify-center rounded-full bg-secondary/10 text-secondary backdrop-blur-md transition-all duration-300 group-hover:bg-primary group-hover:text-secondary group-hover:scale-110"
                    >
                      <ArrowUpRight className="size-5" />
                    </div>

                    {/* Bottom Info (Summary) - Visible on hover or peek */}
                    <div className="absolute inset-x-0 bottom-0 p-8 transform translate-y-2 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                      <p className="line-clamp-2 text-sm leading-relaxed text-secondary/90">
                        {project.summary}
                      </p>
                    </div>
                  </div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}
