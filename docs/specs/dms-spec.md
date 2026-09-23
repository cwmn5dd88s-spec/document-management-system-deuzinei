# Especificação - Document Management System

## 1. Objetivo

Entregar um sistema web para envio, listagem e download de documentos, com armazenamento local dos arquivos e metadados mantidos em memória.

Esta especificação define o MVP alvo. No estado atual do repositório, apenas o endpoint `GET /health` e uma tela React estática estão implementados; os fluxos de documentos descritos abaixo ainda precisam ser desenvolvidos.

## 2. Escopo

### 2.1 Dentro do escopo

- Upload de documentos por formulário web.
- Armazenamento dos arquivos no filesystem local em `backend/storage`.
- Registro dos metadados em memória.
- Listagem dos documentos enviados.
- Download de um documento pelo identificador.
- Identificação do proprietário como `default-user` nesta primeira versão.
- Interface React para upload, listagem e download.
- Tratamento de estados de carregamento, sucesso e erro.
- Endpoint operacional `GET /health`.

### 2.2 Fora do escopo

- Autenticação e autorização reais.
- Múltiplos usuários e isolamento de documentos por usuário.
- Armazenamento externo ou em nuvem.
- Banco de dados.
- Versionamento de documentos.
- Edição, exclusão ou renomeação de documentos.
- Busca, filtros e ordenação avançada.
- Conversão, visualização ou processamento do conteúdo dos arquivos.
- Compartilhamento de documentos.
- Auditoria e histórico de alterações.

## 3. Atores e premissas

### 3.1 Atores

| Ator | Responsabilidade |
| --- | --- |
| Usuário | Selecionar um arquivo, enviá-lo, consultar a lista e baixar documentos. |
| Frontend React | Exibir a interface e consumir a API pelo prefixo `/api`. |
| Backend Express | Validar requisições, coordenar regras de negócio e expor a API. |
| Filesystem local | Armazenar o conteúdo binário dos arquivos enviados. |

### 3.2 Premissas

- O sistema será executado em um ambiente com permissão de leitura e escrita em `backend/storage`.
- O proprietário de todos os documentos será `default-user` até que autenticação seja implementada.
- Os metadados serão perdidos quando o processo for reiniciado, conforme a limitação desta fase.
- O nome original será preservado nos metadados e na resposta de download, mas não será usado diretamente como nome físico do arquivo.

## 4. Requisitos funcionais

| ID | Requisito | Critério de aceite |
| --- | --- | --- |
| RF-01 | O usuário pode enviar um documento. | Uma requisição válida cria um arquivo em `backend/storage` e retorna seus metadados. |
| RF-02 | O upload deve aceitar `multipart/form-data`. | O arquivo deve ser recebido no campo `file`. |
| RF-03 | O sistema deve rejeitar upload sem arquivo. | A API retorna `400` com mensagem de erro clara e não cria metadados. |
| RF-04 | O sistema deve gerar um identificador único. | Cada documento criado recebe um `id` que não coincide com outro documento ativo. |
| RF-05 | O sistema deve registrar o proprietário. | Todo documento criado recebe `owner: "default-user"`. |
| RF-06 | O sistema deve registrar os metadados do arquivo. | A resposta contém `id`, `originalName`, `size`, `uploadedAt` e `owner`. |
| RF-07 | O usuário pode listar os documentos enviados. | `GET /documents` retorna `200` e uma lista JSON de metadados. |
| RF-08 | O usuário pode baixar um documento pelo identificador. | Um ID válido retorna o conteúdo binário do arquivo correspondente. |
| RF-09 | O sistema deve rejeitar ID inexistente. | O download de um ID não cadastrado retorna `404`. |
| RF-10 | O sistema deve tratar falhas de armazenamento. | Falhas de filesystem retornam `500` sem expor stack trace ao cliente. |
| RF-11 | O sistema deve informar sua disponibilidade. | `GET /health` retorna `200` e `{ "status": "ok" }`. |
| RF-12 | O frontend deve atualizar a listagem após upload. | Após uma resposta de sucesso, o documento aparece na lista sem exigir recarga manual da página. |
| RF-13 | O frontend deve permitir o download. | Cada documento listado possui uma ação que inicia o download pelo endpoint correspondente. |
| RF-14 | O frontend deve exibir erros de operação. | Erros de upload, listagem e download são apresentados ao usuário de forma compreensível. |

