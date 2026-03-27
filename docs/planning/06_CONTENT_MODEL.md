# 06 - Content Model

Este documento resume o modelo de conteúdo que vai alimentar o front-end primeiro com mocks e, depois, a API real.

## 1. Objetivo

Garantir que o conteúdo:

- seja consistente no front-end mockado;
- possa migrar para `collections` e banco real sem remodelação grande;
- respeite a preferência por objetos aninhados.

## 2. Entidades Públicas

- `cases`
- `services`
- `pages`
- `partners`

## 3. Entidades Sensíveis

- `leads`
- `contactSubmissions`
- `leadEvents`

## 4. Convenções

- preferir `location.city`, `partner.name`, `content.summary`
- evitar `locationCity`, `partnerName`, `summaryText`
- quando fizer sentido, manter subestruturas como JSON no Prisma

## 5. Prioridade de Conteúdo para Mock

### Primeiro lote

- homepage data
- serviços principais
- cases destaque
- 3 a 5 pages de case
- dados de contato

### Segundo lote

- portfolio completo
- páginas específicas de serviço
- blocos institucionais complementares

## 6. Fonte Primária do Portfólio

Usar [portfolio_obras_dema.md](/Users/felipebarcelospro/Sandbox/nubler/dema-instalacoes/.artifacts/references/portfolio_obras_dema.md) como base para slug, títulos, contexto de mercado e pesquisa de assets.
