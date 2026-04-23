import api from "./api";
import { withFallback } from "@/lib/dataMode";
import { StaticData } from "@/lib/staticData";

export type TopDonor = {
  id?: string;
  donorName: string;
  donatedAmount: number;
  donationDate?: string;
  month: number;
  year: number;
  topPosition?: number;
};

function extractArray(data: any): TopDonor[] {
  if (Array.isArray(data)) return data as TopDonor[];
  return (
    (data?.items as TopDonor[]) ||
    (data?.data as TopDonor[]) ||
    (data?.donors as TopDonor[]) ||
    []
  );
}

/**
 * Lista o ranking público de doadores do período (ano/mês).
 * Em modo `static`/fallback, filtra a coleção do snapshot por ano e mês.
 */
export async function getPublicTopDonors(
  year: number,
  month: number,
  limit = 10
): Promise<TopDonor[]> {
  return withFallback(
    async () => {
      const res = await api.get(`/api/public/top-donors/top/${year}/${month}/${limit}`);
      const payload = (res as any)?.data;
      return extractArray(payload);
    },
    async () => {
      const all = await StaticData.topDonors();
      const filtered = all.filter((d) => d.year === year && d.month === month);
      filtered.sort((a, b) => (a.topPosition ?? 999) - (b.topPosition ?? 999));
      return filtered.slice(0, limit) as TopDonor[];
    }
  );
}
