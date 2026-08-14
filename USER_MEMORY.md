# USER_MEMORY.md

> Living memory for user preferences and interaction history. Append-only.

## 1. User Profile
- **Name:** Felipe Barcelos (Nubler)
- **Role:** Lead Developer / Product Owner
- **Timezone:** UTC-3 (Brazil/Sao Paulo)
- **Availability:** Dias úteis

## 2. Preferences
- **Language (Conversation):** PT-BR
- **Detail Level:** Medium (prefere execução direta de tarefas complexas como infra/git)
- **Decision Style:** Collaborative
- **Communication Style:** Direct

## 3. Project Preferences
- **Default Stack:** Next.js (App Router), Tailwind CSS v4, Shadcn/UI, Igniter.js
- **Testing Preferences:** [PENDING]
- **Docs Preferences:** Full (usando docs/planning)

## 4. Interaction & Task History
- [2026-02-11 15:30:00] - Descoberta de repositório (não configurado).
- [2026-02-11 15:40:00] - Recriação do repositório local, criação no GitHub (nubler-hq/dema-instalacoes) via CLI e push inicial.
- [2026-03-25 17:55:00] - Usuário pediu para ler a memória do projeto e iniciar imediatamente a execução do plano já consolidado.
- [2026-03-26 13:15:00] - Usuário solicitou filtros na página de cases e refinamento de UX (espaçamentos).
- [2026-03-26 13:20:00] - Usuário preferiu o CTA de "Trituramos a imprevisibilidade" como padrão global no Footer.
- [2026-03-26 13:30:00] - Usuário deu feedback crítico sobre a qualidade das imagens legacy e solicitou padronização rigorosa de diretórios (`/[slug]/image-001.jpg`).
- [2026-03-26 13:35:00] - Usuário orientou a parar de usar scripts automatizados para assets ("melhor fazer mais manual") visando garantir a qualidade visual final.
- [2026-03-26 17:30:00] - Usuário solicitou redesign premium da página "Sobre Nós" baseado na estética "Titan" (Wealth Management).
- [2026-03-26 18:00:00] - Redesign completo da `/sobre-nos`: implementada estética editorial, visualizações X-ray sob medida e revisão narrativa completa com foco em precisão e confiança técnica.
- [2026-05-21 08:48:06] - Configuração de e-mail consolidada no Himalaya: usar `~/Library/Application Support/himalaya/config.toml` com segredos no Keychain (`himalaya-dema-instalacoes-imap` e `himalaya-dema-instalacoes-smtp`) e conta `dema-instalacoes`.
- [2026-05-21 08:48:06] - Nova skill criada para WhatsApp via `wacli`, com surface documentada a partir de `--help` e instruções assumindo conta já configurada.
- [2026-05-21 08:48:06] - O usuário quer o Atlas configurado como assistente pessoal focado na Dema Instalações, com comportamento Karpathy: esclarecer dúvidas, reportar o plano antes de agir e evitar mudanças especulativas.

## 5. Performance Metrics
- **Average Task Duration:** N/A (Session start)
- **Estimation Accuracy:** 100% (Repo setup)
- **Common Bottlenecks:** N/A

