import api from "./api";
import { ensureWritable, withFallback } from "@/lib/dataMode";
import { StaticData } from "@/lib/staticData";

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

/**
 * Helper para aplicar filtros simples (ano/mes/organizationId) no
 * snapshot estático, mantendo paridade básica com o backend.
 */
function filterPrestacoes(list: PrestacaoConta[], params: ListParams): PrestacaoConta[] {
  let out = list;
  if (params.ano) out = out.filter((p) => p.ano === params.ano);
  if (params.mes) out = out.filter((p) => p.mes === params.mes || p.mesInicial === params.mes);
  if (params.organizationId) out = out.filter((p) => p.organizationId === params.organizationId);
  return out;
}

/**
 * Prestação de contas API. Leitura pública é tolerante a backend offline.
 * Operações de escrita exigem backend ativo.
 */
export const PrestacaoContasApi = {
  list: async (params: ListParams = {}): Promise<PrestacaoConta[]> =>
    withFallback(
      async () => {
        const res = await api.get("/api/prestacao-contas", { params });
        const payload = unwrap<PagedResult<PrestacaoConta> | PrestacaoConta[]>(res);
        return Array.isArray(payload) ? payload : (payload?.data ?? []);
      },
      async () => {
        const all = (await StaticData.prestacaoContas()) as unknown as PrestacaoConta[];
        return filterPrestacoes(all, params);
      }
    ),

  listByOrganization: async (
    organizationId: string,
    params: { page?: number; limit?: number; ano?: number; mes?: number } = {}
  ): Promise<PrestacaoConta[]> =>
    withFallback(
      async () => {
        const res = await api.get(`/api/prestacao-contas/organization/${organizationId}`, { params });
        const payload = unwrap<PagedResult<PrestacaoConta> | PrestacaoConta[]>(res);
        return Array.isArray(payload) ? payload : (payload?.data ?? []);
      },
      async () => {
        const all = (await StaticData.prestacaoContas()) as unknown as PrestacaoConta[];
        return filterPrestacoes(all, { ...params, organizationId });
      }
    ),

  getById: async (id: string): Promise<PrestacaoConta> =>
    withFallback(
      async () => {
        const res = await api.get(`/api/prestacao-contas/${id}`);
        return unwrap<PrestacaoConta>(res);
      },
      async () => {
        const all = (await StaticData.prestacaoContas()) as unknown as PrestacaoConta[];
        const found = all.find((p) => p.id === id);
        if (!found) throw new Error("Prestação de contas não encontrada.");
        return found;
      }
    ),

  create: async (data: Partial<PrestacaoConta>): Promise<PrestacaoConta> => {
    ensureWritable("Criar prestação de contas");
    const res = await api.post("/api/prestacao-contas", data);
    return unwrap<PrestacaoConta>(res);
  },

  update: async (id: string, data: Partial<PrestacaoConta>): Promise<PrestacaoConta> => {
    ensureWritable("Atualizar prestação de contas");
    const res = await api.put(`/api/prestacao-contas/${id}`, data);
    return unwrap<PrestacaoConta>(res);
  },

  delete: async (id: string): Promise<void> => {
    ensureWritable("Remover prestação de contas");
    await api.delete(`/api/prestacao-contas/${id}`);
  },
};

export default PrestacaoContasApi;
