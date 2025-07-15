# Comparece.ai - Contexto Completo do Desenvolvimento

## Visão Geral do Projeto

**Comparece.ai** é uma plataforma completa de eventos noturnos que conecta estabelecimentos, promotores e frequentadores através de um sistema gamificado de check-ins, recompensas e interações sociais. O projeto visa revolucionar a experiência da vida noturna criando um ecossistema integrado onde todos os stakeholders se beneficiam.

## Arquitetura Técnica

### Stack Principal
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL (Neon Database)
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS + Radix UI + shadcn/ui
- **Estado**: TanStack Query (React Query)
- **Roteamento**: Wouter
- **Autenticação**: Passport.js com Local Strategy

### Estrutura de Pastas
```
/
├── client/           # Frontend React
│   ├── src/
│   │   ├── components/   # Componentes reutilizáveis
│   │   ├── pages/        # Páginas da aplicação
│   │   ├── hooks/        # Hooks personalizados
│   │   ├── lib/          # Utilitários e configurações
│   │   └── index.css     # Estilos globais
├── server/           # Backend Express
│   ├── auth.ts       # Sistema de autenticação
│   ├── routes.ts     # Rotas da API
│   ├── storage.ts    # Camada de dados
│   ├── db.ts         # Configuração do banco
│   └── index.ts      # Servidor principal
├── shared/           # Código compartilhado
│   └── schema.ts     # Esquemas do banco e validações
└── docs/             # Documentação
```

## Sistema de Autenticação

### Evolução do Sistema
**Situação Inicial**: Replit Auth (OpenID Connect)
**Situação Atual**: Sistema tradicional username/password

### Implementação Atual
- **Biblioteca**: Passport.js com Local Strategy
- **Hash**: scrypt (Node.js crypto nativo)
- **Sessões**: PostgreSQL com connect-pg-simple
- **Middleware**: isAuthenticated para rotas protegidas

### Credenciais de Teste
Todos os usuários podem usar a senha: `123456`

**Usuários Cadastrados**:
- `luiscpaim@gmail.com` (SUPER_ADMIN)
- `lcvpaim@gmail.com` (USUARIO)
- `digitalsimetria@gmail.com` (USUARIO)

## Modelo de Dados

### Tabelas Principais

#### users
```sql
- id (varchar, PK)
- email (varchar, unique)
- password (varchar) -- Hash scrypt
- firstName (varchar)
- lastName (varchar)
- profileImageUrl (varchar)
- role (enum: USUARIO, FUNCIONARIO, DONO_ESTABELECIMENTO, SUPER_ADMIN)
- createdAt/updatedAt (timestamp)
```

#### establishments
```sql
- id (varchar, PK)
- name (varchar)
- description (text)
- address (varchar)
- city (varchar)
- phone (varchar)
- email (varchar)
- ownerId (varchar, FK -> users.id)
- createdAt/updatedAt (timestamp)
```

#### events
```sql
- id (varchar, PK)
- title (varchar)
- description (text)
- date (timestamp)
- startTime (varchar)
- endTime (varchar)
- category (enum: PAGODE, SERTANEJO, TECHNO, FUNK, FORRÓ, ROCK, SAMBA)
- establishmentId (varchar, FK -> establishments.id)
- createdAt/updatedAt (timestamp)
```

#### eventReactions
```sql
- id (varchar, PK)
- userId (varchar, FK -> users.id)
- eventId (varchar, FK -> events.id)
- reaction (enum: EU_VOU_COMPARECER, PENSANDO_EM_IR, NAO_VOU_PODER_IR)
- createdAt/updatedAt (timestamp)
```

### Sistema de Gamificação

#### userStats
```sql
- id (varchar, PK)
- userId (varchar, FK -> users.id)
- totalCheckIns (integer)
- monthlyCheckIns (integer)
- level (enum: BRONZE, SILVER, GOLD, PLATINUM, DIAMOND)
- points (integer)
- availableRewards (integer)
- updatedAt (timestamp)
```

