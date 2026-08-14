# 04 - API Schema e Estratégia de Dados

Este documento consolida a estratégia da API e da modelagem de dados para o projeto. Ele substitui a visão anterior mais genérica e passa a refletir as decisões atuais:

- front-end primeiro
- mocks nos controllers inicialmente
- back-end real depois
- `@igniter-js/collections` para conteúdo público
- Postgres + Prisma para dados sensíveis
- preferência por estruturas aninhadas em vez de campos compostos

## 1. Estratégia de Implementação

### Etapa 1: Mock-first

No início da implementação do front-end:

- os controllers podem retornar dados mockados;
- os formatos desses mocks já devem espelhar a modelagem final;
- isso permite desenvolver páginas, seções e navegação antes da persistência real.

### Etapa 2: Back-end real

Depois do front-end consolidado:

- trocar mocks por procedures, services e persistência real;
- manter o shape dos dados o mais estável possível para reduzir retrabalho no front.

## 2. Princípio de Modelagem

Evitar campos compostos como:

- `partnerName`
- `clientName`
- `customerEmail`

Preferir estruturas como:

```ts
partner: {
  name: string
  slug?: string
  website?: string
}
```

ou, em banco:

- usar campos `Json` do Prisma quando a estrutura fizer sentido como objeto embutido;
- usar relações separadas apenas quando houver necessidade real de vida própria do registro.

## 3. Separação de Responsabilidades

### Conteúdo público e editorial
Usar `@igniter-js/collections` para:

- `cases`
- `services`
- `pages`
- `partners`
- FAQs, blocos institucionais e provas sociais

### Dados sensíveis e operacionais
Usar Postgres + Prisma para:

- leads
- contact submissions
- lead events
- ações futuras de agentes/sistemas

## 4. Bounded Contexts Propostos

- `site-content`
- `portfolio`
- `lead`
- `contact`
- `partner`
- `seo`

## 5. Modelos de Conteúdo Público

### `cases`

```ts
type Case = {
  id: string
  slug: string
  title: string
  status: "draft" | "published" | "in_progress" | "delivered"
  partner?: {
    name: string
    slug?: string
    website?: string
  }
  developer?: {
    name: string
    slug?: string
    website?: string
  }
  location: {
    city: string
    state: string
    neighborhood?: string
    addressLine?: string
  }
  market: {
    category?: "residential" | "commercial" | "industrial" | "institutional"
    assetProfile?: string
    positioning?: string
  }
  media: {
    coverImage: string
    gallery?: Array<{
      src: string
      alt?: string
      kind?: string
    }>
  }
  content: {
    summary: string
    technicalDescription?: string
    challenge?: string
    solution?: string
    results?: string[]
  }
  taxonomy: {
    services?: string[]
    segments?: string[]
    tags?: string[]
  }
  seo?: {
    title?: string
    description?: string
  }
  featured?: boolean
  publishedAt?: string
}
```

### `services`

```ts
type Service = {
  id: string
  slug: string
  title: string
  hero?: {
    image?: string
    eyebrow?: string
  }
  content: {
    shortDescription: string
    body?: string
  }
  relationships?: {
    featuredProjectSlugs?: string[]
  }
  seo?: {
    title?: string
    description?: string
  }
}
```

### `pages`

```ts
type Page = {
  id: string
  slug: string
  title: string
  sections: Array<Record<string, unknown>>
  seo?: {
    title?: string
    description?: string
  }
}
```

### `partners`

```ts
type Partner = {
  id: string
  slug: string
  name: string
  brand?: {
    logo?: string
    website?: string
  }
  featured?: boolean
}
```

## 6. Modelos Operacionais em Postgres

### `Lead`

```prisma
model Lead {
  id         String   @id @default(cuid())
  name       String
  email      String
  phone      String?
  whatsapp   String?
  company    String?
  role       String?
  status     String   @default("NEW")
  source     Json?
  interest   Json?
  notes      Json?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

### `ContactSubmission`

```prisma
model ContactSubmission {
  id         String   @id @default(cuid())
  leadId     String?
  channel    String
  payload    Json
  metadata   Json?
  createdAt  DateTime @default(now())
}
```

### `LeadEvent`

```prisma
model LeadEvent {
  id         String   @id @default(cuid())
  leadId     String
  type       String
  payload    Json?
  createdAt  DateTime @default(now())
}
```

## 7. Fluxo da API com Igniter.js

- `controller` recebe a requisição
- `procedure` valida input e expõe a ação no contexto
- `service` concentra regra de negócio
- `collections` ou `database` executam persistência

## 8. Endpoints Iniciais Recomendados

### Conteúdo público

- `GET /cases`
- `GET /cases/:slug`
- `GET /services`
- `GET /services/:slug`
- `GET /pages/:slug`
- `GET /partners`

### Operação e leads

- `POST /contact-submissions`
- `GET /leads`
- `GET /leads/:id`
- `PATCH /leads/:id`

## 9. Regra de Ouro

O shape dos dados do front-end deve ser o mais próximo possível do shape final. Mesmo nos mocks, preferir objetos aninhados e estruturas já compatíveis com a API futura.
