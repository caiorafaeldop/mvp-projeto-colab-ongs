import api from "./api";

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

export const TestimonialApi = {
  // Público
  list: async (ativo?: boolean): Promise<Testimonial[]> => {
    const params = ativo !== undefined ? { ativo } : {};
    const res = await api.get("/api/testimonials", { params });
    return unwrap<Testimonial[]>(res);
  },

  getById: async (id: string): Promise<Testimonial> => {
    const res = await api.get(`/api/testimonials/${id}`);
    return unwrap<Testimonial>(res);
  },

  // Admin
  create: async (data: Partial<Testimonial>): Promise<Testimonial> => {
    const res = await api.post("/api/testimonials", data);
    return unwrap<Testimonial>(res);
  },

  update: async (id: string, data: Partial<Testimonial>): Promise<Testimonial> => {
    const res = await api.put(`/api/testimonials/${id}`, data);
    return unwrap<Testimonial>(res);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/testimonials/${id}`);
  },

  toggleActive: async (id: string): Promise<Testimonial> => {
    const res = await api.patch(`/api/testimonials/${id}/toggle`);
    return unwrap<Testimonial>(res);
  },
};
