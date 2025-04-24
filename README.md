
### 📦 Instale os pacotes:
```bash
npm i
```

---

### 🚀 Rode em desenvolvimento:
```bash
npm run dev
```

---

### ⚠️ Nota:
Se por ventura a pasta `dist` não estiver presente, rode o comando:
```bash
npm run build
```
Se continuar sem sucesso ou precisar executar o deploy completo, rode:
```bash
npm run deploy
```
---

### 📌 O que o comando `npm run deploy` faz:
- Move a pasta `auth` para `/backup`
- Cria a pasta `backup` se ela não existir
- Concede permissão `777` para as pastas necessárias (compatível com Linux e Windows)
- Move a pasta `auth` de volta para `dist` após o build
- Executa o `tsc` para gerar os arquivos TypeScript na pasta `dist`
- Finaliza processos antigos no **PM2**
- Reinicia o daemon do **PM2**
- Inicia a aplicação via **PM2** rodando o arquivo `dist/app.js`
- Faz os devidos ajustes nas permissões da pasta `dist`
- E organiza os diretórios `media` e `auth` de forma automatizada

---

### ✅ Observação importante:
Certifique-se de que o arquivo `app.js` existe dentro da pasta `dist` antes de iniciar o **PM2**.  
Se não existir, o comando `npm run build` pode ter falhado ou o caminho de saída no `tsconfig.json` não está configurado corretamente.
