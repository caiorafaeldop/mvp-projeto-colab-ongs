# Integração com APIs do Backend

Este documento descreve as integrações implementadas entre o frontend (client) e o backend (server).

## Configuração da API

### Arquivo: `src/api/api.ts`
- **URL Base**: `http://localhost:3000`
- **Interceptors**: Configurados para adicionar automaticamente o token de autenticação
- **Gerenciamento de Token**: Funções para salvar/recuperar token do localStorage
- **Tratamento de Erros**: Redirecionamento automático para login em caso de token expirado

## Autenticação

### Arquivo: `src/api/auth.ts`

#### Endpoints Implementados:
- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/login` - Login de usuário  
- `GET /api/auth/profile` - Obter perfil do usuário

#### Funcionalidades:
- Gerenciamento automático de token
- Tipagem TypeScript para respostas
- Tratamento de erros padronizado

### Contexto de Autenticação: `src/contexts/AuthContext.tsx`
- Gerenciamento global do estado de autenticação
- Verificação automática de token na inicialização
- Funções para login/logout
- Proteção de rotas

## Produtos

### Arquivo: `src/api/store.ts`

#### Endpoints Implementados:

**Públicos:**
- `GET /api/products` - Listar produtos disponíveis
- `GET /api/products/search?q=termo` - Buscar produtos
- `GET /api/products/:id` - Obter produto específico
- `GET /api/products/:id/whatsapp?phone=numero` - Gerar link WhatsApp

**Protegidos (requer autenticação):**
- `POST /api/products` - Criar produto
- `PUT /api/products/:id` - Atualizar produto
- `DELETE /api/products/:id` - Deletar produto
- `PATCH /api/products/:id/toggle` - Ativar/desativar produto
- `GET /api/my-products` - Listar produtos da organização

#### Funcionalidades:
- Busca com debounce (500ms)
- Filtros por categoria
- Gerenciamento de imagens múltiplas
- Integração com WhatsApp

## Páginas Atualizadas

### 1. Login (`src/pages/Login.tsx`)
- Integração com APIs reais de login/registro
- Uso do contexto de autenticação
- Redirecionamento baseado no tipo de usuário

### 2. Store (`src/pages/Store.tsx`)
- Busca em tempo real com API
- Filtros por categoria
- Loading states e tratamento de erros

### 3. ProductDetail (`src/pages/ProductDetail.tsx`)
- Integração com API de WhatsApp
- Carregamento dinâmico de produtos
- Tratamento de produtos não encontrados

### 4. MyProducts (`src/pages/MyProducts.tsx`) - **NOVA**
- Listagem de produtos da organização
- Ações: ver, editar, ativar/desativar, deletar
- Interface responsiva com cards

### 5. CreateProduct (`src/pages/CreateProduct.tsx`) - **NOVA**
- Formulário completo para criação de produtos
- Validação de campos
- Upload de múltiplas imagens via URL
- Categorias predefinidas

## Componentes Atualizados

### Header (`src/components/Header.tsx`)
- Menu dropdown para usuários logados
- Exibição de informações do usuário
- Link para "Meus Produtos" (apenas organizações)
- Avatar com iniciais do usuário

### ProtectedRoute (`src/components/ProtectedRoute.tsx`)
- Proteção de rotas que requerem autenticação
- Redirecionamento para login quando necessário

## Rotas Adicionadas

### App.tsx
```typescript
<Route path="my-products" element={<MyProducts />} />
<Route path="create-product" element={<CreateProduct />} />
```

## Funcionalidades Implementadas

### Para Compradores:
- ✅ Visualização de produtos
- ✅ Busca e filtros
- ✅ Detalhes do produto
- ✅ Contato via WhatsApp

### Para Organizações:
- ✅ Gerenciamento de produtos
- ✅ Criação de novos produtos
- ✅ Edição e exclusão
- ✅ Ativação/desativação
- ✅ Visualização de produtos próprios

### Sistema de Autenticação:
- ✅ Login/Registro
- ✅ Gerenciamento de sessão
- ✅ Proteção de rotas
- ✅ Logout automático

## Estrutura de Dados

### User Interface:
```typescript
interface User {
  _id: string;
  name: string;
  email: string;
  userType: string;
  phone?: string;
}
```

### Product Interface:
```typescript
interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stock: number;
  isActive?: boolean;
  organizationId?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

## Próximos Passos

1. **Implementar upload de imagens** (atualmente apenas URLs)
2. **Adicionar página de edição de produtos**
3. **Implementar sistema de doações**
4. **Adicionar dashboard de vendas**
5. **Implementar notificações em tempo real**

## Como Testar

1. **Iniciar o backend**: `cd server && npm start`
2. **Iniciar o frontend**: `cd client && npm run dev`
3. **Criar conta de organização** para testar gerenciamento de produtos
4. **Criar conta de comprador** para testar visualização e busca
5. **Testar todas as funcionalidades** listadas acima

## Observações

- O backend deve estar rodando na porta 3000
- Todas as APIs retornam respostas padronizadas com `success` e `message`
- Erros são tratados e exibidos via toast notifications
- Tokens são automaticamente gerenciados pelo sistema

