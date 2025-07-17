# Diagnóstico: Erro 401 no Login - MongoDB Atlas

## Problema Identificado

O sistema está retornando erro 401 (Unauthorized) ao tentar fazer login através do endpoint `POST /api/auth/login`.

## Análise do Problema

### 1. Configuração de Banco de Dados

**Status**: ❌ **INCONSISTÊNCIA ENCONTRADA**

- **Arquivo .env local**: `mongodb://localhost:27017/gamificacao_vendas`
- **Conexão real da aplicação**: `ac-4sody2w-shard-00-01.7trpe6w.mongodb.net` (MongoDB Atlas)

### 2. Fluxo de Autenticação

O sistema executa as seguintes verificações no login:

1. ✅ Validação de dados de entrada (email e senha)
2. ❌ **FALHA**: Busca do usuário no banco de dados
3. ❌ **FALHA**: Verificação de conta ativa
4. ❌ **FALHA**: Comparação de senha

### 3. Possíveis Causas do Erro 401

1. **Banco de dados vazio**: Não existem usuários cadastrados no MongoDB Atlas
2. **Credenciais incorretas**: Email/senha não correspondem a nenhum usuário
3. **Conta desativada**: Usuário existe mas está com `isActive: false`
4. **Problema de hash de senha**: Falha na comparação bcrypt

## Soluções Recomendadas

### 1. Corrigir Configuração do Banco

Atualizar o arquivo `.env` com a string de conexão correta do MongoDB Atlas:

```env
MONGODB_URI=mongodb+srv://username:password@ac-4sody2w-shard-00-01.7trpe6w.mongodb.net/gamificacao_vendas?retryWrites=true&w=majority
```

**Substitua `username` e `password` pelas credenciais corretas.**

### 2. Criar Usuários no MongoDB Atlas

Execute o script de seeding com a configuração correta:

```bash
# Após atualizar o .env com as credenciais do Atlas
npm run seed
```

### 3. Verificar Usuários Existentes

Use o script de teste criado para verificar se existem usuários:

```bash
node test-auth.js
```

### 4. Criar Usuário de Teste Manualmente

Se necessário, execute este código para criar um usuário de teste:

```javascript
// Via MongoDB Compass ou script
{
  "name": "Admin User",
  "email": "admin@exemplo.com",
  "password": "$2b$12$hashedPasswordHere", // Hash da senha "123456"
  "role": "admin",
  "isActive": true,
  "createdAt": new Date(),
  "updatedAt": new Date()
}
```

## Testes de Verificação

### 1. Testar Conectividade

```bash
# Verificar se consegue conectar ao Atlas
node -e "
require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log('✅ Conectado ao MongoDB Atlas');
  process.exit(0);
}).catch(err => {
  console.log('❌ Erro de conexão:', err.message);
  process.exit(1);
});
"
```

### 2. Testar Login via cURL

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@exemplo.com", "password": "123456"}'
```

## Próximos Passos

1. **Obter credenciais do MongoDB Atlas**
2. **Atualizar .env com a string de conexão correta**
3. **Executar seeding para criar usuários**
4. **Testar login novamente**

## Log de Erros Identificados

```
POST /api/auth/login 401 46.135 ms - 52
POST /api/auth/login 401 15.687 ms - 52
```

**Código 401**: Indica que as credenciais fornecidas não foram aceitas pelo sistema.

## Contatos para Resolução

- Verificar com a equipe de DevOps as credenciais do MongoDB Atlas
- Confirmar se o ambiente de produção está usando as variáveis corretas
- Validar se existe um usuário administrador no banco de dados

---

## 🔍 DIAGNÓSTICO FINAL

### Problema Encontrado
O erro 401 no login é causado por **timeout de conexão com MongoDB**:
```
Operation `users.findOne()` buffering timed out after 10000ms
```

### Causa Raiz
1. **Configuração Local vs Produção**: 
   - Arquivo `.env` local: `mongodb://localhost:27017`
   - Log de produção mostra: `ac-4sody2w-shard-00-01.7trpe6w.mongodb.net`
   
2. **MongoDB Local Indisponível**: Não há MongoDB rodando localmente

3. **Credenciais Atlas**: Faltam as credenciais corretas do MongoDB Atlas

### ✅ SOLUÇÃO IMPLEMENTADA

1. **Arquivo .env atualizado** com o host correto do Atlas
2. **Logs de debug adicionados** para melhor diagnóstico
3. **Template da URI** criado (precisa das credenciais)

### 🚨 AÇÃO NECESSÁRIA

**Atualize o arquivo `.env` com as credenciais corretas:**

```env
MONGODB_URI=mongodb+srv://SEU_USUARIO:SUA_SENHA@ac-4sody2w-shard-00-01.7trpe6w.mongodb.net/gamificacao_vendas?retryWrites=true&w=majority
```

**Substitua:**
- `SEU_USUARIO`: nome de usuário do MongoDB Atlas
- `SUA_SENHA`: senha do MongoDB Atlas

### 🧪 TESTE APÓS CORREÇÃO

```bash
# 1. Reiniciar servidor
npm start

# 2. Testar login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@exemplo.com", "password": "123456"}'
```

**Status**: ⚠️ **AGUARDANDO CREDENCIAIS DO MONGODB ATLAS**

**Última atualização**: 2024-12-19