## 6. Special Notes
- Usuário solicitou especificamente o uso da CLI do GitHub (`gh`) para automação de tarefas de infraestrutura.
- [2026-06-19 10:30:00] - Usuário pediu que eu entendesse por completo a planilha `PEDIDO.xlsx` do cliente OR-YT Paulista para que eu possa gerenciá-la operacionalmente em próximas solicitações.
- [2026-06-19 11:10:00] - Usuário solicitou a separação do orçamento FF Guarulhos nº 847.627 em dois pedidos para OR Ryt Paulista, um de hidráulica e outro de elétrica, preservando o template operacional do cliente.
- [2026-06-19 11:35:00] - Usuário sinalizou que é crítico preservar integralmente a formatação/layout visual original dos pedidos em Excel; mudanças em bordas, colunas ou espaçamento do template não são aceitáveis.
- [2026-03-25 16:45:00] - Usuário valorizou um redesign excepcional, com pesquisa de contexto, preservação da essência do branding e elevação clara da percepção visual da marca.
- [2026-03-25 17:10:00] - Usuário esclareceu que prefere planejar o produto inteiro: site completo de alto padrão + API estruturada com Igniter.js/Collections/Postgres, sem painel administrativo nesta fase.
- [2026-03-25 17:55:00] - Usuário deu sinal verde implícito para sair do estado de planejamento e começar pela execução visual do front-end first.
- [2026-03-26 13:40:00] - O usuário é extremamente criterioso com a qualidade das imagens de fachada; se uma imagem extraída estiver ruim, a instrução é buscar alternativas reais no Google para manter o padrão premium.
- [2026-05-21 08:48:06] - Configuração de e-mail aprovada como padrão persistente: Himalaya deve sempre usar o config em `~/Library/Application Support/himalaya/config.toml` e os segredos do Keychain para IMAP/SMTP.
- [2026-05-21 08:48:06] - O usuário quer criar outra skill depois de fechar o fluxo de e-mail; retomar essa ideia como próxima etapa de customização.
- [2026-05-21 08:48:06] - Skill WhatsApp (wacli) criada em `.fractal/skills/whatsapp/`; baseada no `--help` do binário instalado, com referências de comandos e workflows.
- [2026-05-21 08:48:06] - Atlas deve operar como orquestrador/assistente pessoal da Dema com planejamento explícito antes da execução e foco em Fractal native capabilities.
- [2026-06-23 10:13:00] - Criado symlink `.agents/skills` para apontar a `.fractal/skills`, para que o Codex enxergue as skills do Fractal no fluxo do projeto.
- [2026-06-23 10:01:19] - Cotação Fixagold `3029615` do GTZ 84 foi sincronizada como pedido `002-Fixação` e a planilha foi gerada em `.fractal/artifacts/docs/customers/gtz-84/orders/PEDIDO-002-Fixação-gtz-84.xlsx`.
- [2026-06-23 11:03:19] - Ao salvar mapas de cotação no OneDrive, usar o padrão `MAPA_DE_COTACAO_REF_PEDIDO_[Number]_[Type]_<OBRA>_<DDMMYYYY>.xlsx`; para a Wise, o arquivo ficou em `Obras/WISE/Mapa de Cotação/MAPA_DE_COTACAO_REF_PEDIDO_006_ELETRICA_WISE_VILA_CLEMENTINO_16062026.xlsx`.
- [2026-06-23 11:03:19] - Também passou a existir um mini dashboard offline para mapas de cotação em HTML + JSON no mesmo diretório do OneDrive, pensado para compartilhamento por e-mail e leitura rápida de gestor.
- [2026-06-23 11:03:19] - O melhor formato de visualização para mapas de cotação, neste contexto, é: cesta ótima por menor preço, grupos por família técnica, fornecedores comparados por grupo e pendências isoladas quando não houver cotação suficiente.
- [2026-06-23 11:20:00] - Para dashboards HTML compartilháveis com gestores tradicionais, o usuário prefere uma UI mais minimalista, direta e densa: sem card externo envolvendo a página, sem card dentro de card, com máximo aproveitamento da largura da tela e foco em comparação/decisão.
- [2026-06-23 17:30:00] - **Preference confirmed:** Editar records diretamente nos arquivos JSON, não via Fractal CLI. Prefere que eu mesmo edite os arquivos manualmente.
- [2026-06-23 17:30:00] - **Symlink moved + all references updated:** `.fractal/artifacts/one-drive` → `.fractal/drive`. 10 arquivos alterados, 0 referências restantes.
- [2026-06-23 17:45:00] - **Quote records repaired:** Encontrei 10 registros de quotes corrompidos com paths duplicados ou vírgulas faltando. Corrigi todos manualmente nos JSONs.
- [2026-06-24 09:15:00] - O usuário quer que todo orçamento recebido seja rastreado pelo e-mail original, registrado em `quotes` com número correto do pedido e tipo, salvo no Drive como PDF padronizado e acompanhado de um XLSX planilhado com o mesmo nome-base.
- [2026-06-24 09:15:00] - Para gerar um mapa de cotação, sempre começar confirmando número do pedido, tipo e cliente/obra; depois reconciliar e-mail, collections e `.fractal/drive` antes de produzir `data.json`, `DASHBOARD.html` e `DASHBOARD.xlsx`.
