---
name: Refatorar regime de materiais das obras (budget + visual)
assigned: donna
slug: refatorar-regime-de-materiais-das-obras-budget-visual
type: feature
priority: high
summary: >-
  Adicionar propriedade `budget` (objeto com type/budget/notes) na collection
  customers, migrar os 3 clientes atuais (Wise/GTZ como contract, RYT como
  owner), e ajustar a ObrasPage + ObraKanban para mostrar regime, consumo, saldo
  e alerta visual.
status: finished
worktree:
  enabled: false
chat: df996709-5721-4aec-a3c6-876c99a9fb69
attachments: []
---
# Regime de Materiais das Obras

## Contexto

Hoje a collection `customers` não distingue o regime de materiais da obra. O Ademar explicou que existem dois modelos:

- **Contract (Dema compra)**: a Dema tem uma verba (saldo) e a cada pedido aprovado pelo cliente é abatido do saldo.
- **Owner (cliente compra)**: o cliente solicita e se vira com tudo; a Dema só executa.

Isso muda completamente como acompanhamos a obra financeiramente.

## Decisões fechadas

- **Schema**: propriedade `budget` como objeto: `{ type: "contract" | "owner", budget?: number, notes?: string }`
- **Régua**: consumido = soma de `quote.total` onde `status === "approved"` (aprovação do cliente é o gatilho)
- **Status flow futuro**: depois vamos expandir `status` do quote pra cobrir (sent → client_approved → invoiced → delivered → checked → done). Por enquanto só `approved` abate.
- **Valores iniciais**:
  - **Wise**: `{ type: "contract", budget: 1000000, notes: "Valor estimado - confirmar com Ademar" }`
  - **GTZ 84**: `{ type: "contract", budget: 1600000, notes: "" }`
  - **RYT Paulista**: `{ type: "owner", notes: "Cliente compra materiais direto" }`

## Passos

### 1. Schema da collection `customers`

- Adicionar propriedade `budget` ao schema (objeto opcional, com `type` obrigatório quando presente, `budget` e `notes` opcionais)
- Validar `type` ∈ `["contract", "owner"]`

### 2. Migrar os 3 registros

- **Wise** (id `03be712a-...`): atualizar `budget` com contract + 1.000.000 + nota
- **GTZ 84** (id `89879105-...`): atualizar `budget` com contract + 1.600.000
- **RYT Paulista** (id `5075836f-...`): atualizar `budget` com owner + nota explicativa

### 3. Refatorar `ObrasPage.jsx`

#### Header (`ledger-totals__breakdown`)
Adicionar 2 KPIs novos quando houver obras com budget:
- **Verba total** (soma de budgets das obras `contract`)
- **Saldo disponível** (verba total − soma de cotações aprovadas)

#### ObraRow
Mostrar regime de forma visual:
- Se `budget.type === "contract"`:
  - Barra de progresso (consumido / budget)
  - % consumido
  - Saldo restante em R$
  - Cor da barra: verde (<60%), amarelo (60-90%), vermelho (>90%)
- Se `budget.type === "owner"`:
  - Badge discreto "Materiais por conta do cliente"
  - Mostrar total de cotações como referência (não abate)

#### ObraKanban
Replicar o mesmo card de regime nos cards do kanban pra manter consistência visual.

### 4. Helpers

Criar função utilitária `getBudgetStatus(obra, quotes)` que retorna:
```js
{
  type: "contract" | "owner",
  budget: number,
  consumed: number,    // soma quotes approved
  remaining: number,   // budget - consumed (pode ser negativo)
  percent: number,     // 0-100+
  alert: "ok" | "warn" | "over"
}
```

## Validação

- [ ] Os 3 clientes aparecem corretamente com regime na ObrasPage
- [ ] Wise e GTZ mostram barra de progresso (zerada por enquanto, sem quotes approved)
- [ ] RYT mostra badge "por conta do cliente"
- [ ] Header mostra "Verba total" e "Saldo disponível" somando as duas obras contract
- [ ] Kanban exibe mesma informação que lista
- [ ] Nada quebra em obras sem propriedade `budget` (backward compat)

## Não-escopo (próxima iteração)

- Expandir status do quote (`client_approved`, `invoiced`, `delivered`, `checked`, `done`)
- Gráfico de evolução temporal do consumo
- Alertas proativos (telegram quando >90%)
- Edição inline do budget na UI