#### checkIns
```sql
- id (varchar, PK)
- userId (varchar, FK -> users.id)
- eventId (varchar, FK -> events.id)
- qrCode (varchar, unique)
- validated (boolean)
- validatedBy (varchar, FK -> users.id)
- validatedAt (timestamp)
- createdAt (timestamp)
```

## Hierarquia de Roles

### SUPER_ADMIN
- Controle total do sistema
- Promove usuários para DONO_ESTABELECIMENTO
- Acesso ao painel administrativo

### DONO_ESTABELECIMENTO
- Cria e gerencia estabelecimentos
- Cria eventos para seus estabelecimentos
- Promove usuários para FUNCIONARIO/PROMOTER
- Acesso ao dashboard de estabelecimento

### FUNCIONARIO
- Valida check-ins e resgates
- Acesso limitado ao painel do estabelecimento

### PROMOTER
- Cria links de promoção
- Acompanha métricas de engajamento

### USUARIO
- Participa de eventos
- Reage a eventos
- Faz check-ins via QR code
- Resgata recompensas

## Principais Funcionalidades

### Sistema de Eventos
- Criação e gestão de eventos por estabelecimentos
- Categorização por gênero musical
- Sistema de reações (vou/talvez/não vou)
- Métricas de engajamento

### Sistema de Check-in
- QR codes únicos gerados para cada evento
- Validação por funcionários do estabelecimento
- Prevenção de fraudes
- Histórico de check-ins

### Sistema de Recompensas
- Pontos por check-ins
- Níveis de usuário (Bronze → Diamond)
- Incentivos personalizados por estabelecimento
- Resgate de benefícios

### Gamificação
- Níveis progressivos
- Badges e conquistas
- Estatísticas mensais
- Ranking de frequentadores

## Configuração de Desenvolvimento

### Variáveis de Ambiente
```env
DATABASE_URL=postgresql://...
SESSION_SECRET=your-secret-key
NODE_ENV=development
```

### Comandos Principais
```bash
# Desenvolvimento
npm run dev

# Database
npm run db:push      # Aplicar mudanças no schema
npm run db:studio    # Interface gráfica do banco

# Build
npm run build
```

### Portas
- Backend: 5000
- Frontend: Servido pelo Vite através do backend

## Problemas Resolvidos

### 1. Migração de Autenticação
**Problema**: Replit Auth inadequado para o modelo de negócio
**Solução**: Implementação de sistema tradicional com Passport.js

### 2. Erros de Sintaxe no React
**Problema**: Caracteres especiais no useAuth.ts causando falha na compilação
**Solução**: Reescrita do arquivo com React.createElement

### 3. Configuração de Porta
**Problema**: Conflito entre porta do backend e frontend
**Solução**: Backend na porta 5000, frontend servido pelo Vite

### 4. Sessões PostgreSQL
**Problema**: Tabela de sessão não existia
**Solução**: Criação manual da tabela com índices apropriados

### 5. APIs com Estrutura Incorreta
**Problema**: Rotas usando req.user.claims.sub (estrutura Replit Auth)
**Solução**: Substituição por req.user.id (estrutura tradicional)

### 6. Problemas de Git
**Problema**: Branch local divergente do remoto
**Solução**: Force push com --force-with-lease

### 7. Implementação PWA
**Problema**: Aplicação não funcionava como PWA
**Solução**: Implementação completa de PWA com service worker, manifest e instalação

## Identidade Visual

### Cores da Marca
- **Roxo Magenta**: #BB2288 (hsl(329, 74%, 44%))
- **Laranja Vibrante**: #F09232 (hsl(29, 88%, 57%))
- **Roxo Escuro**: #BB2288 (versão mais escura)
- **Preto Noturno**: #0D0D0D (hsl(0, 0%, 5%))

### Tipografia
- **Fonte Principal**: Rubik (Google Fonts)
- **Pesos**: 300, 400, 500, 600, 700, 800, 900

### Tema
- **Abordagem**: Dark mode como padrão
- **Estilo**: Noturno, vibrante, moderno
- **Gradientes**: Roxo para rosa em elementos destacados

