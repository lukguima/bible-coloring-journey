# Flow Image Worker — Chrome Extension

Automatiza a geração de imagens no Google Flow (ImageFX) e envia os resultados para o Content Studio.

## Instalação

1. Abra o Chrome e acesse `chrome://extensions/`
2. Ative o **Modo do desenvolvedor** (canto superior direito)
3. Clique em **Carregar sem compactação** (Load unpacked)
4. Selecione a pasta `flow-image-worker/`
5. A extensão aparecerá na barra de ferramentas (ícone roxo)

## Configuração

1. Clique no ícone da extensão para abrir o popup
2. Clique na seção **Configurações** para expandir
3. Preencha:
   - **URL do Content Studio**: endereço do seu backend (ex: `http://localhost:3000`)
   - **Bearer Token**: token de autenticação do Content Studio
   - **Delay mín/máx**: intervalo aleatório entre ações (em ms) — deixe entre 3000-8000 para comportamento natural
   - **Tentativas máx.**: quantas vezes tentar antes de desistir de um job
   - **Prefixo do arquivo**: prefixo dos arquivos de imagem enviados
4. Clique em **Salvar Configurações**

## Uso

1. Abra o Google Flow: `https://labs.google/fx/tools/image-fx`
2. Certifique-se de estar logado na sua conta Google
3. Clique no ícone da extensão e depois em **▶ Iniciar**
4. O worker vai automaticamente:
   - Buscar o próximo job no Content Studio
   - Inserir o prompt no campo de texto do Flow
   - Clicar em Gerar
   - Aguardar a imagem ficar pronta
   - Baixar a imagem e fazer upload para o Content Studio
   - Repetir para o próximo job

## Controles

| Botão | Ação |
|-------|------|
| ▶ Iniciar | Começa a processar jobs |
| ⏸ Pausar | Pausa após o job atual terminar |
| ▶ Retomar | Continua de onde parou |
| ⏹ Parar | Para imediatamente |

## API do Content Studio esperada

A extensão consome estes endpoints:

```
GET  /api/flow-worker/next-job?sessionId={id}    → próximo job disponível
POST /api/flow-worker/job/{id}/status            → atualiza status do job
POST /api/flow-worker/job/{id}/result            → upload da imagem (multipart)
POST /api/flow-worker/job/{id}/error             → reporta erro
POST /api/flow-worker/job/{id}/request-safe-rewrite → solicita reescrita do prompt
POST /api/flow-worker/session/heartbeat          → heartbeat da sessão
GET  /api/flow-worker/health                     → verificação de conexão
```

## Solução de problemas

**"Campo de prompt não encontrado"**: O Google Flow pode ter atualizado a interface. Verifique se a URL é `https://labs.google/fx/tools/image-fx` e que a página carregou completamente.

**"Botão de gerar desabilitado"**: Aguarde o campo de prompt receber foco. O Google Flow pode precisar de um momento após a digitação.

**"Token inválido"**: Verifique se o token no popup corresponde ao configurado no Content Studio.

**Imagens não aparecem**: O worker detecta imagens por seletores CSS. Se o Google Flow mudar o layout, os seletores em `content.js` (seção `IMAGE_RESULT_SELECTORS`) precisam ser atualizados.
