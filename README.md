# Sistema de Gamificação Empresarial para Vendas

Um sistema completo de gamificação desenvolvido para motivar e otimizar a performance de equipes de vendas através de elementos de jogos, rankings, conquistas e metas.

## 🚀 Tecnologias Utilizadas

### Backend
- **Node.js 16+** - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB 5.x** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticação baseada em tokens
- **bcryptjs** - Hash de senhas
- **express-validator** - Validação de dados
- **helmet** - Segurança HTTP
- **cors** - Cross-Origin Resource Sharing
- **morgan** - Logger HTTP
- **compression** - Compressão de resposta
- **express-rate-limit** - Rate limiting
- **multer** - Upload de arquivos

### Frontend
- **React 18** - Biblioteca de interface
- **Vite** - Build tool e dev server
- **Material-UI (MUI)** - Biblioteca de componentes
- **React Router Dom** - Roteamento
- **Axios** - Cliente HTTP
- **React Hook Form** - Gerenciamento de formulários
- **Yup** - Validação de esquemas
- **Framer Motion** - Animações
- **React Hot Toast** - Notificações
- **Recharts** - Gráficos e visualizações
- **date-fns** - Manipulação de datas

## 📋 Funcionalidades

### 🔐 Autenticação e Autorização
- Sistema de login/registro com JWT
- Dois perfis de usuário: **Administrador** e **Colaborador**
- Middleware de autenticação e autorização
- Gerenciamento seguro de sessões

### 💰 Gerenciamento de Vendas (CRUD)
- Registro completo de vendas com dados do cliente e produto
- Edição e atualização de vendas existentes
- Listagem filtrada por período, status, vendedor
- Exclusão de vendas (apenas administradores)
- Cálculo automático de comissões
- Status de venda: Pendente, Confirmada, Cancelada, Reembolsada

### 🏆 Sistema de Ranking
- **Top 5 vendedores** em destaque no pódio
- Lista completa de vendedores ordenada por performance
- Filtros por período (dia, semana, mês, ano)
- Estatísticas detalhadas de cada vendedor
- Posição no ranking global

### 📊 Barras de Progresso de Metas
- **Metas diárias** com progresso em tempo real
- **Metas semanais** com acompanhamento semanal
- **Metas mensais** com visão mensal
- Indicadores visuais de progresso
- Alertas quando próximo do objetivo

### 🎖️ Sistema de Conquistas (Badges)
- **Conquistas por níveis**: Bronze, Prata, Ouro
- **Raridade dos badges**: Comum, Raro, Épico, Lendário
- Conquistas automáticas baseadas em critérios:
  - Primeira venda
  - Volume de vendas
  - Metas consecutivas
  - Top vendedor do mês
  - Tempo de serviço
- Histórico completo de conquistas
- Sistema de experiência (XP) e níveis

### 👤 Perfil do Colaborador
- **Foto de perfil** personalizável
- **Total de vendas** acumulado
- **Últimas conquistas** obtidas
- **Posição no ranking** atual
- **Estatísticas pessoais** detalhadas
- Edição de dados pessoais

### 🎯 Simulador de Metas
- Análise do histórico de vendas
- **Sugestão inteligente** de metas baseada na performance
- Cálculo de metas diárias com base no objetivo mensal
- **Probabilidade de sucesso** baseada no histórico
- **Sugestões personalizadas** para melhorar performance

### 📈 Dashboard Administrativo
- **Gráficos de barras** - Volume de vendas por período
- **Gráficos de linha** - Tendência de vendas ao longo do tempo
- **Gráficos de pizza** - Vendas por categoria de produto
- **KPIs principais**: Total de vendas, usuários ativos, meta mensal
- **Estatísticas em tempo real**
- **Filtros por período** personalizáveis

### 👥 Gerenciamento de Usuários (Admin)
- CRUD completo de usuários
- Definição de metas individuais
- Ativação/desativação de contas
- Redefinição de senhas
- Atribuição de perfis (Admin/Colaborador)
- Visualização de estatísticas por usuário

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js 16+ instalado
- MongoDB 5.x instalado e rodando
- Git

### Backend