## Fluxo de Usuário

### Usuário Comum
1. **Landing Page** → Apresentação da plataforma
2. **Registro/Login** → Autenticação tradicional
3. **Home** → Feed de eventos próximos
4. **Evento** → Visualização detalhada, reações, check-in
5. **Profile** → Estatísticas, nível, histórico

### Estabelecimento
1. **Dashboard** → Visão geral dos eventos
2. **Criar Evento** → Formulário completo
3. **Gerenciar Staff** → Adicionar funcionários
4. **Estatísticas** → Métricas de engajamento

### Funcionário
1. **Painel** → Validações pendentes
2. **Scanner QR** → Validação de check-ins
3. **Recompensas** → Gestão de resgates

## Métricas e Analytics

### Evento
- Total de interessados
- Check-ins realizados
- Distribuição de reações
- Taxa de comparecimento

### Estabelecimento
- Eventos por mês
- Frequentadores únicos
- Recompensas resgatadas
- Engajamento médio

### Usuário
- Check-ins totais
- Check-ins mensais
- Pontos acumulados
- Nível atual

## Funcionalidades PWA Implementadas

### PWA (Progressive Web App)
**Status**: ✅ Implementado e funcional

#### Recursos PWA Ativos
- **Service Worker**: Registrado e funcionando para cache offline
- **Web App Manifest**: Configurado com metadados completos
- **Instalação**: Prompt automático para instalação no dispositivo
- **Ícones**: Ícones 192x192 e 512x512 configurados
- **Offline**: Cache básico para funcionamento sem internet
- **Meta Tags**: Suporte completo para iOS e Windows

#### Arquivos PWA
- `client/public/manifest.json` - Configurações do PWA
- `client/public/sw.js` - Service Worker para cache
- `client/public/icon-192.png` - Ícone 192x192
- `client/public/icon-512.png` - Ícone 512x512
- `client/src/hooks/usePWA.ts` - Hook para controle PWA
- `client/src/components/install-prompt.tsx` - Componente de instalação

#### Funcionalidades PWA
- **Instalação**: Botão "Instalar" aparece automaticamente
- **Standalone**: Executa em tela cheia sem barra do navegador
- **Cache Offline**: Funciona sem conexão para recursos básicos
- **Notificações**: Estrutura pronta para push notifications
- **Tema**: Cores da marca (roxo magenta) integradas

## Roadmap Técnico

### Funcionalidades Pendentes
- [ ] Sistema de notificações push (estrutura criada)
- [ ] Integração com redes sociais
- [ ] Chat entre usuários
- [ ] Geolocalização avançada
- [ ] Pagamentos integrados

### Melhorias Técnicas
- [ ] Testes automatizados
- [ ] CI/CD pipeline
- [ ] Monitoramento de performance
- [ ] Cache Redis
- [ ] WebSocket para updates em tempo real

## Deployment

### Ambiente de Produção
- **Platform**: Replit
- **Database**: Neon PostgreSQL
- **Build**: Vite (frontend) + esbuild (backend)
- **SSL**: Automático via Replit

### Processo de Deploy
1. `git add -A && git commit -m "message"`
2. `git push origin main`
3. Deploy automático via Replit

## Considerações de Segurança

### Implementadas
- Hash scrypt para senhas
- Sessões HTTP-only
- Validação de entrada com Zod
- Middleware de autenticação

### Recomendações Futuras
- Rate limiting
- CSRF protection
- Input sanitization
- Audit logs
- Backup automático

## Contatos do Projeto

### Equipe Técnica
- **Desenvolvedor Principal**: Luis Paim (luiscpaim@gmail.com)
- **Repositório**: https://github.com/genesisw/compareceai

### Usuários de Teste
- **Super Admin**: luiscpaim@gmail.com
- **Usuários**: lcvpaim@gmail.com, digitalsimetria@gmail.com
- **Senha Universal**: 123456

---

*Última atualização: 15 de julho de 2025*
*Status: Sistema de autenticação migrado, PWA implementado, aplicação estável em produção*