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

export type CarouselSlide = {
  id: string;
  imageUrl: string;
  caption?: string | null;
  altText?: string | null;
  order: number;
  visible: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CarouselSlideImportResult = {
  created: number;
  updated: number;
  unchanged: number;
  total: number;
  defaults: number;
};

export type CarouselSectionSettings = {
  title: string;
  subtitle: string;
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

  // Carousel Slides (Admin)
  listCarouselSlides: async (visible?: boolean): Promise<CarouselSlide[]> => {
    const params = visible !== undefined ? { visible } : undefined;
    const res = await api.get("/api/carousel-slides", { params });
    return unwrap<CarouselSlide[]>(res);
  },
  createCarouselSlide: async (data: Partial<CarouselSlide>): Promise<CarouselSlide> => {
    const res = await api.post("/api/carousel-slides", data);
    return unwrap<CarouselSlide>(res);
  },
  updateCarouselSlide: async (id: string, data: Partial<CarouselSlide>): Promise<CarouselSlide> => {
    const res = await api.patch(`/api/carousel-slides/${id}`, data);
    return unwrap<CarouselSlide>(res);
  },
  deleteCarouselSlide: async (id: string): Promise<void> => {
    await api.delete(`/api/carousel-slides/${id}`);
  },
  importDefaultCarouselSlides: async (): Promise<CarouselSlideImportResult> => {
    const res = await api.post("/api/carousel-slides/import-defaults");
    return unwrap<CarouselSlideImportResult>(res);
  },
  getCarouselSectionSettings: async (): Promise<CarouselSectionSettings> => {
    const res = await api.get("/api/carousel-slides/settings");
    return unwrap<CarouselSectionSettings>(res);
  },
  updateCarouselSectionSettings: async (
    payload: CarouselSectionSettings
  ): Promise<CarouselSectionSettings> => {
    const res = await api.put("/api/carousel-slides/settings", payload);
    return unwrap<CarouselSectionSettings>(res);
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
