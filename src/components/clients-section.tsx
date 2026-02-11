"use client";

import * as React from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const clientsData = [
  { name: "Gattaz", logoSrc: "/images/clients/logo-01.png" },
  { name: "Stog", logoSrc: "/images/clients/logo-02.png" },
  { name: "CGS", logoSrc: "/images/clients/logo-03.png" },
  { name: "Fairbanks Morse", logoSrc: "/images/clients/logo-08.png" },
  { name: "Marabraz", logoSrc: "/images/clients/logo-09.png" },
  // Duplicate for a smoother loop
  { name: "Gattaz", logoSrc: "/images/clients/logo-01.png" },
  { name: "Stog", logoSrc: "/images/clients/logo-02.png" },
  { name: "CGS", logoSrc: "/images/clients/logo-03.png" },
  { name: "Fairbanks Morse", logoSrc: "/images/clients/logo-08.png" },
  { name: "Marabraz", logoSrc: "/images/clients/logo-09.png" },
];

export function ClientsSection() {
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true }),
  );

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Headline */}
        <div className="text-center mb-16">
          <h3 className="text-2xl font-semibold tracking-tight text-foreground uppercase border-b-2 border-border pb-4">
            ALGUNS DE NOSSOS CLIENTES
          </h3>
        </div>

        {/* Logo Carousel */}
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[plugin.current]}
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
          className="w-full max-w-6xl mx-auto"
        >
          <CarouselContent className="-ml-8">
            {clientsData.map((client, index) => (
              <CarouselItem
                key={index}
                className="pl-8 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
              >
                <div className="flex items-center justify-center h-24 p-4">
                  <div className="relative h-12 w-36">
                    <Image
                      src={client.logoSrc}
                      alt={client.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </div>
    </section>
  );
}
