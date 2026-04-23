/**
 * Camada de leitura dos snapshots JSON estáticos publicados em
 * `/public/static-data/`. Faz cache em memória por sessão para evitar
 * requisições repetidas durante a navegação.
 *
 * Os arquivos são gerados pelo script
 * `server/scripts/export-public-snapshot.js` a partir do banco real.
 */

const STATIC_BASE = "/static-data";

const cache = new Map<string, unknown>();

/**
 * Busca um JSON do diretório público de snapshots, com cache em memória.
 * Retorna `fallback` se o arquivo não existir ou o conteúdo for inválido.
 */
async function loadJson<T>(name: string, fallback: T): Promise<T> {
  if (cache.has(name)) {
    return cache.get(name) as T;
  }
  try {
    const res = await fetch(`${STATIC_BASE}/${name}.json`, {
      headers: { Accept: "application/json" },
      cache: "no-cache",
    });
    if (!res.ok) {
      cache.set(name, fallback);
      return fallback;
    }
    const data = (await res.json()) as T;
    cache.set(name, data);
    return data;
  } catch {
    cache.set(name, fallback);
    return fallback;
  }
}

export type StaticManifest = {
  generatedAt: string;
  version: string;
  mode: "full" | "empty" | "partial";
  collections: string[];
};

/**
 * Tipos espelhando o shape exposto pelos módulos de api correspondentes.
 * Mantemos aqui apenas o subconjunto público (sem PII).
 */
export type StaticFAQ = {
  id: string;
  pergunta: string;
  resposta: string;
  ordem: number;
  ativo: boolean;
};

export type StaticTestimonial = {
  id: string;
  nome: string;
  cargo: string;
  depoimento: string;
  fotoUrl?: string | null;
  ordem: number;
  ativo: boolean;
};

export type StaticSupporter = {
  id?: string;
  name?: string;
  imageUrl?: string;
  description?: string;
  website?: string;
  order?: number;
  visible?: boolean;
};

export type StaticTopDonor = {
  id?: string;
  donorName: string;
  donatedAmount: number;
  donationDate?: string;
  month: number;
  year: number;
  topPosition?: number;
};

export type StaticPrestacaoConta = {
  id: string;
  titulo: string;
  descricaoPlanilha?: string;
  origemRecurso?: string;
  valorTotalRecurso?: number;
  saldoConta?: number;
  ano: number;
  mes?: number;
  mesInicial?: number;
  mesFinal?: number;
  colunas: Array<{ id: string; nome: string; tipo: "text" | "number" | "date"; largura?: number; somavel?: boolean }>;
  linhas: Array<Record<string, unknown>>;
  mostrarTotal: boolean;
  colunasTotal?: string[];
  organizationId?: string;
};

export type StaticProduct = {
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
};

export const StaticData = {
  manifest: () =>
    loadJson<StaticManifest>("manifest", {
      generatedAt: new Date(0).toISOString(),
      version: "0",
      mode: "empty",
      collections: [],
    }),
  faqs: () => loadJson<StaticFAQ[]>("faqs", []),
  testimonials: () => loadJson<StaticTestimonial[]>("testimonials", []),
  supporters: () => loadJson<StaticSupporter[]>("supporters", []),
  topDonors: () => loadJson<StaticTopDonor[]>("topDonors", []),
  prestacaoContas: () => loadJson<StaticPrestacaoConta[]>("prestacaoContas", []),
  products: () => loadJson<StaticProduct[]>("products", []),
};
