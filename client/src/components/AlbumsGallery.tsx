import { useMemo, useState, useCallback } from "react";
import { DONATION_CAROUSEL_FALLBACK_SLIDES, type DonationCarouselFallbackSlide } from "@/lib/donationCarouselFallback";
import { AlbumViewer } from "@/components/AlbumViewer";
import { ZoomIn } from "lucide-react";

const SECTION_TITLE = "Sua solidariedade transforma uma vida.";
const SECTION_SUBTITLE =
  "Cada gesto de carinho fortalece histórias de cuidado, acolhimento e esperança, aproximando pessoas que querem ajudar de vidas que podem ser transformadas.";

const CATEGORY_ORDER = [
  "Doações de Cabelo",
  "Dia a Dia na Casa",
  "Momentos de Passeio",
];

type Album = {
  name: string;
  title: string;
  subtitle: string;
  slides: DonationCarouselFallbackSlide[];
  cover: string;
};

/**
 * Galeria de álbuns de fotos com visualização estilo rede social.
 * Dados definidos no frontend (donationCarouselFallback).
 */
export function AlbumsGallery() {
  const [openAlbum, setOpenAlbum] = useState<Album | null>(null);

  /** Agrupa slides por tema e ordena conforme CATEGORY_ORDER. */
  const albums = useMemo(() => {
    const map = new Map<string, DonationCarouselFallbackSlide[]>();
    for (const s of DONATION_CAROUSEL_FALLBACK_SLIDES) {
      const key = s.theme || "Geral";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    return Array.from(map.entries())
      .map(([name, items]) => {
        const sorted = [...items].sort(
          (a, b) => (a.order ?? 0) - (b.order ?? 0)
        );
        const meta = sorted.find((s) => s.albumTitle || s.albumSubtitle);
        return {
          name,
          title: meta?.albumTitle || name,
          subtitle: meta?.albumSubtitle || "",
          slides: sorted,
          cover: sorted[0]?.imageUrl ?? "",
        };
      })
      .sort((a, b) => {
        const aIdx = CATEGORY_ORDER.indexOf(a.name);
        const bIdx = CATEGORY_ORDER.indexOf(b.name);
        if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
        if (aIdx !== -1) return -1;
        if (bIdx !== -1) return 1;
        return a.name.localeCompare(b.name, "pt-BR");
      });
  }, []);

  /** Abre um álbum para visualização. */
  const handleOpenAlbum = useCallback((album: Album) => {
    setOpenAlbum(album);
  }, []);

  /** Fecha o álbum aberto. */
  const handleCloseAlbum = useCallback(() => {
    setOpenAlbum(null);
  }, []);

  return (
    <>
      <section className="py-12 md:py-20 bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 relative overflow-hidden">
        <div className="absolute top-10 right-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />

        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 relative z-10">
          {/* Cabeçalho da seção */}
          <div className="text-center mb-8 md:mb-12 px-2">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4 md:mb-6">
              {SECTION_TITLE}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto font-medium">
              {SECTION_SUBTITLE}
            </p>
          </div>

          {/* Grid de álbuns */}
          {albums.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {albums.map((album) => {
                const isMomentos = album.name === "Momentos de Passeio";
                return (
                  <button
                    key={album.name}
                    onClick={() => handleOpenAlbum(album)}
                    className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 text-left"
                  >
                    <div className="aspect-[4/3] bg-gradient-to-br from-pink-100 to-purple-100">
                      <img
                        src={album.cover}
                        alt={`Álbum ${album.name}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-4 md:p-5">
                      <p className="text-white font-bold text-lg md:text-xl leading-tight drop-shadow-lg">
                        {album.name}
                      </p>
                      {isMomentos && album.subtitle && (
                        <p className="text-white/90 text-sm mt-1 line-clamp-2 drop-shadow">
                          {album.subtitle}
                        </p>
                      )}
                      <p className="text-white/60 text-xs mt-1">
                        {album.slides.length}{" "}
                        {album.slides.length === 1 ? "foto" : "fotos"}
                      </p>
                    </div>
                    <div className="absolute top-3 right-3 bg-white/90 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                      <ZoomIn className="h-4 w-4 text-purple-600" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Visualizador de álbum estilo rede social */}
      {openAlbum && (
        <AlbumViewer album={openAlbum} onClose={handleCloseAlbum} />
      )}
    </>
  );
}
