# Confeitaria Gestor

Sistema simples de gestão para confeitaria, com foco em:

- cadastro de empresa
- controle de insumos e estoque
- ficha técnica de produtos
- registro de produção
- registro de vendas
- registro de despesas
- dashboard mensal
- resumo fiscal estimado

## Stack

- Front-end: HTML, CSS e JavaScript puro
- Back-end: Node.js + Express
- Banco: MongoDB + Mongoose

## O que esta versão faz

### 1. Empresa
- cadastra nome fantasia, razão social, CNPJ e regime tributário
- permite configurar alíquota estimada
- permite configurar valor fixo mensal para MEI
- possui botão de consulta de CNPJ preparado para futura integração, mas sem depender de API externa agora

### 2. Insumos
- cadastra ingredientes e materiais
- controla unidade, estoque, custo unitário e estoque mínimo
- alerta quando o estoque está baixo

### 3. Produtos
- cadastra produto final
- monta ficha técnica com base nos insumos
- calcula custo estimado unitário

### 4. Produção
- ao registrar produção, baixa os insumos do estoque
- aumenta o estoque do produto final
- calcula custo total e custo unitário da produção

### 5. Vendas
- baixa o estoque do produto final
- registra faturamento, custo e lucro bruto da venda

### 6. Despesas
- registra despesas operacionais do negócio

### 7. Dashboard
- mostra faturamento
- custo de produção
- lucro bruto
- lucro líquido
- valor estimado do estoque

### 8. Resumo fiscal
- gera um resumo fiscal estimado por mês
- mostra faturamento bruto, despesas, lucro estimado e imposto estimado
- ideal para mandar ao contador e revisar antes de qualquer envio oficial

## Estrutura do projeto

```bash
confeitaria-gestao/
├─ config/
├─ models/
├─ public/
├─ routes/
├─ services/
├─ .env.example
├─ package.json
├─ README.md
└─ server.js
```

## Como instalar do zero

### 1. Instale o Node.js
Baixe e instale uma versão atual do Node.js.

Depois confirme no terminal:

```bash
node -v
npm -v
```

### 2. Instale o MongoDB
Você pode usar:

- MongoDB local
- MongoDB Atlas

### 3. Crie a pasta do projeto

```bash
mkdir confeitaria-gestao
cd confeitaria-gestao
```

### 4. Copie os arquivos deste projeto para dentro da pasta

### 5. Instale as dependências

```bash
npm install
```

### 6. Configure o ambiente
Copie o arquivo `.env.example` para `.env`.

```bash
cp .env.example .env
```

No Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Edite o `.env`:

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/confeitaria_gestao
```

Se usar MongoDB Atlas, troque a URI pela sua.

### 7. Rode o projeto

```bash
npm run dev
```

Ou:

```bash
npm start
```

### 8. Acesse no navegador

```bash
http://localhost:3000
```

## Fluxo recomendado de uso

1. cadastrar empresa
2. cadastrar insumos
3. cadastrar produtos com ficha técnica
4. registrar produção
5. registrar vendas
6. lançar despesas
7. abrir o resumo fiscal do mês

## Observações importantes

- O resumo fiscal é estimativo.
- A alíquota precisa ser revisada com contador.
- A consulta de CNPJ nesta versão está preparada, mas propositalmente não depende de API externa para não quebrar o sistema.
- Ao excluir produção ou venda, esta versão não recompõe estoque automaticamente.

## Melhorias futuras que valem muito a pena

- autenticação de usuário
- edição completa de registros direto pela interface
- estorno automático de estoque ao excluir produção ou venda
- emissão de PDF do resumo fiscal
- integração futura com consulta de CNPJ
- importação e exportação avançada em Excel
- controle de clientes e pedidos
- upload de imagens dos produtos

## Licença

MIT
