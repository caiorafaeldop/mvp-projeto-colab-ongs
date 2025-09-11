# 📚 Documentação da API - MVP Projeto Colab ONGs

## 🔗 URL Base
- **Produção**: `https://mvp-colab-ongs-backend.onrender.com`
- **Desenvolvimento**: `http://localhost:3000`

## 🔐 Sistema de Autenticação

### Configuração do Cliente
O sistema utiliza **JWT com cookies httpOnly** para autenticação segura:

```typescript
// Configuração base da API
const localApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Essencial para cookies
  headers: {
    "Content-Type": "application/json",
  }
});
```

### Interceptors Automáticos
- **Request Interceptor**: Adiciona automaticamente o Bearer token nas requisições
- **Response Interceptor**: Renova tokens expirados automaticamente via `/api/auth/refresh`

---

## 🔑 Rotas de Autenticação

### 1. Login
```typescript
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "usuario@email.com",
  "password": "senha123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "Nome do Usuário",
      "email": "usuario@email.com",
      "userType": "donor|organization",
      "phone": "+5511999999999"
    },
    "accessToken": "jwt_access_token"
  },
  "message": "Login realizado com sucesso"
}
```

**Como chamar:**
```typescript
import { loginUser } from './api/auth';

const response = await loginUser({
  email: "usuario@email.com",
  password: "senha123"
});
```

### 2. Registro
```typescript
POST /api/auth/register
```

**Request Body:**
```json
{
  "name": "Nome Completo",
  "email": "usuario@email.com",
  "password": "senha123",
  "phone": "+5511999999999",
  "userType": "donor"
}
```

**Response:** Mesmo formato do login

**Como chamar:**
```typescript
import { registerUser } from './api/auth';

const response = await registerUser({
  name: "Nome Completo",
  email: "usuario@email.com",
  password: "senha123",
  phone: "+5511999999999",
  userType: "donor"
});
```

### 3. Perfil do Usuário
```typescript
GET /api/auth/profile
```

**Headers:** `Authorization: Bearer {accessToken}`

**Response:**
```json
{
  "success": true,
  "message": "Perfil encontrado",
  "data": {
    "id": "user_id",
    "name": "Nome do Usuário",
    "email": "usuario@email.com",
    "userType": "donor",
    "phone": "+5511999999999"
  }
}
```

**Como chamar:**
```typescript
import { getUserProfile } from './api/auth';

const profile = await getUserProfile();
```

### 4. Refresh Token
```typescript
POST /api/auth/refresh
```

**Headers:** Cookies httpOnly (automático)

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "novo_jwt_token"
  }
}
```

**Como chamar:**
```typescript
import { refreshToken } from './api/auth';

const { accessToken } = await refreshToken();
```

### 5. Logout
```typescript
POST /api/auth/logout
```

**Headers:** `Authorization: Bearer {accessToken}`

**Como chamar:**
```typescript
import { logoutUser } from './api/auth';

