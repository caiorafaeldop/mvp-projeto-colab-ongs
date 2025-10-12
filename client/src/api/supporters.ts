import api from "./api";

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

export async function getPublicSupporters(): Promise<Supporter[]> {
  const res = await api.get("/api/public/supporters");
  const payload = (res as any)?.data;
  return extractArray(payload);
}
