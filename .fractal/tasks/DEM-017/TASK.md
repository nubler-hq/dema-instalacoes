---
name: Investigar e-mails históricos (6 meses) e documentar processos da Dema
slug: investigar-e-mails-historicos-6-meses-e-documentar-processos-da-dema
type: task
priority: high
summary: >-
  Pesquisar todos os e-mails dos últimos 6 meses, mapear processos, regras,
  gargalos e criar relatório estruturado. Cadastrar obras novas e quotes
  pendentes.
status: backlog
worktree:
  enabled: false
attachments: []
---
## Investigação Completa — Histórico de 6 meses

### Objetivo
Pesquisar todos os e-mails dos últimos 6 meses para entender completamente como a Dema trabalhava, documentar todos os processos, regras, gargalos e pontos de desorganização.

### Escopo
- Buscar e-mails desde ~dezembro/2025 (6 meses)
- Identificar **todas as obras** (novas ou existentes)
- Identificar **todos os fornecedores** consultados
- Mapear o **ciclo de vida completo** de cada pedido (cotação → aprovação → compra → entrega)
- Identificar **gargalos**, retrabalhos, aprovações pendentes

### Atividades
1. **Pesquisar** e-mails de fornecedores, clientes, Ademar e engenheiras
2. **Identificar** obras não cadastradas e registrá-las na collection `customers`
3. **Identificar** fornecedores não cadastrados e registrá-los na collection `suppliers`
4. **Criar pastas** no Drive para obras novas seguindo a estrutura canônica (`Obras/{Obra}/Pedidos/{Number}-{Type}/`)
5. **Baixar** PDFs de cotações e registrá-los na collection `quotes` com status correto:
   - `quoted` → cotações recebidas em análise
   - Se um fornecedor perdeu a concorrência → marcar como `recusado`
6. **Criar** relatório em `RELATORIO.md` com diagramas Mermaid

### Estrutura do Relatório
- **Introdução** — contexto da investigação
- **Processos Mapeados** com Mermaid:
  - Fluxo de cotação (pedido → fornecedores → comparação → aprovação)
  - Fluxo de compra (aprovação → emissão → recebimento)
  - Fluxo de comunicação com engenheiras/clientes
- **Regras de Negócio**: nomenclatura, status, regime materiais, hierarquia
- **Gargalos Identificados**: processos manuais, rastreabilidade, docs espalhadas
- **Obras Encontradas** — tabela
- **Fornecedores Encontrados** — tabela
- **Lições e Recomendações**

### Arquivo
`.fractal/tasks/<task_id>/attachments/RELATORIO.md`
