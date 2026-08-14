# 07 - Execution Roadmap

## 1. Estratégia

Executar em duas macroetapas:

1. front-end completo com mocks
2. back-end real e integração

## 2. Ordem Recomendada

### Etapa A - Front-end

1. design tokens e layout global
2. header / footer
3. homepage
4. páginas institucionais
5. cases e pages de case
6. ajustes de SEO e polish visual

### Etapa B - Back-end

1. bounded contexts
2. schemas Zod
3. collections públicas
4. Postgres para leads
5. controllers, procedures e services
6. troca dos mocks pela API real

## 3. Critério para começar

Podemos começar com confiança quando:

- page blueprints estiverem fechados
- portfólio base estiver organizado
- modelo de conteúdo estiver estável
- mocks iniciais tiverem shape compatível com a API futura

## 4. Observação

O objetivo é evitar retrabalho: o front anda rápido agora, mas sem comprometer a modelagem de dados futura.