1. **Clone o repositório**
```bash
git clone <repository-url>
cd backend
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. **Inicie o servidor**
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

5. **Execute os testes**
```bash
npm test
```

### Frontend

1. **Navegue para o diretório frontend**
```bash
cd frontend
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
# Configure a URL da API
```

4. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

5. **Build para produção**
```bash
npm run build
```

## 📁 Estrutura do Projeto

```
├── backend/
│   ├── src/
│   │   ├── config/           # Configurações (DB, etc.)
│   │   ├── controllers/      # Controladores das rotas
│   │   ├── middleware/       # Middlewares (auth, validation)
│   │   ├── models/          # Modelos do MongoDB
│   │   ├── routes/          # Definição das rotas
│   │   ├── services/        # Lógica de negócio
│   │   ├── utils/           # Utilitários
│   │   ├── validations/     # Esquemas de validação
│   │   └── app.js           # Aplicação principal
│   ├── tests/               # Testes automatizados
│   ├── uploads/             # Arquivos de upload
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   │   ├── layout/      # Layout da aplicação
│   │   │   ├── auth/        # Componentes de autenticação
│   │   │   ├── dashboard/   # Componentes do dashboard
│   │   │   ├── sales/       # Componentes de vendas
│   │   │   ├── achievements/# Componentes de conquistas
│   │   │   └── common/      # Componentes comuns
│   │   ├── contexts/        # Context API (estado global)
│   │   ├── hooks/           # Custom hooks
│   │   ├── pages/           # Páginas da aplicação
│   │   ├── services/        # Serviços (API calls)
│   │   ├── theme/           # Tema personalizado MUI
│   │   ├── utils/           # Utilitários
│   │   └── App.jsx          # Componente principal
│   └── package.json
│
└── README.md
```

## 🔑 Variáveis de Ambiente

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/gamificacao_vendas
JWT_SECRET=seu_jwt_secret_aqui
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 📊 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `GET /api/auth/me` - Dados do usuário atual
- `PUT /api/auth/profile` - Atualizar perfil
- `PUT /api/auth/change-password` - Alterar senha

### Vendas
- `GET /api/sales` - Listar vendas
- `POST /api/sales` - Criar venda
- `GET /api/sales/:id` - Obter venda por ID
- `PUT /api/sales/:id` - Atualizar venda
- `DELETE /api/sales/:id` - Deletar venda
- `GET /api/sales/ranking` - Ranking de vendedores
- `GET /api/sales/stats` - Estatísticas de vendas

### Conquistas
- `GET /api/achievements/available` - Conquistas disponíveis
- `GET /api/achievements/user/:userId` - Conquistas do usuário
- `GET /api/achievements/user/:userId/recent` - Conquistas recentes
- `POST /api/achievements/user/:userId/check` - Verificar conquistas

### Dashboard
- `GET /api/dashboard/overview` - Visão geral
- `GET /api/dashboard/sales-chart` - Dados para gráficos
- `GET /api/dashboard/sales-by-category` - Vendas por categoria
- `GET /api/dashboard/seller-performance` - Performance dos vendedores
- `GET /api/dashboard/goal-simulator/:userId` - Simulador de metas

### Usuários (Admin)
- `GET /api/users` - Listar usuários
- `POST /api/users` - Criar usuário
- `GET /api/users/:id` - Obter usuário
- `PUT /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Deletar usuário
- `PATCH /api/users/:id/toggle-status` - Ativar/desativar

## 🧪 Testes

O projeto inclui testes automatizados usando Jest e Supertest:

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch

# Gerar relatório de cobertura
npm run test:coverage
```

## 🔒 Segurança

- **Autenticação JWT** com tokens seguros
- **Hash de senhas** com bcrypt
- **Rate limiting** para prevenir ataques
- **Validação rigorosa** de inputs
- **Sanitização** de dados
- **Headers de segurança** com Helmet
- **CORS** configurado adequadamente

## 🎨 Design e UX

- **Interface moderna** e responsiva
- **Material Design** com Material-UI
- **Animações fluidas** com Framer Motion
- **Tema personalizado** para gamificação
- **Feedback visual** em tempo real
- **Experiência mobile-first**

## 📱 Responsividade

- Layout adaptativo para todas as telas
- Menu lateral colapsável
- Gráficos responsivos
- Tabelas com scroll horizontal
- Componentes otimizados para mobile

## 🚀 Deploy

### Backend (Heroku/Railway/DigitalOcean)
1. Configure as variáveis de ambiente
2. Configure o MongoDB Atlas ou instância cloud
3. Execute o build e deploy

### Frontend (Vercel/Netlify)
1. Configure a variável VITE_API_URL
2. Execute npm run build
3. Deploy da pasta dist/

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para dúvidas e suporte, entre em contato através dos issues do GitHub.

---

**Desenvolvido com ❤️ para otimizar a performance de equipes de vendas através da gamificação.**
