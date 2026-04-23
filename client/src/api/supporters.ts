import api from "./api";
import { withFallback } from "@/lib/dataMode";
import { StaticData } from "@/lib/staticData";

export type Supporter = {
  id?: string;
  name?: string;
  imageUrl?: string;
  description?: string;
  website?: string;
  order?: number;
  visible?: boolean;
};

function extractArray(data: any): Supporter[] {
  if (Array.isArray(data)) return data as Supporter[];
  return (
    (data?.items as Supporter[]) ||
    (data?.data as Supporter[]) ||
    (data?.supporters as Supporter[]) ||
    []
  );
}

/**
 * Lista apoiadores públicos exibidos na Home.
 * Em modo `static`/fallback, lê o snapshot JSON correspondente.
 */
export async function getPublicSupporters(): Promise<Supporter[]> {
  return withFallback(
    async () => {
      const res = await api.get("/api/public/supporters");
      const payload = (res as any)?.data;
      return extractArray(payload);
    },
    async () => {
      const all = await StaticData.supporters();
      const visible = all.filter((s) => s.visible !== false);
      return visible.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) as Supporter[];
    }
  );
}
