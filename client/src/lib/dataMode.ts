/**
 * Resolver central de modo de dados.
 *
 * Lê `VITE_DATA_MODE` (api | static | auto) e centraliza a decisão de
 * onde os módulos da camada `src/api/*` buscam dados públicos.
 *
 * - `api`    -> apenas backend.
 * - `static` -> apenas snapshots JSON em /static-data.
 * - `auto`   -> tenta o backend e cai para JSON em erro de rede / 5xx / timeout.
 */

export type DataMode = "api" | "static" | "auto";

const DEFAULT_MODE: DataMode = "auto";
const AUTO_API_TIMEOUT_MS = 6000;

/**
 * Retorna o modo configurado. Default = "auto".
 */
export function getDataMode(): DataMode {
  const raw = (import.meta.env.VITE_DATA_MODE as string | undefined)?.toLowerCase();
  if (raw === "api" || raw === "static" || raw === "auto") {
    return raw;
  }
  return DEFAULT_MODE;
}

/**
 * Indica se o app está rodando em modo somente leitura (sem backend).
 */
export function isStaticMode(): boolean {
  return getDataMode() === "static";
}

/**
 * Mensagem padrão para fluxos de escrita / privados quando o backend
 * não está disponível no modo paliativo.
 */
export const STATIC_UNAVAILABLE_MESSAGE =
  "Esta funcionalidade está temporariamente indisponível. O site está em modo somente leitura enquanto o servidor é reativado.";

/**
 * Lança erro padronizado para operações que não podem ser executadas
 * sem backend (escritas, autenticação, pagamentos, etc.).
 */
export function ensureWritable(label?: string): void {
  if (isStaticMode()) {
    const prefix = label ? `${label}: ` : "";
    throw new Error(prefix + STATIC_UNAVAILABLE_MESSAGE);
  }
}

type FallbackErrorLike = {
  code?: string;
  message?: string;
  response?: { status?: number };
};

/**
 * Heurística para decidir se um erro do backend justifica usar o snapshot
 * estático no modo `auto`.
 */
function isFallbackableError(err: unknown): boolean {
  const e = err as FallbackErrorLike;
  if (!e) return true;
  if (e.message === "timeout") return true;
  if (e.code === "ERR_NETWORK" || e.code === "ECONNABORTED") return true;
  const status = e.response?.status;
  if (!status) return true;
  return status === 502 || status === 503 || status === 504;
}

/**
 * Promise.race com timeout — usado apenas no modo `auto` para evitar
 * que o usuário fique esperando o backend hibernado responder.
 */
function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("timeout")), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      }
    );
  });
}

/**
 * Aplica a estratégia do modo de dados:
 * - `api`: executa apenas `apiCall`.
 * - `static`: executa apenas `staticCall`.
 * - `auto`: tenta `apiCall` (com timeout); em falha tolerável, usa `staticCall`.
 *
 * Mantém as assinaturas dos módulos da camada `src/api/*` intactas.
 */
export async function withFallback<T>(
  apiCall: () => Promise<T>,
  staticCall: () => Promise<T>
): Promise<T> {
  const mode = getDataMode();

  if (mode === "static") {
    return staticCall();
  }

  if (mode === "api") {
    return apiCall();
  }

  try {
    return await withTimeout(apiCall(), AUTO_API_TIMEOUT_MS);
  } catch (err) {
    if (isFallbackableError(err)) {
      if (import.meta.env.DEV) {
        console.warn("[dataMode] API indisponível, usando snapshot estático.", err);
      }
      return staticCall();
    }
    throw err;
  }
}
