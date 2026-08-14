---
name: Atualizar dashboard para o novo schema de quotes
slug: atualizar-dashboard-para-o-novo-schema-de-quotes
type: task
priority: high
summary: >-
  Revisar e atualizar o dashboard operacional para usar as novas propriedades do
  schema quotes (terms, addresses, comparisonStatus) e garantir boa UI/UX.
status: backlog
worktree:
  enabled: false
attachments: []
---
## Atualizar Dashboard → Schema Quotes

### Contexto
O schema da coleção `quotes` foi atualizado com novas propriedades que precisam ser refletidas no dashboard.

### Mudanças no Schema
- `terms.deliveryTimeframe`, `terms.billingNote`, `terms.deliveryHours`, `terms.generalTerms`, `terms.observations`
- `addresses.delivery` e `addresses.billing` nos customers
- `ie` passou a ser "ISENTO" quando não informado
- `comparisonStatus` (pending, ready, needs_review, excluded)

### Atividades
1. **Revisar** todo o código em `.fractal/artifacts/dashboard/source/src/`
2. **Identificar** uso de propriedades antigas e atualizar
3. **Garantir** boa UI/UX com estados de loading/empty/error
4. **Testar** build (`vite build`)

### Localização
`.fractal/artifacts/dashboard/source/`
