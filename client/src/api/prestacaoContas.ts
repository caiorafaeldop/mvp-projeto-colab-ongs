import api from "./api";

export type PrestacaoCategoria = "Despesa" | "Receita" | "Investimento";

export type PrestacaoConta = {
  id: string;
  titulo?: string;
  descricao?: string;
  orgaoDoador?: string;
  valor: number;
  data?: string; // ISO date-time
  categoria: PrestacaoCategoria;
  tipoDespesa?: string;
  organizationId?: string;
  createdAt?: string;
  updatedAt?: string;
};

type ListParams = {
  page?: number;
  limit?: number;
  categoria?: PrestacaoCategoria;
  organizationId?: string;
};

type PagedResult<T> = {
  data: T[];
  total?: number;
  page?: number;
  limit?: number;
};

function unwrap<T = any>(res: any): T {
  return (res?.data?.data ?? res?.data ?? res) as T;
}

export const PrestacaoContasApi = {
  // Público: lista lançamentos com filtros opcionais
  list: async (params: ListParams = {}): Promise<PrestacaoConta[]> => {
    const res = await api.get("/api/prestacao-contas", { params });
    // alguns endpoints podem retornar paginado; normalizamos para array simples
    const payload = unwrap<PagedResult<PrestacaoConta> | PrestacaoConta[]>(res);
    return Array.isArray(payload) ? payload : (payload?.data ?? []);
  },

  // Público: lista por organização com filtros (page, limit, categoria, startDate, endDate)
  listByOrganization: async (
    organizationId: string,
    params: { page?: number; limit?: number; categoria?: PrestacaoCategoria; startDate?: string; endDate?: string } = {}
  ): Promise<PrestacaoConta[]> => {
    const res = await api.get(`/api/prestacao-contas/organization/${organizationId}`, { params });
    const payload = unwrap<PagedResult<PrestacaoConta> | PrestacaoConta[]>(res);
    return Array.isArray(payload) ? payload : (payload?.data ?? []);
  },

  // Público: lista por categoria com filtros (page, limit, organizationId)
  listByCategory: async (
    categoria: PrestacaoCategoria,
    params: { page?: number; limit?: number; organizationId?: string } = {}
  ): Promise<PrestacaoConta[]> => {
    const res = await api.get(`/api/prestacao-contas/categoria/${categoria}`, { params });
    const payload = unwrap<PagedResult<PrestacaoConta> | PrestacaoConta[]>(res);
    return Array.isArray(payload) ? payload : (payload?.data ?? []);
  },

  getById: async (id: string): Promise<PrestacaoConta> => {
    const res = await api.get(`/api/prestacao-contas/${id}`);
    return unwrap<PrestacaoConta>(res);
  },

  // Admin CRUD (mantido aqui para uso futuro)
  create: async (data: Partial<PrestacaoConta>): Promise<PrestacaoConta> => {
    const res = await api.post("/api/prestacao-contas", data);
    return unwrap<PrestacaoConta>(res);
  },

  update: async (id: string, data: Partial<PrestacaoConta>): Promise<PrestacaoConta> => {
    const res = await api.put(`/api/prestacao-contas/${id}`, data);
    return unwrap<PrestacaoConta>(res);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/prestacao-contas/${id}`);
  },
};

export default PrestacaoContasApi;
