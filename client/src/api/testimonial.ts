import api from "./api";
import { ensureWritable, withFallback } from "@/lib/dataMode";
import { StaticData } from "@/lib/staticData";

export type Testimonial = {
  id: string;
  nome: string;
  cargo: string;
  depoimento: string;
  fotoUrl?: string | null;
  ordem: number;
  ativo: boolean;
  createdAt?: string;
  updatedAt?: string;
};

function unwrap<T = any>(res: any): T {
  return (res?.data?.data ?? res?.data ?? res) as T;
}

/**
 * Testimonials API. Leitura pública é tolerante a backend offline
 * (cai para snapshot estático quando configurado).
 */
export const TestimonialApi = {
  list: async (ativo?: boolean): Promise<Testimonial[]> =>
    withFallback(
      async () => {
        const params = ativo !== undefined ? { ativo } : {};
        const res = await api.get("/api/testimonials", { params });
        return unwrap<Testimonial[]>(res);
      },
      async () => {
        const all = await StaticData.testimonials();
        const filtered = ativo === undefined ? all : all.filter((t) => t.ativo === ativo);
        return filtered.slice().sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0)) as Testimonial[];
      }
    ),

  getById: async (id: string): Promise<Testimonial> =>
    withFallback(
      async () => {
        const res = await api.get(`/api/testimonials/${id}`);
        return unwrap<Testimonial>(res);
      },
      async () => {
        const all = await StaticData.testimonials();
        const found = all.find((t) => t.id === id);
        if (!found) throw new Error("Depoimento não encontrado.");
        return found as Testimonial;
      }
    ),

  create: async (data: Partial<Testimonial>): Promise<Testimonial> => {
    ensureWritable("Criar depoimento");
    const res = await api.post("/api/testimonials", data);
    return unwrap<Testimonial>(res);
  },

  update: async (id: string, data: Partial<Testimonial>): Promise<Testimonial> => {
    ensureWritable("Atualizar depoimento");
    const res = await api.put(`/api/testimonials/${id}`, data);
    return unwrap<Testimonial>(res);
  },

  delete: async (id: string): Promise<void> => {
    ensureWritable("Remover depoimento");
    await api.delete(`/api/testimonials/${id}`);
  },

  toggleActive: async (id: string): Promise<Testimonial> => {
    ensureWritable("Ativar/desativar depoimento");
    const res = await api.patch(`/api/testimonials/${id}/toggle`);
    return unwrap<Testimonial>(res);
  },
};
