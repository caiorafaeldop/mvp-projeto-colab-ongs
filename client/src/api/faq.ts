import api from "./api";

export type FAQ = {
  id: string;
  pergunta: string;
  resposta: string;
  ordem: number;
  ativo: boolean;
  createdAt?: string;
  updatedAt?: string;
};

function unwrap<T = any>(res: any): T {
  return (res?.data?.data ?? res?.data ?? res) as T;
}

export const FAQApi = {
  // Público
  list: async (ativo?: boolean): Promise<FAQ[]> => {
    const params = ativo !== undefined ? { ativo } : {};
    const res = await api.get("/api/faqs", { params });
    return unwrap<FAQ[]>(res);
  },

  getById: async (id: string): Promise<FAQ> => {
    const res = await api.get(`/api/faqs/${id}`);
    return unwrap<FAQ>(res);
  },

  // Admin
  create: async (data: Partial<FAQ>): Promise<FAQ> => {
    const res = await api.post("/api/faqs", data);
    return unwrap<FAQ>(res);
  },

  update: async (id: string, data: Partial<FAQ>): Promise<FAQ> => {
    const res = await api.put(`/api/faqs/${id}`, data);
    return unwrap<FAQ>(res);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/faqs/${id}`);
  },

  toggleActive: async (id: string): Promise<FAQ> => {
    const res = await api.patch(`/api/faqs/${id}/toggle`);
    return unwrap<FAQ>(res);
  },
};
