# Garimpo

_Encontre as vagas que combinam com você._

Marca "Mata & Ouro": um "g" minúsculo cor de areia com uma pepita de ouro dentro do olho da letra, sobre verde-mata. Cores: mata #0f2e26, verde #1f5c4c, areia #f5f1e8, ouro #e0ac3f (só como acento). Letras: Manrope (títulos) e Inter (texto). Símbolo em `src/components/Logo.jsx` e `public/favicon.svg`.


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
        ├── Kanban.jsx             candidaturas em colunas por etapa (arrastar ou "Mover para")
        ├── Detalhe.jsx            painel lateral (notas, candidatura, histórico, descrição)
        └── Aviso.jsx              aviso "salvo / desfazer"
```

## Candidaturas: kanban

Ao clicar em "Inscrever" numa vaga, ela vai direto para **Em análise** (com a data da inscrição). Na aba Candidaturas, cada etapa é uma coluna — Em análise, Teste, Entrevista, Contratado, Não avançou — e o cartão muda de etapa arrastando ou pelo "Mover para". Cada mudança fica no histórico com data e hora.

## Visão geral: filtro cruzado

Clicar numa coluna (dia/mês ou faixa de nota), numa fatia da rosca ou numa barra (modelo, localidade) filtra todos os outros gráficos e os números do topo. Os filtros ativos aparecem no topo; clique de novo ou no ✕ para tirar. Modelo de trabalho e Localidades são dois cartões, um abaixo do outro. Modelo de trabalho e Localidades ficam em cartões separados.

## Design system

Definido no topo de `src/styles.css` (tokens em CSS, claro e escuro):

| Grupo | Tokens | Uso |
|---|---|---|
| Superfícies | `--bg`, `--surface`, `--surface-2`, `--line` | fundo, cartões, realces, bordas |
| Texto | `--ink`, `--mute`, `--faint` | principal, secundário, eixos |
| Marca | `--mata`, `--primary` (verde), `--primary-ink`, `--primary-text`, `--primary-soft` | barra superior, botões, seleção |
| Acento | `--ouro`, `--ouro-text`, `--ouro-soft` | logo, aba ativa, achados (uso escasso) |
| Gráficos | `--bar` | barras de uma série só (verde) |
| Dados | `--s1` candidatar (verde), `--s2` avaliar (ouro), `--s3` pular (azul), `--s4` eliminado (vermelho) | gráficos e etiquetas (validadas para daltonismo) |

Raio 12px nos cartões e 10px nos controles; fontes Manrope (títulos e números) e Inter (texto), empacotadas no site.

## Cena animada da entrada

`src/components/Garimpeiro.jsx` é gerado por `scripts/gerar_garimpeiro.py`: o script define as poses do garimpeiro (posição de cabeça, ombros, cotovelos, mãos, quadril, joelhos, pés, bateia e pepita) e a linha do tempo, e escreve a animação em SVG/SMIL. Para mudar o movimento, edite as poses no script e rode `python3 scripts/gerar_garimpeiro.py`.

## Rodar no seu PC (opcional)

```
npm install
npm run dev
```
