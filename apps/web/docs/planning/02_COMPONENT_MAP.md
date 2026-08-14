# 02 - Mapeamento de Componentes

Este documento não trata Shadcn como linguagem visual final. Ele mapeia a base técnica dos componentes, mas a composição deve seguir o blueprint premium do projeto.

## 1. Regras Gerais

- Shadcn/UI é base estrutural, não estética.
- Evitar depender de `Card` como solução padrão.
- Priorizar layout, imagem, tipografia, listas, colunas, divisórias e mídia antes de “encaixotar” conteúdo.
- Hero, cases e blocos institucionais devem ser majoritariamente customizados.

## 2. Componentes Compartilhados

| Bloco | Base técnica | Estratégia |
| :--- | :--- | :--- |
| Header | `NavigationMenu`, `Sheet`, `Button` | Customizar fortemente |
| Footer | Tailwind layout + `Button` | Customizado |
| CTA | `Button` + layout customizado | Customizado |
| Formulário | `Input`, `Textarea`, `Label`, `Select`, `Button` | Shadcn como base |
| Carrossel de logos | `Carousel` | Só se fizer sentido narrativo |
| Menu mobile | `Sheet` ou `Drawer` | Customizado visualmente |

## 3. Homepage (`/`)

| Seção | Base técnica | Observação |
| :--- | :--- | :--- |
| Hero full-bleed | Custom + `Button` | Não usar `Carousel` como solução automática |
| Barra de autoridade | Layout customizado | Sem cards |
| Serviços | Blocos editoriais customizados | Evitar grade de `Card`s genérica |
| Cases em destaque | Grid/layout editorial customizado | Forte dependência de imagem |
| Processo + compliance | Layout customizado | Pode usar ícones, mas não depender deles |
| Parceiros / clientes | Lista, marquee leve ou grid limpo | Evitar parecer “logo cloud SaaS” |
| CTA final | Custom + `Button` | Direto e consultivo |

## 4. Página de Serviços (`/servicos`)

| Seção | Base técnica | Observação |
| :--- | :--- | :--- |
| Hero da página | Custom | Visual forte e contido |
| Lista de serviços | Layout editorial | Um bloco por serviço principal |
| Cases relacionados | Reuso do módulo de cases | Priorizar conexão com casos reais |
| Bloco técnico | Lista / tabela / texto estruturado | Sem excesso de caixas |
| CTA | Reuso do módulo de CTA | Conversão direta |

## 5. Página de Cases (`/cases`)

| Seção | Base técnica | Observação |
| :--- | :--- | :--- |
| Hero da página | Custom | Mais editorial que “banner” |
| Filtros | `Tabs`, `ToggleGroup` ou custom | Escolher a solução mais limpa |
| Índice de cases | Grid editorial customizado | Não virar feed comum |
| CTA | Custom | Fechamento comercial |

## 6. Página de Case (`/cases/[slug]`)

| Seção | Base técnica | Observação |
| :--- | :--- | :--- |
| Hero de case | Custom | Imagem âncora dominante |
| Ficha executiva | Lista estruturada | Sem cards, se possível |
| Desafio / solução / resultados | Blocos editoriais | Forte controle tipográfico |
| Galeria | Grid ou carrossel consciente | Só se houver narrativa |
| Cases relacionados | Reuso do módulo de cases | Curadoria pequena |

## 7. Sobre Nós e Contato

| Página | Base técnica | Observação |
| :--- | :--- | :--- |
| `/sobre-nos` | Layout editorial customizado | Mistura de texto, prova e imagem |
| `/contato` | Form + infos + CTA | Simples, rápido, premium |

## 8. Referência Obrigatória

A sequência de seções e a intenção visual de cada rota estão documentadas em [05_VISUAL_BLUEPRINT.md](/Users/felipebarcelospro/Sandbox/nubler/dema-instalacoes/docs/planning/05_VISUAL_BLUEPRINT.md).
