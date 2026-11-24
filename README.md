# Garimpo

_Menos cascalho. Mais vagas que valem ouro._

Marca ("Pepita"): uma pepita de ouro lapidada com um brilho, sobre grafite; letra Sora; cores grafite #17181c, ouro #e8a314, brilho #ffd36b, sombra #c7850a, papel #f6f4ef. Símbolo em `src/components/Logo.jsx` e `public/favicon.svg`.


Painel em **React + CSS** (Vite) para avaliar vagas e acompanhar candidaturas.
Os dados ficam no Supabase e só aparecem com login (cadastro de novos usuários desligado e RLS ativo).
A chave no código é a chave **publicável** do Supabase, feita para ficar em páginas públicas.

No ar: https://thiagovictoria.github.io/busca-vagas-painel/
(cada push na `main` gera o build e publica sozinho, pelo workflow `.github/workflows/deploy.yml`).

## Estrutura

```
busca-vagas-painel/
├── .github/workflows/deploy.yml   build + publicação no GitHub Pages
├── index.html                     casca da página (carrega src/main.jsx)
├── package.json                   dependências (React, Vite, supabase-js)
├── vite.config.js                 base = /busca-vagas-painel/
└── src/
    ├── main.jsx                   liga o React na página
    ├── App.jsx                    login, carga dos dados, abas, filtros, lista
    ├── config.js                  conexão Supabase, situações, critérios
    ├── format.js                  datas, salário, cores da nota
    ├── periodo.js                 período da Visão geral (7/30 dias ou ano)
    ├── styles.css                 visual
    └── components/
        ├── Login.jsx              tela de entrada
        ├── Resumo.jsx             os 4 números do topo
        ├── VisaoGeral.jsx         aba de gráficos (vagas por dia/mês, notas, rosca por recomendação, modelo, localidades)
        ├── graficos.jsx           colunas, barras, rosca e anel de nota (SVG/HTML, sem biblioteca)
        ├── VagaLinha.jsx          uma vaga da lista + botões
        ├── Detalhe.jsx            painel lateral (notas, candidatura, histórico, descrição)
        └── Aviso.jsx              aviso "salvo / desfazer"
```

## Visão geral: filtro cruzado

Clicar numa coluna (dia/mês ou faixa de nota), numa fatia da rosca ou numa barra (modelo, localidade) filtra todos os outros gráficos e os números do topo. Os filtros ativos aparecem no topo; clique de novo ou no ✕ para tirar. Modelo de trabalho e Localidades são dois cartões, um abaixo do outro. Modelo de trabalho e Localidades ficam em cartões separados.

## Design system

Definido no topo de `src/styles.css` (tokens em CSS, claro e escuro):

| Grupo | Tokens | Uso |
|---|---|---|
| Superfícies | `--bg`, `--surface`, `--surface-2`, `--line` | fundo, cartões, realces, bordas |
| Texto | `--ink`, `--mute`, `--faint` | principal, secundário, eixos |
| Marca | `--primary` (ouro), `--primary-ink` (grafite), `--primary-text`, `--primary-soft` | botões, aba ativa, seleção, textos em ouro legíveis |
| Gráficos | `--bar` | barras de uma série só (o ouro fica para destaque) |
| Dados | `--s1` candidatar, `--s2` avaliar, `--s3` pular, `--s4` eliminado | gráficos e etiquetas (validadas para daltonismo) |

Raio 12px nos cartões e 10px nos controles; fontes Sora (títulos e números) e Inter (texto), empacotadas no site.

## Rodar no seu PC (opcional)

```
npm install
npm run dev
```