## 5. Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| RNF-01 | O backend deve usar Node.js, Express e CommonJS. |
| RNF-02 | O frontend deve usar React, Vite e módulos ESM. |
| RNF-03 | O armazenamento dos arquivos deve usar Multer com `diskStorage`. |
| RNF-04 | Os arquivos devem ser gravados exclusivamente em `backend/storage`. |
| RNF-05 | Os metadados devem ser mantidos em memória nesta fase. |
| RNF-06 | A arquitetura do backend deve seguir `routes -> controllers -> services -> repositories`. |
| RNF-07 | As camadas internas não devem depender diretamente de detalhes HTTP ou da interface do frontend. |
| RNF-08 | A configuração operacional deve usar variáveis de ambiente quando aplicável, incluindo `PORT`. |
| RNF-09 | O backend deve tratar erros nos limites do sistema e retornar respostas HTTP consistentes. |
| RNF-10 | O frontend deve acessar o backend usando `fetch` e o prefixo `/api`. |
| RNF-11 | Os nomes de arquivos físicos devem ser gerados pelo sistema para evitar colisões e problemas de segurança. |
| RNF-12 | O sistema não deve depender de provedores externos de armazenamento. |
| RNF-13 | O código deve manter funções pequenas, responsabilidades únicas e evitar abstrações desnecessárias. |
| RNF-14 | O comportamento principal deve ser coberto por testes automatizados do backend. |

## 6. Modelo de dados

### 6.1 Metadados do documento

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `id` | string | Sim | Identificador único gerado pelo sistema. |
| `originalName` | string | Sim | Nome original do arquivo enviado pelo usuário. |
| `size` | number | Sim | Tamanho do arquivo em bytes. |
| `uploadedAt` | string | Sim | Data e hora do upload no formato ISO 8601. |
| `owner` | string | Sim | Identificador do proprietário; valor `default-user` no MVP. |

### 6.2 Invariantes

- `id` não pode ser vazio e deve ser único durante a execução do processo.
- `originalName` deve ser retornado como informação, mas não deve controlar o caminho físico do arquivo.
- `size` deve ser um número inteiro maior ou igual a zero.
- `uploadedAt` deve ser uma data ISO 8601 válida.
- `owner` deve ser preenchido em todos os registros.
- O arquivo físico deve ser associado ao metadado por um nome interno seguro, que não precisa ser exposto na API.
- Um registro de metadados não deve ser criado quando o armazenamento do arquivo falhar.

## 7. Contratos de API

A API é exposta pelo backend sem o prefixo `/api`. O proxy do Vite adiciona e remove esse prefixo no desenvolvimento para o frontend.

### 7.1 `GET /health`

Verifica se o backend está disponível.

**Resposta de sucesso: `200 OK`**

```json
{
  "status": "ok"
}
```

### 7.2 `POST /upload`

Envia um documento.

**Entrada**

- Content-Type: `multipart/form-data`.
- Campo obrigatório: `file`.
- Deve ser enviado no máximo um arquivo por requisição.

**Resposta de sucesso: `201 Created`**

```json
{
  "id": "generated-id",
  "originalName": "relatorio.pdf",
  "size": 24576,
  "uploadedAt": "2026-09-23T12:00:00.000Z",
  "owner": "default-user"
}
```

**Erros**

- `400 Bad Request`: campo `file` ausente ou requisição inválida.
- `413 Payload Too Large`: quando um limite de tamanho for configurado e excedido.
- `500 Internal Server Error`: falha ao gravar o arquivo ou registrar os metadados.

Resposta de erro:

```json
{
  "error": "Descrição pública do erro"
}
```

### 7.3 `GET /documents`

Lista os documentos conhecidos pelo processo atual.

**Resposta de sucesso: `200 OK`**

```json
[
  {
    "id": "generated-id",
    "originalName": "relatorio.pdf",
    "size": 24576,
    "uploadedAt": "2026-09-23T12:00:00.000Z",
    "owner": "default-user"
  }
]
```

Uma lista sem documentos deve retornar `200` com `[]`.

### 7.4 `GET /documents/:id/download`

Baixa o arquivo associado ao identificador informado.

**Resposta de sucesso: `200 OK`**

- Corpo: conteúdo binário do arquivo.
- `Content-Disposition`: deve indicar o nome original de forma segura.
- `Content-Type`: deve refletir o tipo disponível do arquivo ou usar um tipo binário genérico quando não houver informação confiável.

**Erros**

- `400 Bad Request`: identificador vazio ou inválido.
- `404 Not Found`: não existe metadado ou arquivo correspondente ao ID.
- `500 Internal Server Error`: falha ao ler o arquivo.

