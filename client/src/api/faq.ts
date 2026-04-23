import api from "./api";
import { ensureWritable, withFallback } from "@/lib/dataMode";
import { StaticData } from "@/lib/staticData";

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

/**
 * FAQ API. Leitura pública usa modo de dados central (api/static/auto);
 * escritas exigem backend e ficam indisponíveis em modo `static`.
 */
export const FAQApi = {
  list: async (ativo?: boolean): Promise<FAQ[]> =>
    withFallback(
      async () => {
        const params = ativo !== undefined ? { ativo } : {};
        const res = await api.get("/api/faqs", { params });
        return unwrap<FAQ[]>(res);
      },
      async () => {
        const all = await StaticData.faqs();
        const filtered = ativo === undefined ? all : all.filter((f) => f.ativo === ativo);
        return filtered.slice().sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0)) as FAQ[];
      }
    ),

  getById: async (id: string): Promise<FAQ> =>
    withFallback(
      async () => {
        const res = await api.get(`/api/faqs/${id}`);
        return unwrap<FAQ>(res);
      },
      async () => {
        const all = await StaticData.faqs();
        const found = all.find((f) => f.id === id);
        if (!found) throw new Error("FAQ não encontrado.");
        return found as FAQ;
      }
    ),

  create: async (data: Partial<FAQ>): Promise<FAQ> => {
    ensureWritable("Criar FAQ");
    const res = await api.post("/api/faqs", data);
    return unwrap<FAQ>(res);
  },

  update: async (id: string, data: Partial<FAQ>): Promise<FAQ> => {
    ensureWritable("Atualizar FAQ");
    const res = await api.put(`/api/faqs/${id}`, data);
    return unwrap<FAQ>(res);
  },

  delete: async (id: string): Promise<void> => {
    ensureWritable("Remover FAQ");
    await api.delete(`/api/faqs/${id}`);
  },

  toggleActive: async (id: string): Promise<FAQ> => {
    ensureWritable("Ativar/desativar FAQ");
    const res = await api.patch(`/api/faqs/${id}/toggle`);
    return unwrap<FAQ>(res);
  },
};
