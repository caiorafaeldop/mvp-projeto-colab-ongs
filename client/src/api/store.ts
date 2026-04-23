/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./api";
import { ensureWritable, withFallback } from "@/lib/dataMode";
import { StaticData, type StaticProduct } from "@/lib/staticData";

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

export interface ApiProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrls: string[];
  category?: string;
  stock: number;
  isAvailable?: boolean;
  organizationId?: string;
  organizationName?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Constrói payload com o mesmo shape esperado pelas páginas
 * (`response.data`, `response.products`) a partir do snapshot estático.
 */
function toListResponse(items: StaticProduct[]) {
  const apiItems = items.filter((p) => p.isAvailable !== false);
  return {
    success: true,
    data: apiItems as any,
    products: apiItems as any,
  } as { success: boolean; data: never[]; products: Product[] };
}

// Description: Get all available products
// Endpoint: GET /api/products
// Response: { success: boolean, products: Product[] }
export const getProducts = async (): Promise<{
  data: never[];
  success: boolean;
  products: Product[];
}> =>
  withFallback(
    async () => {
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
    },
    async () => toListResponse(await StaticData.products())
  );

// Description: Search products by term
// Endpoint: GET /api/products/search?q=termo
// Response: { success: boolean, products: Product[] }
export const searchProducts = async (
  query: string
): Promise<{
  data: never[];
  success: boolean;
  products: Product[];
}> =>
  withFallback(
    async () => {
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
    },
    async () => {
      const all = await StaticData.products();
      const q = query.trim().toLowerCase();
      const filtered = all.filter((p) => {
        const haystack = `${p.name} ${p.description ?? ""} ${p.category ?? ""}`.toLowerCase();
        return haystack.includes(q);
      });
      return toListResponse(filtered);
    }
  );

// Description: Get product by ID
// Endpoint: GET /api/products/:id
// Response: { success: boolean, data: ApiProduct }
export const getProductById = async (
  id: string
): Promise<{ success: boolean; data: ApiProduct }> =>
  withFallback(
    async () => {
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
    },
    async () => {
      const all = await StaticData.products();
      const found = all.find((p) => p.id === id);
      if (!found) throw new Error("Produto não encontrado.");
      return { success: true, data: found as ApiProduct };
    }
  );

/**
 * Gera o link de WhatsApp para um produto. Em modo `static` (ou em
 * fallback do `auto`), monta a URL diretamente no cliente a partir
 * do snapshot, sem depender de endpoint do backend.
 */
function buildLocalWhatsAppLink(productName: string, phone: string): string {
  const sanitizedPhone = phone.replace(/\D/g, "");
  const text = `Olá! Tenho interesse no produto: ${productName}`;
  return `https://wa.me/${sanitizedPhone}?text=${encodeURIComponent(text)}`;
}

// Description: Get WhatsApp link for product
// Endpoint: GET /api/products/:id/whatsapp?phone=numero
// Response: { success: boolean, whatsappLink: string }
export const getWhatsAppLink = async (
  productId: string,
  phone: string
): Promise<{ success: boolean; whatsappLink: string }> =>
  withFallback(
    async () => {
      try {
        const response = await api.get(
          `/api/products/${productId}/whatsapp?phone=${encodeURIComponent(phone)}`
        );
        const { success, data } = response.data as {
          success: boolean;
          data?: { whatsappLink?: string };
        };
        return {
          success,
          whatsappLink: data?.whatsappLink ?? "",
        };
      } catch (error: any) {
        throw new Error(
          error?.response?.data?.message ||
            error.message ||
            "Erro ao gerar link do WhatsApp"
        );
      }
    },
    async () => {
      const all = await StaticData.products();
      const found = all.find((p) => p.id === productId);
      const name = found?.name ?? "produto da loja";
      return { success: true, whatsappLink: buildLocalWhatsAppLink(name, phone) };
    }
  );

// Description: Create new product (requires authentication)
// Endpoint: POST /api/products
// Request: CreateProductData
// Response: { success: boolean, product: Product, message: string }
export const createProduct = async (
  data: CreateProductData
): Promise<{ success: boolean; product: Product; message: string }> => {
  ensureWritable("Criar produto");
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
  ensureWritable("Atualizar produto");
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
  ensureWritable("Remover produto");
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
  ensureWritable("Alterar disponibilidade do produto");
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

// Description: Update product stock (requires authentication)
// Endpoint: PATCH /api/products/:id/stock
// Request: { stock: number }
// Response: { success: boolean, data: { id: string, name: string, stock: number, updatedAt: string }, message: string }
export const updateProductStock = async (
  id: string,
  stock: number
): Promise<{ success: boolean; data: { id: string; name: string; stock: number; updatedAt: string }; message: string }> => {
  ensureWritable("Atualizar estoque do produto");
  try {
    const response = await api.patch(`/api/products/${id}/stock`, { stock });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message ||
        error.message ||
        "Erro ao atualizar estoque do produto"
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
  ensureWritable("Listar meus produtos");
  try {
    const response = await api.get("/api/create-product");
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message ||
        error.message ||
        "Erro ao buscar seus produtos"
    );
  }
};
