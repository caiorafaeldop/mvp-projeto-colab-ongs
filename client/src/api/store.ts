import api from "./api";

export interface Product {
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

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stock: number;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  images?: string[];
  stock?: number;
}

// Description: Get all available products
// Endpoint: GET /api/products
// Response: { success: boolean, products: Product[] }
export const getProducts = async (): Promise<{
  success: boolean;
  products: Product[];
}> => {
  try {
    const response = await api.get("/api/products");
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message ||
        error.message ||
        "Erro ao buscar produtos"
    );
  }
};

// Description: Search products by term
// Endpoint: GET /api/products/search?q=termo
// Response: { success: boolean, products: Product[] }
export const searchProducts = async (
  query: string
): Promise<{ success: boolean; products: Product[] }> => {
  try {
    const response = await api.get(
      `/api/products/search?q=${encodeURIComponent(query)}`
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message ||
        error.message ||
        "Erro ao buscar produtos"
    );
  }
};

// Description: Get product by ID
// Endpoint: GET /api/products/:id
// Response: { success: boolean, product: Product }
export const getProductById = async (
  id: string
): Promise<{ success: boolean; product: Product }> => {
  try {
    const response = await api.get(`/api/products/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message ||
        error.message ||
        "Erro ao buscar produto"
    );
  }
};

// Description: Get WhatsApp link for product
// Endpoint: GET /api/products/:id/whatsapp?phone=numero
// Response: { success: boolean, whatsappLink: string }
export const getWhatsAppLink = async (
  productId: string,
  phone: string
): Promise<{ success: boolean; whatsappLink: string }> => {
  try {
    const response = await api.get(
      `/api/products/${productId}/whatsapp?phone=${encodeURIComponent(phone)}`
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message ||
        error.message ||
        "Erro ao gerar link do WhatsApp"
    );
  }
};

// Description: Create new product (requires authentication)
// Endpoint: POST /api/products
// Request: CreateProductData
// Response: { success: boolean, product: Product, message: string }
export const createProduct = async (
  data: CreateProductData
): Promise<{ success: boolean; product: Product; message: string }> => {
  try {
    const response = await api.post("/api/products", data);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || error.message || "Erro ao criar produto"
    );
  }
};

// Description: Update product (requires authentication)
// Endpoint: PUT /api/products/:id
// Request: UpdateProductData
// Response: { success: boolean, product: Product, message: string }
export const updateProduct = async (
  id: string,
  data: UpdateProductData
): Promise<{ success: boolean; product: Product; message: string }> => {
  try {
    const response = await api.put(`/api/products/${id}`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message ||
        error.message ||
        "Erro ao atualizar produto"
    );
  }
};

// Description: Delete product (requires authentication)
// Endpoint: DELETE /api/products/:id
// Response: { success: boolean, message: string }
export const deleteProduct = async (
  id: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.delete(`/api/products/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message ||
        error.message ||
        "Erro ao deletar produto"
    );
  }
};

// Description: Toggle product availability (requires authentication)
// Endpoint: PATCH /api/products/:id/toggle
// Response: { success: boolean, product: Product, message: string }
export const toggleProductAvailability = async (
  id: string
): Promise<{ success: boolean; product: Product; message: string }> => {
  try {
    const response = await api.patch(`/api/products/${id}/toggle`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message ||
        error.message ||
        "Erro ao alterar disponibilidade do produto"
    );
  }
};

// Description: Get products by organization (requires authentication)
// Endpoint: GET /api/my-products
// Response: { success: boolean, products: Product[] }
export const getMyProducts = async (): Promise<{
  success: boolean;
  products: Product[];
}> => {
  try {
    const response = await api.get("/api/my-products");
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message ||
        error.message ||
        "Erro ao buscar seus produtos"
    );
  }
};
