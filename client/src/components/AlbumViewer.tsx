import { useState, useCallback, useRef, useEffect } from "react";
import type { DonationCarouselFallbackSlide } from "@/lib/donationCarouselFallback";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Images,
  Camera,
} from "lucide-react";

type Album = {
  name: string;
  title: string;
  subtitle: string;
  slides: DonationCarouselFallbackSlide[];
  cover: string;
};

const ALBUM_DESCRIPTIONS: Record<string, string> = {
  "Doações de Cabelo":
    "A doação de cabelos é um gesto simples, mas de enorme significado para mulheres que enfrentam o câncer. Para muitas delas, a perda dos cabelos durante o tratamento não afeta apenas a aparência, mas também a autoestima e a forma como se enxergam no mundo. Dessa forma, a Rede Feminina de Combate ao Câncer do Hospital Napoleão Laureano desempenha um papel fundamental ao transformar mechas de solidariedade em perucas que devolvem dignidade, confiança e esperança.\n\nDoar cabelo é mais do que contribuir com um material; é oferecer apoio emocional em um momento delicado. Cada fio doado carrega empatia e cuidado, ajudando a reconstruir não apenas a imagem, mas também a força interior de quem está em tratamento.",
  "Dia a Dia na Casa":
    "O dia a dia na casa de apoio da Rede Feminina de Combate ao Câncer do Hospital Napoleão Laureano é marcado por acolhimento, cuidado e solidariedade. Mais do que um espaço físico, o local se torna um verdadeiro refúgio para pacientes que estão em tratamento, oferecendo não apenas suporte material, mas também carinho e atenção em cada detalhe.\n\nDesde as primeiras horas do dia, voluntários se dedicam a preparar refeições, organizar atividades e garantir que todos se sintam amparados. Cada momento compartilhado reforça a importância do afeto e da união no enfrentamento da doença.\n\nNa casa, histórias de luta se cruzam com exemplos de superação, é um lugar onde o cuidado vai além do tratamento médico, alcançando o coração de cada pessoa que passa por ali.",
  "Momentos de Passeio":
    "A Rede Feminina de Combate ao Câncer da Paraíba realiza passeios semanais, que acontecem às quartas-feiras, no turno da tarde. Essas atividades contam com o acompanhamento das voluntárias Fernanda e Ana Carla, além do suporte de um motorista, garantindo segurança e acolhimento aos participantes.\n\nEsses passeios têm grande importância para os pacientes em tratamento, pois proporcionam momentos de lazer, socialização e bem-estar emocional. Durante o tratamento oncológico, é comum que os pacientes enfrentem desafios físicos e psicológicos, como ansiedade, estresse e isolamento. Nesse contexto, as saídas contribuem para melhorar a autoestima, fortalecer vínculos e oferecer uma pausa na rotina hospitalar, promovendo mais qualidade de vida.",
};

const DESCRIPTION_PREVIEW_LENGTH = 180;

type AlbumViewerProps = {
  album: Album;
  onClose: () => void;
};

/**
 * Visualizador de álbum inspirado em redes sociais (Instagram/Facebook desktop).
 * Lado esquerdo: carrossel de imagens com navegação.
 * Lado direito: informações descritivas do álbum.
 */
