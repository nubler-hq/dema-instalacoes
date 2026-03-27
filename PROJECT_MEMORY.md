# PROJECT_MEMORY.md

> Living memory for the SaaS Boilerplate project. Append-only. Do not delete history.

## 1. Project Overview
- **Project Name:** Dema Instalações
- **Description:** Plataforma institucional premium para a Dema Instalações, com site completo de alto padrão, portfólio de cases e fundação de API operacional.
- **Primary Objective:** Executar primeiro o front-end completo com dados mockados e, em seguida, implementar a arquitetura real de conteúdo e API com Igniter.js.
- **Preferred Language (Docs/Comms):** PT-BR
- **Start Date:** 2026-02-11

## 2. Target Audience & Personas (CRITICAL)

### Persona 1: Clientes da Dema
- **Name:** Clientes de Instalações
- **Role:** Usuário Final / Empresa
- **Technical Level:** Low
- **Goals:** Encontrar serviços, ver portfólio de obras e entrar em contato.
- **Pain Points:** Dificuldade de navegação em sites antigos.
- **Preferred Content:** Visual limpo, imagens de alta qualidade e formulários simples.

## 3. Product Positioning
- **Value Proposition:** Presença digital premium para empresa de instalações prediais que atende empreendimentos urbanos exigentes e clientes de padrão mais qualificado.
- **Differentiators:** Design premium, portfólio de cases com valor comercial/SEO, front-end de alto nível, e base operacional futura com Igniter.js + Collections + Postgres.
- **Primary Use Cases:** Portfólio de cases, apresentação de serviços, prova de autoridade técnica, captação de leads e base operacional para agente de IA.

## 4. Feature Inventory
- **Core Features:**
  - Homepage Premium — [COMPLETED]
  - Página de Serviços — [MVP COMPLETED]
  - Página de Cases (Index Editorial com Filtros) — [COMPLETED]
  - Página de Case Individual (Ficha Executiva) — [COMPLETED]
  - Página Sobre Nós — [COMPLETED] (Redesign Editorial Premium)
  - Página de Contato — [MVP COMPLETED]
- **Custom Features:**
  - Design System Premium (Mineral/Editorial) — [COMPLETED]
  - Filtragem de Cases por Segmento (ToggleGroup) — [COMPLETED]
  - Padronização de Assets (Slug-based + image-001) — [IN PROGRESS]
  - Mock controllers para front-end first — [COMPLETED]
  - Collections para conteúdo público — [PLANNED]
  - Postgres/Prisma para leads e dados sensíveis — [PLANNED]
  - API Igniter.js operacional sem painel admin — [PLANNED]

## 5. Integrations & Ecosystem
- **Payment Providers:** N/A
- **Email Providers:** [PENDING]
- **Storage Providers:** Local/S3 [PENDING]
- **Analytics/Telemetry:** Igniter Telemetry [ENABLED]

## 6. Architectural Decisions
- [2026-02-11 15:40:00] - Inicialização do repositório Git e criação do remote no GitHub (nubler-hq/dema-instalacoes).
- [2026-03-25 17:10:00] - O projeto deixou de ser apenas redesign de homepage e passou a ser planejado como site completo premium + plataforma de conteúdo e API.
- [2026-03-25 17:20:00] - Estratégia definida: implementar primeiro o front-end com dados mockados nos controllers; back-end real vem depois.
- [2026-03-25 17:20:00] - Decisão de modelagem: preferir objetos aninhados em vez de campos compostos como `partnerName`; quando fizer sentido em banco, usar `Json` no Prisma.
- [2026-03-25 17:25:00] - Linguagem oficial de produto alterada de `obras` para `cases`, inclusive para rotas e entidades planejadas (`/cases`, `/cases/[slug]`).
- [2026-03-25 17:30:00] - Estratégia de dados híbrida consolidada: `@igniter-js/collections` para conteúdo público e editorial; Postgres para leads, contatos e dados sensíveis.
- [2026-03-26 13:10:00] - Decisão de Refatoração de Imagens: Substituição de imagens internas por fotos de fachada/exterior para elevar o padrão visual dos cases.
- [2026-03-26 13:15:00] - Interatividade em Cases: Implementação de filtros (Residencial, Comercial, Industrial) usando `ToggleGroup` para melhorar a navegabilidade no portfólio crescente.
- [2026-03-26 13:20:00] - Unificação de UX: O CTA de alta conversão ("Trituramos a imprevisibilidade") foi movido da página de case para o Footer global, garantindo autoridade em todas as páginas do site.
- [2026-03-26 13:30:00] - Padronização de Portfólio Legacy: Decisão de extrair 19 obras do site antigo e organizá-las em pastas próprias por slug com nomenclatura `image-001.jpg` para permitir expansão futura da galeria de cada projeto.

