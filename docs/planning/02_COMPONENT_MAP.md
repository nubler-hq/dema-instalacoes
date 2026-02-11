# 02 - Mapeamento de Componentes (Original -> Shadcn/UI)

Este documento detalha a "tradução" de cada seção visual do site original para os componentes específicos do Shadcn/UI que serão utilizados na reconstrução.

---

## Página Inicial (`/`)

Análise da página principal, que serve como base para a maioria dos componentes reutilizáveis.

| Seção Original                 | Componente(s) Shadcn/UI Propostos                               | Notas de Implementação                                                                                                   |
| :----------------------------- | :---------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------- |
| **Header (Informações)**       | `Button` (variant: `outline`), Ícones (`lucide-react`)            | Usar Flexbox para alinhar os elementos de contato e os botões.                                                           |
| **Menu de Navegação**          | `NavigationMenu`                                                  | Componente ideal para a estrutura de links principal.                                                                    |
| **Slider Principal (Hero)**    | `Carousel`                                                        | Para replicar o carrossel de imagens. O texto sobreposto será posicionado com classes de posicionamento absoluto do Tailwind. |
| **Principais Serviços**        | `Card`, `CardHeader`, `CardContent`                               | Criar uma grade de `Card`s, cada um representando um serviço.                                                             |
| **Últimos Empreendimentos**    | `Card` (para imagens), `ToggleGroup` (para filtros)               | A galeria será uma grade de `Card`s. O overlay no hover será feito com `group-hover` do Tailwind. Os filtros usarão `ToggleGroup`. |
| **Estágios da Renovação**      | Componente Customizado (baseado em `Card`)                        | Cada um dos 4 estágios será um componente que pode usar a estrutura de um `Card` para agrupar o ícone, título e texto.       |
| **Carrossel de Clientes**      | `Carousel`                                                        | Perfeito para o slider de logos. Configurar para exibir múltiplos itens e, opcionalmente, com auto-scroll.             |
| **Banner de Contato (Footer)** | -                                                                 | Um `div` estilizado com Flexbox para alinhar o texto e o botão.                                                          |
| **Rodapé (Footer)**            | -                                                                 | A estrutura de colunas do rodapé será criada com CSS Grid do Tailwind. Não necessita de um componente Shadcn específico. |

---

## Página de Obras (`/obras`)

**Status:** `A SER ANALISADO`

| Seção Original | Componente(s) Shadcn/UI Propostos | Notas de Implementação |
| :------------- | :-------------------------------- | :--------------------- |
| A definir      | A definir                         | A definir              |

---

## Página de Galeria (`/galeria`)

**Status:** `A SER ANALISADO`

| Seção Original | Componente(s) Shadcn/UI Propostos | Notas de Implementação |
| :------------- | :-------------------------------- | :--------------------- |
| A definir      | A definir                         | A definir              |

---

## Página de Serviços (`/servicos`)

**Status:** `A SER ANALISADO`

| Seção Original | Componente(s) Shadcn/UI Propostos | Notas de Implementação |
| :------------- | :-------------------------------- | :--------------------- |
| A definir      | A definir                         | A definir              |

---

## Página Sobre Nós (`/sobre-nos`)

**Status:** `A SER ANALISado`

| Seção Original | Componente(s) Shadcn/UI Propostos | Notas de Implementação |
| :------------- | :-------------------------------- | :--------------------- |
| A definir      | A definir                         | A definir              |

---

## Página de Contato (`/contato`)

**Status:** `A SER ANALISADO`

| Seção Original      | Componente(s) Shadcn/UI Propostos                             | Notas de Implementação                                                                          |
| :------------------ | :------------------------------------------------------------ | :---------------------------------------------------------------------------------------------- |
| **Formulário**      | `Input`, `Textarea`, `Label`, `Button`                        | Usar `react-hook-form` e `zod` para validação do formulário, integrando com os componentes Shadcn. |
| **Informações**     | Ícones (`lucide-react`)                                       | Usar Flexbox para alinhar ícones com as informações de contato.                                   |
| **Mapa**            | -                                                             | O mapa é um `iframe` do Google Maps, que será mantido.                                          |
