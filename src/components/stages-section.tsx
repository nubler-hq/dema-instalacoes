import {
  ClipboardList,
  Calculator,
  Construction,
  PackageCheck,
} from "lucide-react";
import React from "react";

const stagesData = [
  {
    icon: (
      <ClipboardList className="h-12 w-12 text-primary" strokeWidth={1.25} />
    ),
    stage: "PRIMEIRO ESTAGIO",
    title: "VISITA TÉCNICA",
    description:
      "Efetuamos uma visita sem custos, para avaliar as suas necessidades.",
  },
  {
    icon: <Calculator className="h-12 w-12 text-primary" strokeWidth={1.25} />,
    stage: "SEGUNDO ESTÁGIO",
    title: "ORÇAMENTO GRATUITO",
    description:
      "Após a visita técnica, elaboraremos seu orçamento sempre com materiais de qualidade e certificados para melhor atender o seu projeto.",
  },
  {
    icon: (
      <Construction className="h-12 w-12 text-primary" strokeWidth={1.25} />
    ),
    stage: "TERCEIRO ESTÁGIO",
    title: "DESENVOLVIMENTO",
    description:
      "Desenvolvemos o nosso trabalho, viabilizando as necessidades e segurança e sempre seguindo as normas técnicas.",
  },
  {
    icon: (
      <PackageCheck className="h-12 w-12 text-primary" strokeWidth={1.25} />
    ),
    stage: "ULTIMO ESTÁGIO",
    title: "ENTREGA E GARANTIA",
    description:
      "Entregamos a sua obra sempre no prazo previsto e com total garantia.",
  },
];

export function StagesSection() {
  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Headline */}
        <div className="text-center mb-16">
          <h3 className="text-2xl font-semibold tracking-tight text-foreground uppercase border-b-2 border-border pb-4">
            TODOS OS ESTAGIOS DA RENOVAÇÃO E INOVAÇÃO
          </h3>
        </div>

        {/* Stages Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
          {stagesData.map((item, index) => (
            <div key={index} className="text-center">
              <div className="flex justify-center mb-5">
                <div className="w-24 h-24 rounded-full border-2 border-border flex items-center justify-center">
                  {item.icon}
                </div>
              </div>
              <span className="text-xs text-muted-foreground font-semibold tracking-wider">
                {item.stage}
              </span>
              <h4 className="text-base font-bold text-foreground my-2 uppercase">
                {item.title}
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