## 8. Arquitetura

### 8.1 Backend

O backend deve manter o fluxo:

```text
routes -> controllers -> services -> repositories
```

- `routes/`: registra métodos e caminhos HTTP e delega para controllers.
- `controllers/`: interpreta a requisição, chama o serviço e monta a resposta HTTP.
- `services/`: concentra regras de negócio, geração de metadados e coordenação do armazenamento.
- `repositories/`: mantém os metadados em memória e encapsula operações de persistência e consulta.
- `app.js`: configura o Express, middlewares e rotas.

O controller não deve conter regras de persistência. O repository não deve conhecer objetos de requisição ou resposta HTTP.

### 8.2 Frontend

A organização deve seguir os diretórios existentes:

- `components/`: formulário de upload, lista e item de documento.
- `pages/`: composição da tela principal do gerenciador.
- `services/`: funções `fetch` para upload, listagem e download.
- `App.jsx`: composição principal da aplicação.

A interface deve ter, no mínimo:

- campo para selecionar arquivo;
- botão de envio;
- indicador de carregamento durante o upload;
- mensagem de sucesso ou erro;
- lista com nome, tamanho, data e proprietário;
- ação de download para cada item;
- estado vazio quando não houver documentos;
- estado de carregamento e erro ao buscar a lista.

## 9. Configuração e execução

### 9.1 Backend

- `npm start`: inicia o backend.
- `npm run dev`: inicia o backend em modo de desenvolvimento.
- `npm test`: executa os testes nativos do Node.
- Porta padrão: `3000`.
- Variável de ambiente: `PORT`.
- Diretório de armazenamento padrão: `backend/storage`.

### 9.2 Frontend

- `npm run dev`: inicia o servidor Vite.
- `npm run build`: gera o build de produção.
- `npm run preview`: serve o build gerado.
- O proxy `/api` deve encaminhar as chamadas para o backend em `http://localhost:3000`.

## 10. Testes e critérios de aceite

### 10.1 Backend

Devem existir testes para:

- exportação e inicialização do app;
- `GET /health`;
- upload válido;
- upload sem arquivo;
- geração e formato dos metadados;
- listagem vazia e com documentos;
- download válido;
- download de ID inexistente;
- falha de leitura ou armazenamento;
- confirmação de que o arquivo é criado em `backend/storage`.

### 10.2 Frontend

A validação deve confirmar:

- seleção e envio de um arquivo;
- exibição de sucesso após upload;
- atualização da lista;
- exibição dos metadados principais;
- acionamento do download;
- mensagens de erro e estados de carregamento;
- build bem-sucedido com `npm run build`.

### 10.3 Fluxo manual mínimo

1. Iniciar o backend.
2. Iniciar o frontend.
3. Abrir a aplicação no navegador.
4. Enviar um arquivo válido.
5. Confirmar que o item aparece na lista.
6. Confirmar a existência do arquivo em `backend/storage`.
7. Baixar o arquivo e verificar seu conteúdo.
8. Tentar enviar sem selecionar arquivo.
9. Tentar acessar um ID inexistente.

## 11. Plano de execução

1. Criar ou completar o repository em memória para metadados.
2. Configurar o diretório de storage e o Multer com `diskStorage`.
3. Implementar o service de upload, incluindo ID, data, owner e tratamento de falhas.
4. Implementar controller e rota `POST /upload`.
5. Implementar consulta de documentos e rota `GET /documents`.
6. Implementar localização e leitura do arquivo e rota `GET /documents/:id/download`.
7. Expandir os testes do backend para os contratos e cenários de erro.
8. Criar os serviços `fetch` do frontend.
9. Criar os componentes e a página de gerenciamento de documentos.
10. Integrar upload, listagem, estados de interface e download.
11. Executar testes automatizados, build do frontend e fluxo manual mínimo.
12. Revisar mensagens, limites, segurança dos nomes físicos e documentação.

## 12. Estado atual e lacunas

O repositório inicial contém:

- `GET /health` implementado no backend.
- Um teste smoke que verifica a exportação do app.
- Uma tela React estática.
- Proxy `/api` configurado no Vite.
- Diretório `backend/storage` reservado.

Ainda precisam ser implementados:

- rotas, controllers, services e repositories de documentos;
- configuração efetiva do Multer;
- persistência local dos arquivos;
- metadados em memória;
- upload, listagem e download;
- componentes e serviços do frontend;
- testes dos contratos e dos casos de erro.
