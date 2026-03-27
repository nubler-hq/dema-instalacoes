"use client";

const stages = [
  {
    iconClass: "reneva-18",
    step: "PRIMEIRO ESTÁGIO",
    title: "VISITA TÉCNICA",
    description: "Efetuamos uma visita sem custos, para avaliar as suas necessidades reais e mapear a infraestrutura existente.",
  },
  {
    iconClass: "reneva-44",
    step: "SEGUNDO ESTÁGIO",
    title: "ORÇAMENTO GRATUITO",
    description: "Após a visita técnica, elaboramos uma proposta detalhada com materiais certificados e foco no melhor custo-benefício.",
  },
  {
    iconClass: "reneva-45",
    step: "TERCEIRO ESTÁGIO",
    title: "DESENVOLVIMENTO",
    description: "Execução rigorosa seguindo as normas técnicas, com acompanhamento de engenharia e foco em agilidade e segurança.",
  },
  {
    iconClass: "reneva-16",
    step: "ULTIMO ESTÁGIO",
    title: "ENTREGA E GARANTIA",
    description: "Finalização da obra com testes rigorosos e entrega técnica, garantindo a tranquilidade do seu empreendimento.",
  },
];

export function ProcessSection() {
  return (
    <section className="border-b relative overflow-hidden bg-secondary/10">
      <div className="shell section-space">
        <div className="max-w-3xl mb-20 relative z-10">
          <p className="eyebrow reveal-up">O Processo Operacional</p>
          <h2 className="section-title mt-6 reveal-up reveal-delay-1">
            Da avaliação técnica à entrega certificada: engenharia que antecipa o futuro da sua obra.
          </h2>
          <p className="mt-8 text-muted-foreground max-w-2xl leading-relaxed text-lg reveal-up reveal-delay-2">
            Nossa metodologia de trabalho foi refinada para mitigar riscos, otimizar recursos e garantir que cada etapa da montagem elétrica e hidráulica ocorra sem imprevistos.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-16 lg:gap-x-8">
          {stages.map((stage, i) => {
            return (
              <div
                key={i}
                className="group flex flex-col items-start reveal-up"
                style={{ animationDelay: `${(i + 3) * 100}ms` }}
              >
                <div className="relative mb-8 flex items-baseline gap-4 transition-all duration-500 group-hover:-translate-y-1">
                  <i className={`reneva ${stage.iconClass} text-5xl text-primary transition-transform duration-500 group-hover:scale-110`} />
                  <span className="font-display text-2xl text-primary/10 transition-colors duration-500 group-hover:text-primary/40">
                    0{i + 1}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-[0.6rem] font-bold uppercase tracking-[0.3em] text-primary transition-colors duration-500 group-hover:text-primary/100">
                      {stage.step}
                    </p>
                    <h3 className="mt-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl transition-all duration-300">
                      {stage.title}
                    </h3>
                  </div>

                  <div className="h-px w-12 bg-primary/20 transition-all duration-500 group-hover:w-full group-hover:bg-primary/40" />

                  <p className="text-sm leading-7 text-muted-foreground group-hover:text-foreground/80 transition-colors duration-500">
                    {stage.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
