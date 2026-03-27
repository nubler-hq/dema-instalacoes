export type Case = {
  slug: string;
  title: string;
  segment: string;
  neighborhood: string;
  partner: { name: string };
  status: string;
  summary: string;
  challenge: string;
  solution: string;
  results: string[];
  coverImage: string;
  galleryImages: string[];
  featured?: boolean;
};

export const allCases: Case[] = [
  {
    slug: "my-one-estacao-campo-belo",
    title: "My One Campo Belo",
    segment: "Residencial qualificado",
    neighborhood: "Campo Belo",
    partner: { name: "One Innovation / CGS Engenharia" },
    status: "Concluída",
    summary: "Execução integral de elétrica, hidráulica e combate a incêndio com controle de qualidade e alinhamento rigoroso ao cronograma.",
    challenge: "O principal desafio foi alinhar a execução das disciplinas de infraestrutura pesada ao cronograma físico-financeiro agressivo da construtora, coordenando o fluxo de materiais e mão de obra sem gerar gargalos para a obra civil.",
    solution: "A Dema Instalações atuou com planejamento tático preventivo, antecipando interferências de projeto. As instalações elétricas e hidráulicas foram executadas com foco na redução de retrabalho e na durabilidade do sistema.",
    results: [
      "Cronograma: Cumprimento das metas de avanço físico estipuladas pelo cliente.",
      "Segurança: Operação conduzida com zero acidentes, seguindo a NR-10 e NR-35.",
      "Qualidade: Sistemas integralmente testados, comissionados e prontos para operação final."
    ],
    coverImage: "/images/cases/my-one-estacao-campo-belo/image-007.jpg",
    galleryImages: [
      "/images/cases/my-one-estacao-campo-belo/image-001.webp",
      "/images/cases/my-one-estacao-campo-belo/image-002.webp",
      "/images/cases/my-one-estacao-campo-belo/image-003.webp",
      "/images/cases/my-one-estacao-campo-belo/image-004.webp",
      "/images/cases/my-one-estacao-campo-belo/image-005.webp",
      "/images/cases/my-one-estacao-campo-belo/image-006.webp"
    ],
    featured: true,
  },
  {
    slug: "blend-santa-cecilia",
    title: "Blend Sta. Cecília",
    segment: "Residencial urbano",
    neighborhood: "Santa Cecília",
    partner: { name: "Habitram Empreendimentos / STOG" },
    status: "Concluída",
    summary: "Execução completa da infraestrutura de engenharia para um empreendimento arrojado com 150 unidades habitacionais e mais de 7.000m² de área construída.",
    challenge: "A densificação em bairros centrais (terreno de apenas 900m²) traz o desafio gigantesco de otimizar a infraestrutura predial sem perder a eficiência operacional. Exigiu planejamento milimétrico das passagens para garantir 100% de adequação sem desvio do prazo.",
    solution: "Metodologias ágeis de montagem e compatibilização rigorosa asseguraram que as etapas avançassem de forma síncrona com a superestrutura. O emprego de prumadas centralizadas agilizou vistorias de qualidade.",
    results: [
      "Escalabilidade Técnica: 150 unidades residenciais entregues e certificadas.",
      "Excelência Comprovada: Integração fluida das áreas comuns com conforto e segurança."
    ],
    coverImage: "/images/cases/blend-santa-cecilia/image-006.jpeg",
    galleryImages: [
      "/images/cases/blend-santa-cecilia/image-002.jpg",
      "/images/cases/blend-santa-cecilia/image-003.jpg",
      "/images/cases/blend-santa-cecilia/image-004.jpg",
      "/images/cases/blend-santa-cecilia/image-005.jpg",
      "/images/cases/blend-santa-cecilia/image-006.jpeg",
      "/images/cases/blend-santa-cecilia/image-007.jpeg",
      "/images/cases/blend-santa-cecilia/image-008.jpg",
      "/images/cases/blend-santa-cecilia/image-009.jpeg",
      "/images/cases/blend-santa-cecilia/image-010.jpg"
    ],
    featured: true,
  },
  {
    slug: "geometria-vila-mariana",
    title: "Geometria Vila Mariana",
    segment: "Residencial premium",
    neighborhood: "Vila Mariana",
    partner: { name: "Solidi Engenharia" },
    status: "Em Execução",
    summary: "Montagem de infraestrutura elétrica e hidráulica para apartamentos amplos de 3 suítes, com foco em segurança e conforto absoluto.",
    challenge: "Empreendimentos de alto padrão exigem prumadas de água e esgoto projetadas para neutralizar vibrações e ruídos, além de requerer infraestrutura elétrica dimensionada para alta demanda simultânea de automação e climatização.",
    solution: "A equipe conduzindo a instalação utilizando materiais de atenuação acústica e isoladores de precisão. O dimensionamento elétrico respeitou rigorosamente os projetos de automação.",
    results: [
      "Infraestrutura oculta perfeita: Sistemas totalmente integrados com a alvenaria.",
      "Conforto garantido: Rede predial testada e livre de interferências mecânicas."
    ],
    coverImage: "/images/cases/geometria-vila-mariana/image-001.webp",
    galleryImages: [
      "/images/cases/geometria-vila-mariana/image-002.webp",
      "/images/cases/geometria-vila-mariana/image-003.webp",
      "/images/cases/geometria-vila-mariana/image-004.webp",
      "/images/cases/geometria-vila-mariana/image-005.webp",
      "/images/cases/geometria-vila-mariana/image-006.webp"
    ]
  },
  {
    slug: "bracon-perdizes",
    title: "Bracon Perdizes (Airosa Galvão)",
    segment: "Residencial qualificado",
    neighborhood: "Perdizes",
    partner: { name: "Bracon / STOG" },
    status: "Concluída",
    summary: "Execução completa das instalações para torre de alto padrão e área construída de mais de 3.000m² com 65 unidades.",
    challenge: "O projeto exigiu que a infraestrutura predial das 65 unidades subisse em sincronia perfeita com a superestrutura, otimizando o pequeno espaço logístico do terreno de 402m².",
    solution: "A Dema assumiu a obra com montagem modular e kits pré-fabricados de prumadas, reduzindo drasticamente o tempo de permanência de instaladores nas lajes e os riscos de desperdício.",
    results: [
      "Agilidade: Instalações acompanharam o ritmo da alvenaria e revestimentos.",
      "Excelência: Entrega técnica final validada por engenharia rigorosa."
    ],
    coverImage: "/images/cases/bracon-perdizes/image-005.jpg",
    galleryImages: [
      "/images/cases/bracon-perdizes/image-002.jpeg",
      "/images/cases/bracon-perdizes/image-003.jpeg",
      "/images/cases/bracon-perdizes/image-004.jpg",
      "/images/cases/bracon-perdizes/image-005.jpg"
    ]
  },
  {
    slug: "moa-292-moema",
    title: "MOA 292 Moema",
    segment: "Residencial de luxo",
    neighborhood: "Moema",
    partner: { name: "Fernandez Mera" },
    status: "Concluída",
    summary: "Execução das disciplinas de elétrica e hidráulica para edifício de alto padrão, garantindo requisitos da certificação AQUA-HQE.",
    challenge: "Compatibilizar a infraestrutura sem criar interferências acústicas nos andares mistos (Studios compactos abaixo, Plantas amplas superiores), preservando a certificação AQUA-HQE.",
    solution: "Isolamento das prumadas e aplicação de atenuadores na tubulação de queda. Automação e climatização exigiram milhares de metros de conduítes sem estrangulamento das lajes.",
    results: [
      "Certificação Ambiental: Sistemas entregues no padrão AQUA-HQE.",
      "Segurança de carga: Dimensionamento para alta demanda simultânea das unidades."
    ],
    coverImage: "/images/cases/moa-292-moema/image-001.jpg",
    galleryImages: [
      "/images/cases/moa-292-moema/image-002.jpg",
      "/images/cases/moa-292-moema/image-003.jpg",
      "/images/cases/moa-292-moema/image-004.jpg",
      "/images/cases/moa-292-moema/image-005.jpg",
      "/images/cases/moa-292-moema/image-006.jpg",
      "/images/cases/moa-292-moema/image-007.jpg"
    ],
    featured: true,
  },
  {
    slug: "mob-station-santa-cruz",
    title: "Mob Station Santa Cruz",
    segment: "Mixed-use / Coliving",
    neighborhood: "Vila Clementino",
    partner: { name: "Lote 5 Incorporações" },
    status: "Concluída",
    summary: "Ampla infraestrutura para áreas comuns diversificadas, facilities comerciais de uso intensivo e unidades residenciais.",
    challenge: "Centralizar a demanda elétrica e hidráulica de maquinários industriais (como lavanderia) e áreas comerciais sem comprometer o abastecimento das prumadas residenciais em horários de pico.",
    solution: "Compatibilização refinada criando sistemas independentes e dimensionados com folga para áreas comerciais (Facilities), garantindo funcionamento 24h com segurança.",
    results: [
      "Integração perfeita: Operação validada para serviços terceirizados no condomínio.",
      "Máxima confiabilidade operacional das instalações."
    ],
    coverImage: "/images/cases/mob-station-santa-cruz/image-007.jpg",
    galleryImages: [
      "/images/cases/mob-station-santa-cruz/image-002.png",
      "/images/cases/mob-station-santa-cruz/image-003.jpg",
      "/images/cases/mob-station-santa-cruz/image-004.png",
      "/images/cases/mob-station-santa-cruz/image-005.png",
      "/images/cases/mob-station-santa-cruz/image-006.png",
      "/images/cases/mob-station-santa-cruz/image-007.jpg"
    ]
  },
  {
    slug: "enseada-residence-resort",
    title: "Enseada Residence Resort",
    segment: "Residencial Litorâneo",
    neighborhood: "Praia da Enseada",
    partner: { name: "Empreendimento Imobiliário Litoral" },
    status: "Concluída",
    summary: "Execução de infraestrutura predial no litoral com especificações avançadas de resistência à corrosão e salinidade.",
    challenge: "Mitigar a severa ação da maresia sobre tubulações e suportes, além de garantir vazão máxima nos períodos de alta temporada simultânea.",
    solution: "Adoção de materiais poliméricos de alta resistência e tratamentos anticorrosivos em bandejas. Rede hídrica balanceada para picos extremos de uso no verão.",
    results: [
      "Proteção litorânea: Vida útil dos sistemas ampliada e blindada.",
      "Conforto total: Manutenção de pressão contínua na alta ocupação."
    ],
    coverImage: "/images/cases/enseada-residence-resort/image-002.jpg",
    galleryImages: [
      "/images/cases/enseada-residence-resort/image-001.jpg",
      "/images/cases/enseada-residence-resort/image-003.jpg"
    ]
  },
  {
    slug: "torre-dgn-360",
    title: "Torre DGN 360",
    segment: "Corporativo Class B",
    neighborhood: "Jardim Paulista",
    partner: { name: "Não Especificado" },
    status: "Em Execução / Manutenção",
    summary: "Atuação corporativa na infraestrutura para 13 andares de uso empresarial e sistemas HVAC robustos.",
    challenge: "Instalar infraestrutura de alta densidade por piso elevado e forro modular, assegurando invisibilidade total mas com máxima acessibilidade para retrofit.",
    solution: "Mapeamento antecipado de calhas no piso elevado antes de montagem arquitetônica, protegendo a flexibilidade exigida pelo aluguel corporativo.",
    results: [
      "Robustez Corporativa: Alta carga sem superaquecimento.",
      "Sistemas essenciais atrelados à geração autônoma perfeitamente."
    ],
    coverImage: "/images/cases/torre-dgn-360/image-001.png",
    galleryImages: [
      "/images/cases/torre-dgn-360/image-001.png"
    ]
  },
  {
    slug: "wise-jardim-prudencia",
    title: "Wise Jardim Prudência",
    segment: "Residencial urbano",
    neighborhood: "Jardim Prudência",
    partner: { name: "Wise Incorporação / CGS Engenharia" },
    status: "Em Execução",
    summary: "Execução integral de elétrica, hidráulica e combate a incêndio com controle de qualidade e alinhamento rigoroso.",
    challenge: "Manter o ritmo agressivo da construtora alinhando as disciplinas pesadas sem congestionar o fluxo de civil.",
    solution: "Adoção de planejamento preventivo forte e metodologias que reduzem o risco de retrabalho com longa durabilidade.",
    results: [
      "Cronograma garantido no avanço estipulado.",
      "Segurança e Qualidade totais no acompanhamento em campo."
    ],
    coverImage: "/images/cases/wise-jardim-prudencia/image-001.jpg",
    galleryImages: ["/images/cases/wise-jardim-prudencia/image-001.jpg"],
    featured: true,
  },
  {
    slug: "ubs-jabaquara",
    title: "UBS Jabaquara",
    segment: "Institucional",
    neighborhood: "Jabaquara",
    partner: { name: "Prefeitura de São Paulo" },
    status: "Entregue",
    summary: "Obra institucional exigente entregue com disciplina estrita, laudos e documentação pública rigorosa.",
    challenge: "Equilibrar a conformidade rigorosa da infraestrutura pública ao escopo contratual sem margem para flexibilização.",
    solution: "Obras públicas receberam tratamento de validação passo a passo com leitura intensiva da Norma e antecipação de impeditivos técnicos.",
    results: [
      "Certificações completas para utilização contínua.",
      "Carga operacional e dimensionamento à prova de crises."
    ],
    coverImage: "/images/cases/ubs-jabaquara/image-001.jpg",
    galleryImages: ["/images/cases/ubs-jabaquara/image-001.jpg"],
    featured: true,
  },
  {
    slug: "the-week-rio",
    title: "The Week Rio",
    segment: "Comercial",
    neighborhood: "Rio de Janeiro",
    partner: { name: "The Week" },
    status: "Entregue (Mar 2016)",
    featured: false,
    coverImage: "/images/cases/the-week-rio/image-001.jpg",
    galleryImages: ["/images/cases/the-week-rio/image-001.jpg"],
    summary: "Instalações de entretenimento com foco em suporte para alta demanda de som e luz.",
    challenge: "Complexidade de quadro elétrico para suportar eventos de grande escala.",
    solution: "Adoção de padrões industriais para um empreendimento comercial e festivo.",
    results: ["Entrega impecável perante cronograma", "Sem incidentes acústicos/elétricos em pico"]
  },
  {
    slug: "atelie-casa-branca",
    title: "Ateliê Casa Branca",
    segment: "Residencial",
    neighborhood: "São Paulo",
    partner: { name: "Cliente Base Dema" },
    status: "Entregue",
    featured: false,
    coverImage: "/images/cases/atelie-casa-branca/image-001.jpg",
    galleryImages: ["/images/cases/atelie-casa-branca/image-001.jpg"],
    summary: "Refinamento técnico em projeto residencial boutique.",
    challenge: "Espaços restritos para shafts e prumadas.",
    solution: "Engenharia de utilidades otimizada em forros e lajes slim.",
    results: ["Aproveitamento de 100% da volumetria arquitetônica"]
  },
  {
    slug: "vista-sp-restaurante",
    title: "Vista SP Restaurante",
    segment: "Comercial",
    neighborhood: "São Paulo",
    partner: { name: "Restaurante Vista" },
    status: "Entregue",
    featured: false,
    coverImage: "/images/cases/vista-sp-restaurante/image-001.jpg",
    galleryImages: ["/images/cases/vista-sp-restaurante/image-001.jpg"],
    summary: "Elétrica e hidráulica dimensionada para cozinha industrial de alto padrão.",
    challenge: "Exaustão e sistemas hidráulicos no topo de um museu histórico.",
    solution: "Instalações não-destrutivas e rigor altíssimo no trânsito de dutos.",
    results: ["Operação suportada sem falhas hidráulicas sob pico de clientes"]
  },
  {
    slug: "vitale-sao-bernardo",
    title: "Vitale São Bernardo",
    segment: "Residencial",
    neighborhood: "São Bernardo",
    partner: { name: "Cliente Base Dema" },
    status: "Entregue",
    featured: false,
    coverImage: "/images/cases/vitale-sao-bernardo/image-001.jpg",
    galleryImages: ["/images/cases/vitale-sao-bernardo/image-001.jpg"],
    summary: "Empreendimento residencial com entrega escalada.",
    challenge: "Repetitividade e padronização entre andares.",
    solution: "Modelagem paramétrica de kits pré-montados.",
    results: ["Redução de perdas de material na obra", "Prazos batidos com 15 dias de folga"]
  },
  {
    slug: "the-week-floripa",
    title: "The Week Floripa",
    segment: "Comercial",
    neighborhood: "Florianópolis",
    partner: { name: "The Week" },
    status: "Entregue",
    featured: false,
    coverImage: "/images/cases/the-week-floripa/image-001.jpg",
    galleryImages: ["/images/cases/the-week-floripa/image-001.jpg"],
    summary: "Instalação cenotécnica e comercial no polo turístico de Santa Catarina.",
    challenge: "Logística interestadual da equipe Dema e materiais.",
    solution: "Canteiro local gerido diretamente por engenheiros sêniores de SP.",
    results: ["Garantia estendida atestada no limite dos laudos elétricos"]
  },
  {
    slug: "gr-living-design-vl-madalena",
    title: "GR Living Design VL. Madalena",
    segment: "Residencial",
    neighborhood: "Vila Madalena",
    partner: { name: "Gattaz Empreendimentos" },
    status: "Entregue (Dez 2016)",
    featured: true,
    coverImage: "/images/cases/gr-living-design-vl-madalena/image-001.jpg",
    galleryImages: ["/images/cases/gr-living-design-vl-madalena/image-001.jpg"],
    summary: "Uma torre residencial de alto padrão em um dos bairros mais nobres da capital.",
    challenge: "Instalações prediais para um projeto arquitetônico ousado da Gattaz.",
    solution: "Estudo tridimensional apurado da elétrica e hidráulica reduzindo interferências.",
    results: ["Sistemas invisíveis, silenciosos e com laudo técnico rigoroso", "Efetivação de parceria histórica com Gattaz"]
  },
  {
    slug: "top-tree-tower",
    title: "Top Tree Tower - Ibirapuera",
    segment: "Comercial",
    neighborhood: "Ibirapuera",
    partner: { name: "Cliente Base Dema" },
    status: "Entregue (Set 2015)",
    featured: false,
    coverImage: "/images/cases/top-tree-tower/image-001.jpg",
    galleryImages: ["/images/cases/top-tree-tower/image-001.jpg"],
    summary: "Prédio comercial corporativo com ar-condicionado central e grandes cargas.",
    challenge: "Entrada de energia de alta tensão e comissionamento de chillers.",
    solution: "Coordenação precisa com a concessionária para ligação comissionada.",
    results: ["Testes de estresse estrutural vencidos no primeiro laudo", "Operação limpa em todos os escritórios"]
  },
  {
    slug: "varandas-vila-mariana",
    title: "Varandas Vila Mariana",
    segment: "Residencial",
    neighborhood: "Vila Mariana",
    partner: { name: "Cliente Base Dema" },
    status: "Entregue",
    featured: false,
    coverImage: "/images/cases/varandas-vila-mariana/image-001.jpg",
    galleryImages: ["/images/cases/varandas-vila-mariana/image-001.jpg"],
    summary: "Torre residencial familiar que demandou sistemas robustos nos andares tipo.",
    challenge: "Trabalhar em vias congestionadas para entrega de materiais.",
    solution: "Logística just-in-time e montagem in-loco otimizada.",
    results: ["Rigor construtivo atestado pela vistoria final do cliente"]
  },
  {
    slug: "cd-marabraz",
    title: "Centro de Distribuição Marabraz",
    segment: "Industrial",
    neighborhood: "São Paulo",
    partner: { name: "Lojas Marabraz" },
    status: "Entregue (Nov 2015)",
    featured: false,
    coverImage: "/images/cases/cd-marabraz/image-001.jpg",
    galleryImages: ["/images/cases/cd-marabraz/image-001.jpg"],
    summary: "Infraestrutura industrial de grande escala para galpão logístico.",
    challenge: "Dimensões quilométricas para cabeamento e SPDA.",
    solution: "Execução industrial com automação no lançamento de cabos.",
    results: ["Cobertura elétrica homogênea e risco 0 de incêndio por projeto"]
  },
  {
    slug: "loja-marabraz-bonsucesso",
    title: "Loja Marabraz Bonsucesso",
    segment: "Comercial",
    neighborhood: "Guarulhos",
    partner: { name: "Lojas Marabraz" },
    status: "Entregue",
    featured: false,
    coverImage: "/images/cases/loja-marabraz-bonsucesso/image-001.jpg",
    galleryImages: ["/images/cases/loja-marabraz-bonsucesso/image-001.jpg"],
    summary: "Retrofit e iluminação projetada para varejo de massa.",
    challenge: "Prazos de obra comercial: curtos e inegociáveis.",
    solution: "Turnos de execução inibindo paralisações e gargalos logísticos.",
    results: ["Inauguração na data prevista com 100% de performance"]
  },
  {
    slug: "sirena",
    title: "Sirena",
    segment: "Comercial",
    neighborhood: "Maresias",
    partner: { name: "Clube Sirena" },
    status: "Entregue",
    featured: false,
    coverImage: "/images/cases/sirena/image-001.jpg",
    galleryImages: ["/images/cases/sirena/image-001.jpg"],
    summary: "Emblemático clube noturno do litoral paulista.",
    challenge: "Elétrica pesada à mercê de maresia e grande densidade de pessoas.",
    solution: "Blindagem e aterramento reforçado sob a ABNT.",
    results: ["Operação segura durante temporadas intensas"]
  },
  {
    slug: "the-sailor",
    title: "The Sailor",
    segment: "Comercial",
    neighborhood: "São Paulo",
    partner: { name: "The Sailor" },
    status: "Entregue",
    featured: false,
    coverImage: "/images/cases/the-sailor/image-001.jpg",
    galleryImages: ["/images/cases/the-sailor/image-001.jpg"],
    summary: "Pub temático premiado da capital.",
    challenge: "Adequação de projeto cenográfico ao framework elétrico seguro.",
    solution: "Engenharia aliada à arquitetura de interiores.",
    results: ["Sistema perfeitamente funcional e estético"]
  },
  {
    slug: "indy-70",
    title: "Indy 70",
    segment: "Residencial",
    neighborhood: "São Paulo",
    partner: { name: "Gattaz Empreendimentos" },
    status: "Entregue",
    featured: false,
    coverImage: "/images/cases/indy-70/image-001.jpg",
    galleryImages: ["/images/cases/indy-70/image-001.jpg"],
    summary: "Integração técnica com incorporadora focada em alto padrão.",
    challenge: "Redução de passivos pós-obra.",
    solution: "Garantia de insumos A+ e testes de carga antes do habitese.",
    results: ["Entrega impecável"]
  },
  {
    slug: "edificio-jurupis",
    title: "Edifício Jurupis",
    segment: "Comercial",
    neighborhood: "São Paulo",
    partner: { name: "Gattaz Empreendimentos" },
    status: "Entregue",
    featured: false,
    coverImage: "/images/cases/edificio-jurupis/image-001.jpg",
    galleryImages: ["/images/cases/edificio-jurupis/image-001.jpg"],
    summary: "Projeto comercial com selo Gattaz.",
    challenge: "Prumadas complexas em torre corporativa.",
    solution: "Sistematização de shafts técnicos.",
    results: ["Espaço liberado comercialmente sem problemas"]
  },
  {
    slug: "atelier-jauaperi",
    title: "Atelier Jauaperi",
    segment: "Residencial",
    neighborhood: "Moema",
    partner: { name: "Gattaz Empreendimentos" },
    status: "Entregue",
    featured: false,
    coverImage: "/images/cases/atelier-jauaperi/image-001.jpg",
    galleryImages: ["/images/cases/atelier-jauaperi/image-001.jpg"],
    summary: "Residencial voltado ao luxo clássico no núcleo de Moema.",
    challenge: "Hidráulica termicamente perfeita e acústica controlada.",
    solution: "Ensaios rigorosos de pressão nominal e isolamento de tubulações.",
    results: ["Silêncio e excelência no uso final do cliente"]
  },
  {
    slug: "br-ipiranga-legacy",
    title: "BR Ipiranga",
    segment: "Residencial",
    neighborhood: "Ipiranga",
    partner: { name: "Stog / BR" },
    status: "Entregue",
    featured: false,
    coverImage: "/images/cases/br-ipiranga-legacy/image-001.jpg",
    galleryImages: ["/images/cases/br-ipiranga-legacy/image-001.jpg"],
    summary: "Mais um case do vetor histórico da Dema no portfólio de empreendimentos verticais urbanos.",
    challenge: "Compatibilização exata de projetos via cad/BIM preliminar.",
    solution: "Acompanhamento no papel à realidade de canteiro.",
    results: ["Conformidade de traçado de 99% e validação de fiscalização"]
  },
  {
    slug: "arte-itaim",
    title: "Arte Itaim",
    segment: "Residencial",
    neighborhood: "Itaim Bibi",
    partner: { name: "Stog" },
    status: "Entregue",
    featured: false,
    coverImage: "/images/cases/arte-itaim/image-001.jpg",
    galleryImages: ["/images/cases/arte-itaim/image-001.jpg"],
    summary: "Polo financeiro e moradia de alto giro with exigência de ponta.",
    challenge: "Manobra e içamento de caixas d'água e chillers.",
    solution: "Cálculo e mobilização logística detalhada.",
    results: ["100% finalizado."]
  },
  {
    slug: "wise-cupece",
    title: "Wise Cupecê",
    segment: "Residencial",
    neighborhood: "Cupecê",
    partner: { name: "CGS / Wise" },
    status: "Entregue",
    featured: false,
    coverImage: "/images/cases/wise-cupece/image-001.jpg",
    galleryImages: ["/images/cases/wise-cupece/image-001.jpg"],
    summary: "Um dos pilares da relação Dema e Wise Incorporadora.",
    challenge: "Construção de múltiplos andares com equipe enxuta.",
    solution: "Produtividade de ponta orientada por métodos industriais on-site.",
    results: ["Tranquilidade técnica atestada pela matriz construtora"]
  },
  {
    slug: "empreendimento-suzano-149",
    title: "Empreendimento Suzano 149",
    segment: "Residencial",
    neighborhood: "Suzano",
    partner: { name: "Stog" },
    status: "Entregue",
    featured: false,
    coverImage: "/images/cases/empreendimento-suzano-149/image-001.jpg",
    galleryImages: ["/images/cases/empreendimento-suzano-149/image-001.jpg"],
    summary: "Torre expandindo a operação da Dema para a grande SP.",
    challenge: "Distribuição maciça de quadros e prumadas d'água em perímetro estendido.",
    solution: "Análise hidráulica e de cargas detalhada e aprovação regional.",
    results: ["Entregue no Padrão Dema"]
  }
];

export const featuredCases = allCases.filter(c => c.featured);