export function AlbumViewer({ album, onClose }: AlbumViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const touchStartX = useRef(0);
  const backdropRef = useRef<HTMLDivElement>(null);

  const currentImage = album.slides[currentSlide];
  const caption = (currentImage?.caption ?? "").trim();
  const description = ALBUM_DESCRIPTIONS[album.name] ?? album.subtitle;

  // Animação de entrada
  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  /** Fecha com animação de saída. */
  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 250);
  }, [onClose]);

  /** Navega para a foto anterior. */
  const handlePrev = useCallback(() => {
    setImageLoaded(false);
    setCurrentSlide((prev) =>
      prev === 0 ? album.slides.length - 1 : prev - 1
    );
  }, [album.slides.length]);

  /** Navega para a próxima foto. */
  const handleNext = useCallback(() => {
    setImageLoaded(false);
    setCurrentSlide((prev) =>
      prev === album.slides.length - 1 ? 0 : prev + 1
    );
  }, [album.slides.length]);

  // Navegação por teclado
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [handleClose, handlePrev, handleNext]);

  // Trava scroll do body
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

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

  /** Fecha ao clicar no backdrop (fora do conteúdo). */
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) handleClose();
  };

  const overlayClasses = isVisible ? "opacity-100" : "opacity-0";
  const panelClasses = isVisible
    ? "opacity-100 scale-100 translate-y-0"
    : "opacity-0 scale-95 translate-y-4";

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 lg:p-10 bg-black/80 backdrop-blur-sm transition-opacity duration-250 ${overlayClasses}`}
      role="dialog"
      aria-modal="true"
      aria-label={`Álbum: ${album.name}`}
    >
      <div
        className={`relative w-full max-w-6xl max-h-[95vh] bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row transition-all duration-300 ease-out ${panelClasses}`}
      >
        {/* Botão fechar */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="absolute top-3 right-3 z-30 bg-black/40 hover:bg-black/60 text-white rounded-full h-9 w-9 backdrop-blur-sm"
          aria-label="Fechar visualização"
        >
          <X className="h-4 w-4" />
        </Button>

        {/* ===== LADO ESQUERDO — Carrossel de imagens ===== */}
        <div className="relative flex-1 lg:flex-[3] bg-neutral-950 flex flex-col min-h-0">
          {/* Área da imagem */}
          <div
            className="relative flex-1 flex items-center justify-center min-h-[250px] sm:min-h-[300px] lg:min-h-0 overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Setas de navegação */}
            {album.slides.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-neutral-800 rounded-full h-9 w-9 sm:h-10 sm:w-10 shadow-lg transition-transform hover:scale-105"
                  onClick={handlePrev}
                  aria-label="Foto anterior"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-neutral-800 rounded-full h-9 w-9 sm:h-10 sm:w-10 shadow-lg transition-transform hover:scale-105"
                  onClick={handleNext}
                  aria-label="Próxima foto"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}

            {/* Imagem principal com fade */}
            <div className="w-full h-full flex items-center justify-center p-2 sm:p-4">
              <img
                key={currentSlide}
                src={currentImage?.imageUrl}
                alt={
                  (currentImage?.altText ?? "").trim() ||
                  `Foto ${currentSlide + 1}`
                }
                onLoad={() => setImageLoaded(true)}
                className={`max-w-full max-h-[50vh] lg:max-h-[75vh] object-contain rounded-lg transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                draggable={false}
              />
            </div>

            {/* Contador de fotos */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
              {currentSlide + 1} / {album.slides.length}
            </div>
          </div>

          {/* Legenda da foto atual */}
          {caption && (
            <div className="px-4 sm:px-6 py-3 bg-neutral-900/80 border-t border-white/5">
              <p className="text-white/90 text-sm sm:text-base font-medium text-center">
                {caption}
              </p>
            </div>
          )}

          {/* Indicadores (pontos) — mobile e desktop */}
          {album.slides.length > 1 && (
            <div className="flex justify-center gap-1.5 py-2.5 bg-neutral-950 lg:hidden">
              {album.slides.map((_, idx) => {
                const isActive = currentSlide === idx;
                const dotClasses = isActive
                  ? "w-6 bg-gradient-to-r from-pink-400 to-purple-500"
                  : "w-1.5 bg-white/30 hover:bg-white/50";
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setImageLoaded(false);
                      setCurrentSlide(idx);
                    }}
                    className={`h-1.5 rounded-full transition-all duration-300 ${dotClasses}`}
                    aria-label={`Ir para foto ${idx + 1}`}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* ===== LADO DIREITO — Informações do álbum ===== */}
        <div className="lg:flex-[2] lg:max-w-[380px] xl:max-w-[420px] flex flex-col border-t lg:border-t-0 lg:border-l border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-y-auto">
          {/* Header do álbum */}
          <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center shrink-0 shadow-md">
                <Images className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white truncate">
                  {album.name}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {album.slides.length}{" "}
                  {album.slides.length === 1 ? "foto" : "fotos"}
                </p>
              </div>
            </div>
            {album.subtitle && (
              <p className="text-sm text-purple-600 dark:text-purple-400 font-medium italic">
                &ldquo;{album.subtitle}&rdquo;
              </p>
            )}
          </div>

          {/* Descrição do álbum — estilo rede social */}
          <div className="px-5 sm:px-6 py-4 flex-1">
            <div className="text-sm sm:text-[0.9375rem] leading-relaxed text-neutral-700 dark:text-neutral-300">
              {(() => {
                const needsTruncate = description.length > DESCRIPTION_PREVIEW_LENGTH;
                const isExpanded = descriptionExpanded || !needsTruncate;
                const visibleText = isExpanded
                  ? description
                  : description.slice(0, DESCRIPTION_PREVIEW_LENGTH).replace(/\s+\S*$/, "");

                return (
                  <>
                    {visibleText.split("\n\n").map((paragraph, i) => (
                      <p key={i} className={i > 0 ? "mt-2.5" : ""}>
                        {paragraph}
                      </p>
                    ))}
                    {needsTruncate && !isExpanded && (
                      <span className="text-neutral-400 dark:text-neutral-500">
                        ...{" "}
                      </span>
                    )}
                    {needsTruncate && (
                      <button
                        onClick={() => setDescriptionExpanded((prev) => !prev)}
                        className="inline text-purple-600 dark:text-purple-400 font-semibold text-sm hover:text-purple-700 dark:hover:text-purple-300 transition-colors mt-1"
                      >
                        {isExpanded ? "Ler menos" : "Ler mais..."}
                      </button>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Info da foto atual */}
            <div className="mt-5 pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2 mb-2">
                <Camera className="h-4 w-4 text-neutral-400" />
                <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Foto {currentSlide + 1} de {album.slides.length}
                </span>
              </div>
              {caption && (
                <p className="text-sm text-neutral-600 dark:text-neutral-400 hidden lg:block">
                  {caption}
                </p>
              )}
            </div>
          </div>

          {/* Miniaturas */}
          {album.slides.length > 1 && (
            <div className="px-5 sm:px-6 py-4 border-t border-neutral-100 dark:border-neutral-800">
              <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">
                Todas as fotos
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                {album.slides.map((img, idx) => {
                  const isActive = currentSlide === idx;
                  const thumbClasses = isActive
                    ? "ring-2 ring-purple-500 ring-offset-1 dark:ring-offset-neutral-900 opacity-100"
                    : "opacity-60 hover:opacity-90";
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setImageLoaded(false);
                        setCurrentSlide(idx);
                      }}
                      className={`aspect-square rounded-lg overflow-hidden transition-all duration-200 ${thumbClasses}`}
                      aria-label={`Ver foto ${idx + 1}`}
                    >
                      <img
                        src={img.imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
