# Projeto Dema Instalações - Visão Geral

## 1. Objetivo Principal

Este projeto deixou de ser apenas uma recriação visual do site original. O objetivo agora é finalizar a presença digital da Dema como uma **plataforma institucional premium**, com duas frentes complementares:

1. **Front-end de alto padrão**
   - site completo
   - design premium
   - narrativa forte de marca
- portfólio/cases com valor comercial e SEO

2. **Fundação estrutural para operação futura**
   - API com Igniter.js
   - conteúdo público estruturado
   - leads e contatos em Postgres
   - operação futura por agente de IA, sem painel administrativo nesta fase

## 2. Princípios do Projeto

- O site deve comunicar autoridade, precisão e padrão elevado.
- A homepage é importante, mas o projeto é o site inteiro.
- O portfólio precisa funcionar como prova de capacidade e motor de SEO.
- O front-end será feito primeiro, com **dados mockados nos controllers**.
- O back-end real entra em uma segunda etapa, quando a experiência visual e a arquitetura editorial estiverem consolidadas.
- A modelagem de dados deve preferir **objetos aninhados** a nomes compostos:
  - preferir `partner.name`
  - evitar `partnerName`
- Quando fizer sentido em banco, preferir campos `Json` do Prisma a inflar colunas com nomes achatados.

## 3. Stack Tecnológica

- **Linguagem:** TypeScript
- **Framework Frontend:** Next.js (App Router)
- **Estilização:** Tailwind CSS v4
- **Componentes UI:** Shadcn/UI como base, sem dependência visual de padrões genéricos
- **Framework Backend (API):** Igniter.js
- **Conteúdo público estruturado:** `@igniter-js/collections`
- **Dados sensíveis:** Postgres + Prisma

## 4. Estratégia de Execução

### Fase 1: Planejamento e Direção

- Consolidar sitemap, page blueprints, linguagem visual e arquitetura de conteúdo.
- Consolidar o portfólio de cases com nomes comerciais, links públicos e notas de validação.
- Fechar os docs de planejamento em `docs/planning`.

### Fase 2: Front-end Primeiro

- Implementar o site premium completo.
- Trabalhar com **mocks nos controllers** para simular a futura API.
- Validar copy, hierarquia, motion, assets e navegação antes de acoplar dados reais.

### Fase 3: Arquitetura Real de Dados e API

- Estruturar bounded contexts do Igniter.js.
- Modelar `collections` para conteúdo público.
- Modelar Postgres para leads, contatos e operação sensível.
- Substituir mocks por procedures, services e persistência real.

### Fase 4: Integração e Refino

- Conectar front-end com a API real.
- Refinar SEO, dados estruturados e consistência entre páginas.
- Preparar a base para operação via agente de IA.

## 5. Documentos de Planejamento

- [01_PAGES_TO_RECREATE.md](/Users/felipebarcelospro/Sandbox/nubler/dema-instalacoes/docs/planning/01_PAGES_TO_RECREATE.md)
- [02_COMPONENT_MAP.md](/Users/felipebarcelospro/Sandbox/nubler/dema-instalacoes/docs/planning/02_COMPONENT_MAP.md)
- [03_ASSETS.md](/Users/felipebarcelospro/Sandbox/nubler/dema-instalacoes/docs/planning/03_ASSETS.md)
- [04_API_SCHEMA.md](/Users/felipebarcelospro/Sandbox/nubler/dema-instalacoes/docs/planning/04_API_SCHEMA.md)
- [05_VISUAL_BLUEPRINT.md](/Users/felipebarcelospro/Sandbox/nubler/dema-instalacoes/docs/planning/05_VISUAL_BLUEPRINT.md)
- [06_CONTENT_MODEL.md](/Users/felipebarcelospro/Sandbox/nubler/dema-instalacoes/docs/planning/06_CONTENT_MODEL.md)
- [07_EXECUTION_ROADMAP.md](/Users/felipebarcelospro/Sandbox/nubler/dema-instalacoes/docs/planning/07_EXECUTION_ROADMAP.md)

---
**Status Atual:** Planejamento consolidado, preparando execução front-end first.  
**Próximo Passo:** iniciar implementação visual com dados mockados nos controllers.
