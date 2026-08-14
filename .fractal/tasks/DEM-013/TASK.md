---
name: Buscar fichas cadastrais e atualizar dados dos clientes
slug: buscar-fichas-cadastrais-e-atualizar-dados-dos-clientes
type: task
priority: medium
summary: >-
  Buscar nos e-mails as fichas cadastrais das empresas (Wise, RYT, GTZ-84),
  conferir/atualizar os dados dos customers na collection e salvar cada ficha na
  pasta CADASTRO dentro da obra correspondente.
status: in_review
worktree:
  enabled: false
chat: 7b20b3ab-ca65-4dbb-9ffb-ed68a141497b
attachments: []
---
## Objetivo

Garantir que os dados cadastrais de todos os clientes estão corretos e completos na collection `customers`.

## Passos

1. **Buscar fichas cadastrais no email**
   - Usar o skill de email para pesquisar na caixa de entrada por fichas cadastrais dos 3 clientes:
     - Wise Vila Clementino (SMG22 Empreendimentos)
     - RYT Paulista
     - GTZ 84 Investimentos
   - Baixar os anexos (PDFs, fichas cadastrais)

2. **Conferir dados**
   - Comparar os dados das fichas com os registros atuais na collection `customers`
   - Verificar: razão social, CNPJ, endereços (agora com `addresses.delivery` e `addresses.billing`), IE, telefone, email de faturamento
   - Atualizar o que estiver diferente

3. **Criar diretório CADASTRO**
   - Para cada obra, criar a pasta: `Obras/{OBRA}/CADASTRO/`
   - Salvar a ficha cadastral (PDF) nessa pasta
   - Seguir as regras de nomenclatura do skill `drive`

## Critérios de aceite
- [ ] Todos os 3 clientes têm ficha cadastral encontrada ou confirmada
- [ ] Dados da collection `customers` batem com as fichas
- [ ] PDFs salvos em `Obras/{OBRA}/CADASTRO/`
