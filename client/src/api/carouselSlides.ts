import api from "./api";

export type CarouselSlide = {
  id?: string;
  imageUrl: string;
  caption?: string | null;
  altText?: string | null;
  order?: number;
  visible?: boolean;
};

export type CarouselSectionSettings = {
  title: string;
  subtitle: string;
};

function extractArray(data: any): CarouselSlide[] {
  if (Array.isArray(data)) return data as CarouselSlide[];
  return (
    (data?.items as CarouselSlide[]) ||
    (data?.data as CarouselSlide[]) ||
    (data?.slides as CarouselSlide[]) ||
    []
  );
}

function extractObject<T = any>(data: any): T | null {
  if (!data || Array.isArray(data)) return null;
  if (data?.data && !Array.isArray(data.data)) return data.data as T;
  return data as T;
}

export async function getPublicCarouselSlides(): Promise<CarouselSlide[]> {
  const res = await api.get("/api/public/carousel-slides");
  const payload = (res as any)?.data;
  return extractArray(payload);
}

export async function getPublicCarouselSectionSettings(): Promise<CarouselSectionSettings | null> {
  const res = await api.get("/api/public/carousel-slides/settings");
  const payload = (res as any)?.data;
  return extractObject<CarouselSectionSettings>(payload);
}
