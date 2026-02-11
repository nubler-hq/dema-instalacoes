# Projeto Dema Instalações - Visão Geral

## 1. Objetivo Principal

Este documento descreve o planejamento para a recriação completa do site institucional `demainstalacoes.com.br`. O objetivo é duplo:

1.  **Recriação Visual (Clone):** Desenvolver um novo frontend que seja um clone visualmente idêntico ao site original, utilizando tecnologias modernas para garantir alta performance, responsividade e manutenibilidade.
2.  **Fundação para o Futuro (API):** Construir uma API robusta no backend para, eventualmente, tornar todo o conteúdo do site dinâmico e gerenciável. Isso inclui seções como obras, clientes, galerias e leads de contato.

A primeira fase do projeto focará inteiramente no item 1 (Recriação Visual).

## 2. Stack Tecnológica

-   **Linguagem:** TypeScript
-   **Framework Frontend:** Next.js (App Router)
-   **Estilização:** Tailwind CSS v4
-   **Componentes UI:** Shadcn/UI
-   **Framework Backend (API):** Igniter.js

## 3. Estratégia de Execução

O projeto será executado em fases claras para garantir organização e entrega de valor contínua.

### Fase 1: Análise e Planejamento (Atual)

-   **[CONCLUÍDO]** Realizar um scrape inicial da página principal para análise de viabilidade.
-   **[EM ANDAMENTO]** Criar uma suíte de documentos de planejamento (`/docs/planning`) para centralizar todo o conhecimento e decisões do projeto.
-   **[A FAZER]** Executar uma varredura completa em **todas** as páginas do site (`/obras`, `/servicos`, etc.) para extrair todos os textos, assets (imagens, logos) e entender a estrutura de cada página.

### Fase 2: Recriação do Frontend (Clone Visual)

-   **[A FAZER]** Configurar o ambiente de desenvolvimento Next.js com Tailwind CSS v4 e Shadcn/UI.
-   **[A FAZER]** Mapear cada seção visual do site original para um ou mais componentes Shadcn/UI (conforme `02_COMPONENT_MAP.md`).
-   **[A FAZER]** Desenvolver cada componente, utilizando os textos e assets extraídos (`03_ASSETS.md`) para preenchê-los.
-   **[A FAZER]** Montar as páginas (`/`, `/obras`, etc.) utilizando os componentes criados.
-   **[A FAZER]** Realizar o ajuste fino com TailwindCSS para garantir que o resultado final seja idêntico à screenshot de referência.

### Fase 3: Desenvolvimento da API com Igniter.js

-   **[A FAZER]** Definir o esquema do banco de dados e os modelos da API para Obras, Clientes, Galerias e Leads (conforme `04_API_SCHEMA.md`).
-   **[A FAZER]** Implementar os controllers e procedures no Igniter.js para fornecer os endpoints CRUD.

### Fase 4: Integração Frontend-Backend

-   **[A FAZER]** Substituir o conteúdo estático do frontend por chamadas à API.
-   **[A FAZER]** Garantir que o site seja renderizado estaticamente (SSG) sempre que possível para máxima performance, buscando os dados da API durante o build.

---
**Status Atual:** Fase 1 - Planejamento.
**Próximo Passo:** Concluir a criação dos arquivos de planejamento e iniciar a varredura completa do site.