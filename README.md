# Painel de vagas

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
    ├── styles.css                 visual
    └── components/
        ├── Login.jsx              tela de entrada
        ├── Resumo.jsx             os 4 números da faixa verde
        ├── VisaoGeral.jsx         aba de gráficos (vagas por dia, notas, andamento, modelo, cidades)
        ├── graficos.jsx           colunas, barras e anel de nota (SVG/HTML, sem biblioteca)
        ├── VagaLinha.jsx          uma vaga da lista + botões
        ├── Detalhe.jsx            painel lateral (notas, candidatura, histórico, descrição)
        └── Aviso.jsx              aviso "salvo / desfazer"
```

## Rodar no seu PC (opcional)

```
npm install
npm run dev
```
