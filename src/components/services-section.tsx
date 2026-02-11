import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

const servicesData = [
  {
    title: "Projetos e Instalações em Baixa Tensão",
    description: "Residencial, Predial e Industrial conforme NBR 5410.",
    href: "/servicos",
  },
  {
    title: "Entrada de Energia",
    description:
      "Projetos e execução de entrada de energia, junto as concessionárias.",
    href: "/servicos",
  },
  {
    title: "Atestados das Instalações Elétricas",
    description: "Inspeção e certificação, conforme requisitado pela NR-10.",
    href: "/servicos",
  },
  {
    title: "Laudos de Pára-raios",
    description:
      "Inspeção e certificação, conforme requisitado pela ABNT NBR-5419.",
    href: "/servicos",
  },
  {
    title: "Medição Ôhmica",
    description:
      "Medição Ôhmica, para atestar e certificar funcionamento dos para-raios, através do Terrômetro.",
    href: "/servicos",
  },
];

export function ServicesSection() {
  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Headline */}
        <div className="text-center mb-12">
          <h3 className="text-2xl font-semibold tracking-tight text-foreground uppercase">
            Principais Serviços
          </h3>
          <div className="mt-3 flex justify-center">
            <div className="w-16 h-1 bg-primary rounded-full" />
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicesData.map((service, index) => (
            <Link href={service.href} key={index} className="group">
              <div className="h-full bg-secondary/30 border border-border/40 p-6 flex flex-col justify-center min-h-[160px]">
                <h4 className="text-base font-bold text-foreground mb-2">
                  {service.title}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {service.description}
                </p>
              </div>
            </Link>
          ))}

          {/* "See More" Card */}
          <Link href="/servicos" className="group">
            <div className="h-full bg-primary text-primary-foreground flex flex-col items-center justify-center min-h-[160px]">
              <h3 className="text-xl font-bold mb-2 uppercase">VER MAIS</h3>
              <ArrowRight className="h-8 w-8 mx-auto" />
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
