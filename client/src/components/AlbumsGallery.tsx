import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { DONATION_CAROUSEL_FALLBACK_SLIDES, type DonationCarouselFallbackSlide } from "@/lib/donationCarouselFallback";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Images, ZoomIn } from "lucide-react";

/** Remove espaços e retorna string limpa. */
function normalizeText(value?: string | null): string {
  return (value ?? "").trim();
}

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
 * Galeria de álbuns de fotos com lightbox em tela cheia.
 * Dados definidos no frontend (donationCarouselFallback).
 */
export function AlbumsGallery() {
  const [openAlbum, setOpenAlbum] = useState<Album | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const touchStartX = useRef(0);

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
    setCurrentSlide(0);
  }, []);

  /** Fecha o álbum aberto. */
  const handleCloseAlbum = useCallback(() => {
    setOpenAlbum(null);
    setCurrentSlide(0);
  }, []);

  /** Navega para a foto anterior. */
  const handlePrev = useCallback(() => {
    if (!openAlbum) return;
    setCurrentSlide((prev) =>
      prev === 0 ? openAlbum.slides.length - 1 : prev - 1
    );
  }, [openAlbum]);

  /** Navega para a próxima foto. */
  const handleNext = useCallback(() => {
    if (!openAlbum) return;
    setCurrentSlide((prev) =>
      prev === openAlbum.slides.length - 1 ? 0 : prev + 1
    );
  }, [openAlbum]);

  // Navegação por teclado
  useEffect(() => {
    if (!openAlbum) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCloseAlbum();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openAlbum, handleCloseAlbum, handlePrev, handleNext]);

  // Trava scroll do body quando lightbox está aberto
  useEffect(() => {
    if (openAlbum) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [openAlbum]);

  /** Captura início do toque para swipe. */
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  /** Detecta swipe horizontal e navega. */
  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 50) {
      if (delta > 0) handlePrev();
      else handleNext();
    }
  };

  const currentImage = openAlbum?.slides[currentSlide];
  const currentCaption = normalizeText(currentImage?.caption);

  return (
    <>
      <section className="py-12 md:py-20 bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 relative overflow-hidden">
        <div className="absolute top-10 right-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />

        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 relative z-10">
          {/* Cabeçalho da seção – hardcoded */}
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

      {/* Lightbox em tela cheia */}
      {openAlbum && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label={`Álbum: ${openAlbum.name}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-black/60 backdrop-blur-sm shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shrink-0">
                <Images className="h-4 w-4 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-white font-bold text-sm sm:text-base truncate">
                  {openAlbum.name}
                </h3>
                {openAlbum.name === "Momentos de Passeio" &&
                  openAlbum.subtitle && (
                    <p className="text-white/50 text-xs truncate">
                      {openAlbum.subtitle}
                    </p>
                  )}
                <p className="text-white/60 text-xs">
                  {currentSlide + 1} de {openAlbum.slides.length}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCloseAlbum}
              className="text-white/70 hover:text-white hover:bg-white/10 rounded-full h-10 w-10 shrink-0"
              aria-label="Fechar galeria"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Área principal da imagem */}
          <div
            className="flex-1 relative flex items-center justify-center overflow-hidden select-none"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {openAlbum.slides.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full h-10 w-10 md:h-12 md:w-12"
                  onClick={handlePrev}
                  aria-label="Foto anterior"
                >
                  <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full h-10 w-10 md:h-12 md:w-12"
                  onClick={handleNext}
                  aria-label="Próxima foto"
                >
                  <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
                </Button>
              </>
            )}

            <img
              key={currentSlide}
              src={currentImage?.imageUrl}
              alt={
                normalizeText(currentImage?.altText) ||
                `Foto ${currentSlide + 1}`
              }
              className="max-w-full max-h-full object-contain px-14 md:px-24 py-4"
              draggable={false}
            />
          </div>

          {/* Legenda */}
          {currentCaption && (
            <div className="px-4 py-2 bg-black/60 text-center shrink-0">
              <p className="text-white/80 text-sm">{currentCaption}</p>
            </div>
          )}

          {/* Indicadores e miniaturas */}
          {openAlbum.slides.length > 1 && (
            <div className="px-4 py-3 bg-black/60 backdrop-blur-sm shrink-0">
              {/* Indicadores de ponto */}
              <div className="flex justify-center gap-1.5 flex-wrap mb-2">
                {openAlbum.slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      currentSlide === idx
                        ? "w-6 bg-gradient-to-r from-pink-400 to-purple-400"
                        : "w-1.5 bg-white/30 hover:bg-white/50"
                    }`}
                    aria-label={`Ir para foto ${idx + 1}`}
                  />
                ))}
              </div>
              {/* Faixa de miniaturas */}
              <div className="flex gap-2 overflow-x-auto pb-1 justify-center">
                {openAlbum.slides.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`shrink-0 rounded-md overflow-hidden transition-all duration-200 ${
                      currentSlide === idx
                        ? "ring-2 ring-purple-400 opacity-100 scale-110"
                        : "opacity-40 hover:opacity-70"
                    }`}
                  >
                    <img
                      src={img.imageUrl}
                      alt=""
                      className="h-12 w-16 md:h-14 md:w-20 object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
