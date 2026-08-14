# Quote Request Email Template

Use this template when sending a quotation request (solicitação de orçamento) to a supplier.

## Subject Format

```
ORÇAMENTO | {order}-{type} | {project.name} | Dema Instalações
```

Example: `ORÇAMENTO | 006-Elétrica | Wise Vila Clementino | Dema Instalações`

## Body Template

```
Olá {supplier.contact}, tudo bem?

Solicito orçamento dos materiais abaixo para a obra:

Obra: {project.name}
Endereço: {project.address}
Faturamento: {project.client} — CNPJ {project.document}

Itens:
{quantity} {unit}  {item.description}
{quantity} {unit}  {item.description}
...

Atenciosamente,
Rebeca Menezes — Dema Instalações
vendas@demainstalacoes.com.br
```

## Item Format

Each item line uses the format:

```
{quantity} {unit}  {description}
```

Examples:
```
240 m  ELETRODUTO GALVANIZADO A FOGO 4" PESADO
30 unid.  CURVA 4" 45° GALVANIZADA
1.000 unid.  PARAFUSO 1/4"
```

## Sending via Himalaya

Write the email to a file, then pipe to `himalaya template send`:

```bash
cat email.txt | himalaya template send
```

## Variables Reference

| Variable | Source | Example |
|----------|--------|---------|
| `{order}` | Quote order number | `006` |
| `{type}` | Quote type (Elétrica, Hidráulica, etc) | `Elétrica` |
| `{project.name}` | projects collection | `Wise Vila Clementino` |
| `{project.address}` | projects collection | `Rua Des. Eliseu Guilherme, 292...` |
| `{project.client}` | projects collection | `SMG22 Empreendimentos...` |
| `{project.document}` | projects collection (CNPJ) | `48.868.032/0001-30` |
| `{supplier.contact}` | suppliers collection (first name) | `Sidny` |
| `{supplier.email}` | suppliers collection | `sidny@ffguarulhos.com.br` |
| `{quantity}` | Item quantity | `240` |
| `{unit}` | Item unit (m, unid., pares, etc) | `m` |
| `{item.description}` | Item description | `ELETRODUTO GALVANIZADO...` |
