"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const projectsData = [
  {
    title: "The Week Rio",
    date: "March 2016",
    category: "comercial",
    imageSrc: "/images/projects/latest-project-01.jpg",
  },
  {
    title: "The Week SP",
    date: "February 2016",
    category: "comercial",
    imageSrc: "/images/projects/latest-project-02.jpg",
  },
  {
    title: "Centro de Distribuição Marabraz",
    date: "November 2015",
    category: "industrial",
    imageSrc: "/images/projects/latest-project-05.jpg",
  },
  {
    title: "Verticalli Verona",
    date: "January 2016",
    category: "comercial",
    imageSrc: "/images/projects/latest-project-03.jpg",
  },
  {
    title: "GR Living Design VL. Madalena",
    date: "December 2016",
    category: "residencial",
    imageSrc: "/images/projects/latest-project-04.jpg",
  },
  {
    title: "Atêlie Casa Branca",
    date: "November 2015",
    category: "comercial",
    imageSrc: "/images/projects/latest-project-06.jpg",
  },
  {
    title: "Top Tree Tower",
    date: "September 2015",
    category: "comercial",
    imageSrc: "/images/projects/latest-project-07.jpg",
  },
  {
    title: "Ed. Caminho das Indías",
    date: "September 2015",
    category: "comercial",
    imageSrc: "/images/projects/latest-project-08.jpg",
  },
];

type Category = "todos" | "residencial" | "comercial" | "industrial";

const filters: { label: string; value: Category }[] = [
  { label: "Todos", value: "todos" },
  { label: "RESIDENCIAIS", value: "residencial" },
  { label: "COMERCIAIS", value: "comercial" },
  { label: "INDUSTRIAIS", value: "industrial" },
];

export function ProjectsSection() {
  const [filter, setFilter] = React.useState<Category>("todos");

  const filteredProjects =
    filter === "todos"
      ? projectsData
      : projectsData.filter((p) => p.category === filter);

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Headline */}
        <div className="text-center mb-12">
          <h3 className="text-2xl font-semibold tracking-tight text-foreground uppercase">
            Nossos <span className="text-primary">Últimos Empreendimentos</span>
          </h3>
          <div className="mt-3 flex justify-center">
            <div className="w-16 h-1 bg-primary rounded-md" />
          </div>
        </div>

        {/* Filters */}
        <div className="flex justify-center mb-10 space-x-8">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "text-sm uppercase font-semibold tracking-wider transition-colors",
                filter === f.value
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid - full width */}
      <div className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0">
          {filteredProjects.map((project, index) => (
            <Link
              href="/obras"
              key={index}
              className="group relative block overflow-hidden h-60"
            >
              <Image
                src={project.imageSrc}
                alt={project.title}
                fill
                className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/50 transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <h4 className="text-lg font-bold">{project.title}</h4>
                <span className="text-sm">{project.date}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* "See More" Button */}
      <div className="text-center mt-12">
        <Button
          asChild
          size="lg"
          variant="outline"
          className="border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-sm font-bold uppercase text-xs h-9 px-6"
        >
          <Link href="/obras">CONHECER MAIS</Link>
        </Button>
      </div>
    </section>
  );
}
