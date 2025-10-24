import api from "./api";

// Estrutura flexível tipo planilha Excel
export type ColunaConfig = {
  id: string;           // Identificador único da coluna
  nome: string;         // Nome/título da coluna
  tipo: "text" | "number" | "date"; // Tipo de dado
  largura?: number;     // Largura em pixels (opcional)
  somavel?: boolean;    // Se deve ser somada no total
};

export type LinhaData = {
  [key: string]: any;   // Dados dinâmicos - cada chave é o ID de uma coluna
};

export type PrestacaoConta = {
  id: string;
  titulo: string;
  descricaoPlanilha?: string; // Descrição opcional da planilha
  origemRecurso?: string;     // Origem do recurso
  valorTotalRecurso?: number; // Valor total do recurso
  saldoConta?: number;        // Saldo em conta
  ano: number;
  mes?: number;          // Mês único (retrocompatibilidade)
  mesInicial?: number;   // Mês inicial do período
  mesFinal?: number;     // Mês final do período
  
  // Estrutura da planilha
  colunas: ColunaConfig[];   // Definição das colunas
  linhas: LinhaData[];       // Dados das linhas
  
  // Configurações
  mostrarTotal: boolean;
  colunasTotal?: string[];   // IDs das colunas que devem ser somadas
  
  // Metadados
  organizationId?: string;
  createdAt?: string;
  updatedAt?: string;
};

type ListParams = {
  page?: number;
  limit?: number;
  ano?: number;
  mes?: number;
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
  // Lista todas as planilhas
  list: async (params: ListParams = {}): Promise<PrestacaoConta[]> => {
    const res = await api.get("/api/prestacao-contas", { params });
    const payload = unwrap<PagedResult<PrestacaoConta> | PrestacaoConta[]>(res);
    return Array.isArray(payload) ? payload : (payload?.data ?? []);
  },

  // Lista por organização
  listByOrganization: async (
    organizationId: string,
    params: { page?: number; limit?: number; ano?: number; mes?: number } = {}
  ): Promise<PrestacaoConta[]> => {
    const res = await api.get(`/api/prestacao-contas/organization/${organizationId}`, { params });
    const payload = unwrap<PagedResult<PrestacaoConta> | PrestacaoConta[]>(res);
    return Array.isArray(payload) ? payload : (payload?.data ?? []);
  },

  // Busca por ID
  getById: async (id: string): Promise<PrestacaoConta> => {
    const res = await api.get(`/api/prestacao-contas/${id}`);
    return unwrap<PrestacaoConta>(res);
  },

  // Cria nova planilha
  create: async (data: Partial<PrestacaoConta>): Promise<PrestacaoConta> => {
    const res = await api.post("/api/prestacao-contas", data);
    return unwrap<PrestacaoConta>(res);
  },

  // Atualiza planilha existente
  update: async (id: string, data: Partial<PrestacaoConta>): Promise<PrestacaoConta> => {
    const res = await api.put(`/api/prestacao-contas/${id}`, data);
    return unwrap<PrestacaoConta>(res);
  },

  // Deleta planilha
  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/prestacao-contas/${id}`);
  },
};

export default PrestacaoContasApi;
