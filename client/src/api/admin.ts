import api from "./api";

export type Supporter = {
  id: string;
  name: string;
  imageUrl?: string | null;
  website?: string | null;
  order: number;
  visible: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type DonorAlias = {
  id: string;
  donorEmail?: string | null;
  donorDocument?: string | null;
  displayName: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type TopDonor = {
  id: string;
  donorName: string;
  donatedAmount: number;
  donationType?: 'single' | 'recurring' | 'total';
  donationDate?: string;
  referenceMonth?: number;
  referenceYear?: number;
  topPosition?: number;
  createdAt?: string;
  updatedAt?: string;
};

function unwrap<T = any>(res: any): T {
  return (res?.data?.data ?? res?.data ?? res) as T;
}

export const AdminApi = {
  // Supporters
  listSupporters: async (): Promise<Supporter[]> => {
    const res = await api.get("/api/supporters");
    return unwrap<Supporter[]>(res);
  },
  createSupporter: async (data: Partial<Supporter>): Promise<Supporter> => {
    const res = await api.post("/api/supporters", data);
    return unwrap<Supporter>(res);
  },
  updateSupporter: async (id: string, data: Partial<Supporter>): Promise<Supporter> => {
    const res = await api.patch(`/api/supporters/${id}`, data);
    return unwrap<Supporter>(res);
  },
  deleteSupporter: async (id: string): Promise<void> => {
    await api.delete(`/api/supporters/${id}`);
  },

  // Donor Aliases
  listDonorAliases: async (): Promise<DonorAlias[]> => {
    const res = await api.get("/api/admin/donor-aliases");
    return unwrap<DonorAlias[]>(res);
  },
  upsertDonorAlias: async (payload: {
    donorEmail?: string;
    donorDocument?: string;
    displayName: string;
    active?: boolean;
  }): Promise<DonorAlias> => {
    const res = await api.put("/api/admin/donor-aliases", payload);
    return unwrap<DonorAlias>(res);
  },
  deleteDonorAlias: async (id: string): Promise<void> => {
    await api.delete(`/api/admin/donor-aliases/${id}`);
  },

  // Top Donors (Admin)
  listTopDonorsPublicByPeriod: async (year: number, month: number, limit = 10): Promise<TopDonor[]> => {
    const res = await api.get(`/api/public/top-donors/top/${year}/${month}/${limit}`);
    return unwrap<TopDonor[]>(res);
  },
  createTopDonor: async (payload: { donorName: string; donatedAmount: number; referenceMonth: number; referenceYear: number; donationDate?: string; donationType?: 'single' | 'recurring' | 'total'; }): Promise<TopDonor> => {
    const res = await api.post(`/api/top-donors`, payload);
    return unwrap<TopDonor>(res);
  },
  deleteTopDonor: async (id: string): Promise<void> => {
    await api.delete(`/api/top-donors/${id}`);
  },
};
