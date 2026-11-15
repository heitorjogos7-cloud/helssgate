# HELLS GATE – Grimório e Escudo do Mestre

Site estático (`index.html`) + 3 funções da Vercel (`api/`) + banco Upstash Redis para salvar as fichas, monstros, puzzles e notas na nuvem.

## Como publicar (3 passos)

### 1. Subir no GitHub
1. Em github.com, clique em **New repository** (pode ser **Private**), dê um nome e crie.
2. Clique em **uploading an existing file** e arraste TODO o conteúdo desta pasta: `index.html`, `api/`, `lib/`, `package.json`, `vercel.json`, `.gitignore` e `README.md`. Mantenha as pastas `api` e `lib`.
3. Clique em **Commit changes**.

Pelo terminal, se preferir:
```
git init && git add . && git commit -m "Hells Gate"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git
git push -u origin main
```

### 2. Importar na Vercel
1. Em vercel.com, **Add New… > Project** e escolha o repositório.
2. **Framework Preset: Other**. Não mexa em mais nada (sem Build Command, sem Output Directory).
3. Clique em **Deploy**.

### 3. Ligar o banco (para as alterações ficarem salvas)
1. No projeto da Vercel, abra a aba **Storage** (ou **Marketplace**) e adicione **Upstash for Redis** (plano gratuito).
2. Conecte ao projeto. A Vercel cria sozinha as variáveis `KV_REST_API_URL` e `KV_REST_API_TOKEN`.
3. Vá em **Deployments**, abra o último deploy e clique em **Redeploy**.

Pronto. Fichas criadas pelos jogadores e tudo que o mestre salva passam a ficar no banco.

## Senha do mestre
A senha padrão é `273285`. Para trocar (recomendado), em **Settings > Environment Variables** crie `MASTER_PASSWORD` com a nova senha e faça **Redeploy**. Se o repositório for público, troque a senha, porque o padrão está no código.

## Como funciona
- Cada jogador recebe um ID guardado no próprio navegador e só consegue criar UMA ficha. Depois dela criada, só o mestre altera (o servidor bloqueia o resto).
- O servidor limita os valores da ficha (atributos 3 a 18, vida até 38 etc.).
- Monstros, NPCs, puzzles e notas secretas só aparecem para quem digitou a senha do mestre.
- A tela atualiza sozinha a cada 4 segundos.
- Os jogadores precisam abrir sempre no mesmo navegador/aparelho para a ficha continuar reconhecida como deles.

## Estrutura
```
index.html      site inteiro
api/auth.js     confere a senha do mestre
api/fichas.js   fichas dos jogadores
api/mestre.js   monstros, NPCs, puzzles e notas (só mestre)
lib/redis.js    cliente do Upstash Redis
vercel.json     configuração
```