await logoutUser();
```

---

## 🛍️ Rotas de Produtos (Loja)

### 1. Listar Todos os Produtos
```typescript
GET /api/products
```

**Response:**
```json
{
  "success": true,
  "products": [
    {
      "_id": "product_id",
      "name": "Nome do Produto",
      "description": "Descrição detalhada",
      "price": 29.99,
      "category": "categoria",
      "images": ["url1", "url2"],
      "stock": 10,
      "isActive": true,
      "organizationId": "org_id",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Como chamar:**
```typescript
import { getProducts } from './api/store';

const { products } = await getProducts();
```

### 2. Buscar Produtos
```typescript
GET /api/products/search?q={termo}
```

**Query Parameters:**
- `q`: Termo de busca

**Como chamar:**
```typescript
import { searchProducts } from './api/store';

const { products } = await searchProducts("termo de busca");
```

### 3. Produto por ID
```typescript
GET /api/products/{id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "product_id",
    "name": "Nome do Produto",
    "description": "Descrição",
    "price": 29.99,
    "imageUrls": ["url1", "url2"],
    "category": "categoria",
    "stock": 10,
    "organizationName": "Nome da ONG"
  }
}
```

**Como chamar:**
```typescript
import { getProductById } from './api/store';

const { data: product } = await getProductById("product_id");
```

### 4. Link do WhatsApp
```typescript
GET /api/products/{id}/whatsapp?phone={numero}
```

**Query Parameters:**
- `phone`: Número do telefone

**Response:**
```json
{
  "success": true,
  "data": {
    "whatsappLink": "https://wa.me/5511999999999?text=..."
  }
}
```

**Como chamar:**
```typescript
import { getWhatsAppLink } from './api/store';

const { whatsappLink } = await getWhatsAppLink("product_id", "+5511999999999");
```

### 5. Criar Produto (Autenticado)
```typescript
POST /api/products
```

**Headers:** `Authorization: Bearer {accessToken}`

**Request Body:**
```json
{
  "name": "Nome do Produto",
  "description": "Descrição detalhada",
  "price": 29.99,
  "category": "categoria",
  "images": ["url1", "url2"],
  "stock": 10
}
```

**Como chamar:**
```typescript
import { createProduct } from './api/store';

const response = await createProduct({
  name: "Nome do Produto",
  description: "Descrição",
  price: 29.99,
  category: "categoria",
  images: ["url1"],
  stock: 10
});
```

### 6. Atualizar Produto (Autenticado)
```typescript
PUT /api/products/{id}
```

**Headers:** `Authorization: Bearer {accessToken}`

**Como chamar:**
```typescript
import { updateProduct } from './api/store';

const response = await updateProduct("product_id", {
  name: "Novo Nome",
  price: 39.99
});
```

### 7. Deletar Produto (Autenticado)
```typescript
DELETE /api/products/{id}
```

**Headers:** `Authorization: Bearer {accessToken}`

**Como chamar:**
```typescript
import { deleteProduct } from './api/store';

const response = await deleteProduct("product_id");
```

### 8. Alternar Disponibilidade (Autenticado)
```typescript
PATCH /api/products/{id}/toggle
```

**Headers:** `Authorization: Bearer {accessToken}`

**Como chamar:**
```typescript
import { toggleProductAvailability } from './api/store';

const response = await toggleProductAvailability("product_id");
```

### 9. Atualizar Estoque (Autenticado)
```typescript
PATCH /api/products/{id}/stock
```

**Headers:** `Authorization: Bearer {accessToken}`

**Request Body:**
```json
{
  "stock": 15
}
```

**Como chamar:**
```typescript
import { updateProductStock } from './api/store';

const response = await updateProductStock("product_id", 15);
```

### 10. Meus Produtos (Autenticado)
```typescript
GET /api/my-products
```

**Headers:** `Authorization: Bearer {accessToken}`

**Como chamar:**
```typescript
import { getMyProducts } from './api/store';

const { products } = await getMyProducts();
```

---

## 💰 Rotas de Doações

### 1. Informações da Causa
```typescript
GET /api/donations/cause
```

**Response:**
```json
{
  "cause": {
    "title": "Título da Causa",
    "subtitle": "Subtítulo",
    "description": "Descrição completa",
    "mainImage": "url_da_imagem",
    "goal": 25000,
    "raised": 12500,
    "stats": {
      "womenHelped": "150+",
      "donors": "89",
      "yearsActive": "5"
    }
  }
}
```

**Como chamar:**
```typescript
import { getDonationCause } from './api/donations';

const { cause } = await getDonationCause();
```

### 2. Criar Assinatura de Doação
```typescript
POST /api/donations/subscribe
```

**Request Body:**
```json
{
  "name": "Nome Completo",
  "email": "doador@email.com",
  "phone": "+5511999999999",
  "document": "12345678901",
  "amount": 50,
  "frequency": "monthly",
  "currency": "BRL"
}
```

**Response:**
```json
{
  "success": true,
  "subscriptionId": "sub_123456",
  "checkoutUrl": "https://checkout.stripe.com/...",
  "message": "Assinatura criada com sucesso!"
}
```

**Como chamar:**
```typescript
import { createDonorSubscription } from './api/donations';

const response = await createDonorSubscription({
  name: "Nome Completo",
  email: "doador@email.com",
  phone: "+5511999999999",
  document: "12345678901",
  amount: 50,
  frequency: "monthly",
  currency: "BRL"
});
```

### 3. Dashboard do Doador (Autenticado)
```typescript
GET /api/donations/dashboard
```

**Headers:** `Authorization: Bearer {accessToken}`

**Response:**
```json
{
  "dashboard": {
    "donor": {
      "name": "Nome do Doador"
    },
    "stats": {
      "totalDonated": 450,
      "donationCount": 9,
      "monthsActive": 9
    },
    "subscription": {
      "status": "active",
      "amount": 50,
      "frequency": "monthly",
      "nextBilling": "2024-02-15T10:00:00Z"
    },
    "donations": [
      {
        "amount": 50,
        "date": "2024-01-15T10:00:00Z",
        "status": "completed"
      }
    ]
  }
}
```

**Como chamar:**
```typescript
import { getDonorDashboard } from './api/donations';

const { dashboard } = await getDonorDashboard();
```

### 4. Atualizar Assinatura (Autenticado)
```typescript
PUT /api/donations/subscription
```

**Headers:** `Authorization: Bearer {accessToken}`

**Request Body:**
```json
{
  "action": "pause" // ou "resume"
}
```

**Como chamar:**
```typescript
import { updateSubscription } from './api/donations';

const response = await updateSubscription({ action: "pause" });
```

### 5. Cancelar Assinatura (Autenticado)
```typescript
DELETE /api/donations/subscription
```

**Headers:** `Authorization: Bearer {accessToken}`

**Como chamar:**
```typescript
import { cancelSubscription } from './api/donations';

const response = await cancelSubscription();
```

---

## 🏠 Rotas da Home

### 1. Clique de Botão
```typescript
POST /api/home/button-click
```

**Request Body:**
```json
{
  "action": "nome_da_acao"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Button click handled successfully!",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

**Como chamar:**
```typescript
import { handleButtonClick } from './api/home';

const response = await handleButtonClick({ action: "donate_now" });
```

---

## 🔧 Configurações Importantes

### Variáveis de Ambiente Necessárias
```env
# JWT
JWT_SECRET=sua_chave_secreta_jwt
JWT_REFRESH_SECRET=sua_chave_refresh_jwt
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Database
DATABASE_URL=sua_url_do_banco

# Outros
NODE_ENV=production
PORT=3000
```

### Headers Padrão
```typescript
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {accessToken}" // Para rotas autenticadas
}
```

### Tratamento de Erros
Todas as funções da API seguem o padrão:
```typescript
try {
  const response = await apiFunction();
  // Sucesso
} catch (error) {
  // error.message contém a mensagem de erro
  console.error(error.message);
}
```

### Status Codes Esperados
- **200**: Sucesso
- **201**: Criado com sucesso
- **400**: Erro de validação
- **401**: Não autorizado (token inválido/expirado)
- **403**: Proibido
- **404**: Não encontrado
- **500**: Erro interno do servidor

---

## 🚀 Como Usar

1. **Importe a função desejada:**
```typescript
import { loginUser, getProducts, createDonorSubscription } from './api';
```

2. **Chame a função com os parâmetros corretos:**
```typescript
const user = await loginUser({ email, password });
const products = await getProducts();
```

3. **Trate erros adequadamente:**
```typescript
try {
  const response = await apiFunction();
} catch (error) {
  console.error('Erro:', error.message);
}
```

---

## 📝 Notas Importantes

- **Autenticação**: O sistema renova tokens automaticamente via interceptors
- **Cookies**: Utilizados para refresh tokens (httpOnly para segurança)
- **CORS**: Configurado com `withCredentials: true`
- **Logs**: Todas as requisições são logadas no console para debug
- **Mock Data**: Algumas rotas (doações, home) ainda utilizam dados mockados

---

## 🔄 Fluxo de Autenticação

1. **Login/Register** → Recebe accessToken + httpOnly cookie (refreshToken)
2. **Requisições** → Interceptor adiciona Bearer token automaticamente
3. **Token Expira** → Interceptor detecta 401, chama `/refresh`, renova token
4. **Refresh Falha** → Redireciona para login
5. **Logout** → Limpa tokens e cookies

Este sistema garante uma experiência fluida para o usuário com renovação automática de tokens.
