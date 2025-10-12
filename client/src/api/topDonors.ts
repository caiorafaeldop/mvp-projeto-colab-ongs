import api from "./api";

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

export async function getPublicTopDonors(
  year: number,
  month: number,
  limit = 10
): Promise<TopDonor[]> {
  const res = await api.get(`/api/public/top-donors/top/${year}/${month}/${limit}`);
  const payload = (res as any)?.data;
  return extractArray(payload);
}