## 7. Release & Change Log
- [2026-02-11 15:40:00] - Initial Commit: Boilerplate base com estrutura de features e componentes UI.
- [2026-03-25 16:45:00] - Criado plano inicial de redesign da homepage.
- [2026-03-25 17:10:00] - Plano evoluído para escopo completo de plataforma: site premium inteiro + arquitetura de conteúdo + API operacional com Igniter.js + Collections + Postgres.
- [2026-03-25 17:25:00] - Plano expandido com blueprint visual completo, página por página, seguindo a frontend-skill.
- [2026-03-25 17:35:00] - Documento de portfólio enriquecido com nomes comerciais corretos/prováveis, links públicos e notas de confirmação/inferência para facilitar busca de assets.
- [2026-03-25 17:45:00] - Docs de planejamento consolidados em `docs/planning`, com visão geral, rotas, componentes, assets, esquema de dados, blueprint visual, modelo de conteúdo e roadmap.
- [2026-03-25 17:55:00] - Execução do plano iniciada: homepage e estrutura base.
- [2026-03-26 13:00:00] - Expansão do Portfólio: Cadastro de 29 cases totais (10 novos + 19 legacy).
- [2026-03-26 13:15:00] - Interface de Cases: Adicionado sistema de filtros por segmento na `/cases`.
- [2026-03-26 13:20:00] - Refactoring Footer: Substituição do footer padrão pelo CTA de "Engenharia de Ponta".
- [2026-03-26 13:35:00] - Data Migration: Baixadas 19 imagens de fachada e reestruturado o sistema de arquivos de `/public/images/cases/`.
- [2026-03-26 14:05:00] - Curadoria manual de imagens para `/cases`: corrigidos os assets quebrados/ausentes de `geometria-vila-mariana`, `varandas-vila-mariana`, `cd-marabraz`, `wise-jardim-prudencia`, `ubs-jabaquara` e substituída a miniatura fraca de `enseada-residence-resort` por imagem pública de maior resolução.

## 8. Time & Estimation Patterns
- [2026-02-11 15:40:00] - Setup inicial e deploy base levou aproximadamente 10 minutos.

## 9. Pending Work & Improvements
- [x] Implementar o front-end completo começando pelo design system/layout global.
- [x] Criar mock controllers com shape final de dados para homepage, serviços, cases e contato.
- [x] Refinar e completar `/`, `/cases`, `/cases/[slug]`.
- [ ] Revisar e melhorar a qualidade das imagens de alguns cases (vários estão borrados ou não aparecem).
- [ ] Pesquisar no Google imagens reais de fachada para as obras legacy que estão com qualidade baixa.
- [ ] Continuar a curadoria manual das imagens legacy restantes com menor impacto visual (`atelier-jauaperi`, `br-ipiranga-legacy`, `arte-itaim`, `wise-cupece`, `empreendimento-suzano-149` e demais cards ainda com material de baixa qualidade).
- [ ] Refinar as páginas `/servicos`, `/sobre-nos` e `/contato` para o mesmo padrão editorial dos cases.
- [ ] Implementar SEO final e metadata dinâmico.
- [ ] Estruturar bounded contexts do Igniter.js.
- [ ] Implementar collections públicas (`cases`, `services`, `pages`, `partners`).
- [ ] Modelar Postgres/Prisma para leads.
- [ ] Substituir mocks pela API real.

## 10. Notes
- Projeto focado em fidelidade visual ao site original.
- [2026-03-25 16:45:00] - Nova diretriz proposta: evoluir de uma releitura fiel do site antigo para um institucional mais autoral, contemporâneo e orientado a marca, sem descaracterizar a Dema.
- [2026-03-25 17:10:00] - Diretriz consolidada: o projeto não é apenas visual; deve funcionar como plataforma híbrida de site institucional, portfólio SEO e backend operacional para agentes de IA.
- [2026-03-25 17:18:00] - Pesquisa de mercado e dos empreendimentos confirmou um perfil mais premium da Dema: forte presença em empreendimentos residenciais urbanos qualificados em bairros valorizados de São Paulo, além de ao menos um case institucional de saúde.
- [2026-03-25 17:22:00] - O posicionamento visual deve se aproximar de real estate premium urbano + engenharia executiva, não de “empresa de instalações” genérica.
- [2026-03-25 17:40:00] - Principais referências de execução estão em:
  - `.artifacts/plans/PLN-2026-03-25-dema-site-platform.md`
  - `docs/planning/05_VISUAL_BLUEPRINT.md`
  - `docs/planning/06_CONTENT_MODEL.md`
  - `.artifacts/references/portfolio_obras_dema.md`
- [2026-03-25 17:40:00] - Próxima ordem recomendada de execução:
  - 1. layout global + design system
  - 2. mock controllers
  - 3. homepage
  - 4. páginas institucionais
  - 5. `/cases`
  - 6. `/cases/[slug]`
  - 7. SEO e polish
  - 8. backend real
- [2026-03-25 17:55:00] - A primeira execução material do plano já cobre boa parte da Etapa A: tipografia editorial, paleta premium mineral com laranja da marca, header/footer novos, homepage forte e rotas institucionais iniciais usando um módulo único de conteúdo mockado.
- [2026-03-27 13:45:00] - Correção Gramatical e Ortográfica: Revisão completa do Footer e sitewide content. Ajustados acentos em "Atuação", "operações", "confiança", "Luís Antônio" e "São Paulo". Removida crase incorreta em "Sistema de Combate a Incêndio".
- [2026-03-27 13:50:00] - Atualização Institucional (Sobre Nós): Seção de Missão, Visão e Valores atualizada para integrar o histórico do site antigo com o novo tom premium, priorizando termos como "melhor custo-benefício", "soluções inovadoras" e "agilidade operacional".
