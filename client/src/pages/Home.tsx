import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ArrowRight, Heart, ShoppingCart, Users, Phone, MapPin, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { getPublicSupporters, type Supporter } from "@/api/supporters";
import { type CarouselApi, Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { AspectRatio } from "@/components/ui/aspect-ratio";

export function Home() {
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [loadingSupporters, setLoadingSupporters] = useState(true);
  const [heroCarouselApi, setHeroCarouselApi] = useState<CarouselApi | null>(null);
  const baseUrl = (import.meta as any).env?.BASE_URL ?? "/";

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await getPublicSupporters();
        if (mounted) setSupporters(list);
      } catch (e) {
        console.warn("Falha ao carregar apoiadores públicos", e);
      } finally {
        if (mounted) setLoadingSupporters(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Autoplay para o carrossel do topo
  useEffect(() => {
    if (!heroCarouselApi) return;
    const id = setInterval(() => {
      try {
        heroCarouselApi.scrollNext();
      } catch {
        // no-op
      }
    }, 3500);
    return () => clearInterval(id);
  }, [heroCarouselApi]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative pt-2 pb-12 md:pb-20 px-3 sm:px-4 md:px-6 lg:px-8 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-20 left-10 w-48 sm:w-72 h-48 sm:h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-40 right-10 w-48 sm:w-72 h-48 sm:h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-48 sm:w-72 h-48 sm:h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 md:gap-16 items-center">
            {/* Painel transitivo de fotos (igual ao Sobre) - apenas imagens especificadas */}
            <div className="relative order-1 lg:order-2 w-full">
              <div className="relative z-10 group">
                <Carousel opts={{ loop: true }} setApi={setHeroCarouselApi}>
                  <CarouselContent>
                    {(() => {
                      const images = [
                        `${baseUrl}img/redeFemininaCapa.jpg?v=1`,
                        `${baseUrl}img/Frente_RFCC.jpg?v=1`,
                      ];
                      return images.map((src, idx) => {
                        const fallbackSrc = images[(idx + 1) % images.length];
                        return (
                          <CarouselItem key={idx}>
                            <AspectRatio ratio={16 / 9} className="w-full overflow-hidden rounded-3xl shadow-2xl ring-1 ring-black/5">
                              <img
                                src={src}
                                alt="Rede Feminina de Combate ao Câncer"
                                className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                                draggable={false}
                                onError={(e) => {
                                  const img = e.currentTarget as HTMLImageElement;
                                  if (!img.dataset.fallback) {
                                    img.dataset.fallback = "1";
                                    img.src = fallbackSrc;
                                  }
                                }}
                              />
                            </AspectRatio>
                          </CarouselItem>
                        );
                      });
                    })()}
                  </CarouselContent>
                  <CarouselPrevious className="left-4 bg-white/95 hover:bg-white shadow-lg backdrop-blur-sm" />
                  <CarouselNext className="right-4 bg-white/95 hover:bg-white shadow-lg backdrop-blur-sm" />
                </Carousel>
              </div>
              <div className="absolute -top-6 -right-6 w-full h-full bg-gradient-to-br from-pink-300/40 via-purple-300/40 to-indigo-300/40 rounded-3xl -z-10 blur-sm"></div>
            </div>
            
            {/* Text Content - Second on mobile, first on desktop */}
            <div className="space-y-6 md:space-y-8 order-2 lg:order-1 text-center lg:text-left px-2">
              <div className="space-y-4 md:space-y-6">
                <div className="inline-flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 text-xs sm:text-sm font-semibold shadow-sm ring-1 ring-pink-200/50">
                  <Heart className="w-3 h-3 md:w-4 md:h-4 fill-current animate-pulse" />
                  Desde 1963 fazendo a diferença 
                </div>
                
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold !leading-tight">
                  <span className="block bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Rede Feminina 
                  </span>
                  <span className="block bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent mt-1 md:mt-2">
                    de Combate ao Câncer
                  </span>
                </h1>
                
                <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  Acolhemos pessoas com câncer em tratamento no Hospital Laureano (João Pessoa, PB), 
                  oferecendo apoio assistencial, proteção e fortalecimento para promover a melhoria da qualidade de vida.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start">
                <Button
                  asChild
                  size="lg"
                  className="group bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white px-6 sm:px-10 py-5 sm:py-6 text-base sm:text-lg font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  <Link to="/donations" className="flex items-center justify-center">
                    <Heart className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:animate-pulse" />
                    Fazer Doação
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="group border-2 border-pink-600 text-pink-600 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 px-6 sm:px-10 py-5 sm:py-6 text-base sm:text-lg font-bold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Link to="/loja" className="flex items-center justify-center">
                    <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Bazar Solidário
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-20 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-16 px-2">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4 md:mb-6">
              Nosso Impacto
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto font-medium">
              Há mais de 60 anos transformando vidas e oferecendo esperança
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
            <div className="group text-center p-6 sm:p-8 md:p-10 rounded-3xl bg-gradient-to-br from-pink-500 to-pink-600 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-rotate-1">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-4xl sm:text-5xl font-black text-white mb-2 sm:mb-3 group-hover:scale-110 transition-transform">1000+</h3>
              <p className="text-white/95 font-semibold text-base sm:text-lg">Pessoas Atendidas</p>
            </div>
            
            <div className="group text-center p-6 sm:p-8 md:p-10 rounded-3xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-4xl sm:text-5xl font-black text-white mb-2 sm:mb-3 group-hover:scale-110 transition-transform">60+</h3>
              <p className="text-white/95 font-semibold text-base sm:text-lg">Anos de Dedicação</p>
            </div>
            
            <div className="group text-center p-6 sm:p-8 md:p-10 rounded-3xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:rotate-1">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-4xl sm:text-5xl font-black text-white mb-2 sm:mb-3 group-hover:scale-110 transition-transform">200+</h3>
              <p className="text-white/95 font-semibold text-base sm:text-lg">Voluntários</p>
            </div>
          </div>
        </div>
      </section>
{/* Instituições Parceiras Section */}
<section className="py-16 md:py-24 bg-gradient-to-br from-white via-pink-50 to-purple-50 relative overflow-hidden">
  {/* Background decorative elements */}
  <div className="absolute top-0 right-0 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
  <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
  
  <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 relative z-10">
    <div className="text-center mb-12 md:mb-20 px-2">
      <h2 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4 md:mb-6">
        Colaboradores da Nossa Missão
      </h2>
      <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-4xl mx-auto font-medium">
        Temos orgulho de contar com o apoio de instituições incríveis que caminham junto conosco!
      </p>
    </div>

    {loadingSupporters ? (
      <div className="text-center text-gray-500 text-base md:text-lg">Carregando apoiadores...</div>
    ) : supporters.length === 0 ? (
      <div className="text-center text-gray-500 text-base md:text-lg">Em breve divulgaremos nossos apoiadores aqui.</div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-6xl mx-auto">
        {supporters
          .filter((s) => s.visible !== false)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((s) => (
            <div key={s.id || s.name} className="group text-center p-10 rounded-3xl bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 ring-1 ring-black/5">
              <div className="w-36 h-36 mx-auto mb-8 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow">
                {s.imageUrl ? (
                  <img src={s.imageUrl} alt={s.name || "Apoiador"} className="w-32 h-32 object-contain transform group-hover:scale-110 transition-transform duration-300" />
                ) : (
                  <div className="w-32 h-32 flex items-center justify-center text-gray-400 text-sm font-medium">Sem imagem</div>
                )}
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                {s.name || "Apoiador"}
              </h3>
              {s.description && (
                <p className="text-gray-600 text-base leading-relaxed mb-4">{s.description}</p>
              )}
              {s.website && (
                <p className="mt-4">
                  <a
                    href={s.website}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 font-semibold hover:underline transition-colors"
                  >
                    Visitar site
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </p>
              )}
            </div>
          ))}
      </div>
    )}
  </div>
</section>
      {/* Services Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 via-pink-50 to-purple-50 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-20 left-0 w-60 sm:w-80 h-60 sm:h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-20 right-0 w-60 sm:w-80 h-60 sm:h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-10 md:mb-16 px-2">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4 md:mb-6">
              Como Você Pode Ajudar
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto font-medium">
              Existem várias formas de contribuir com nossa causa e fazer a diferença na vida de quem precisa
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 max-w-5xl mx-auto">
            <Card className="group p-6 sm:p-8 md:p-10 bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-0 ring-1 ring-black/5 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 sm:w-40 h-32 sm:h-40 bg-gradient-to-br from-pink-200 to-pink-300 rounded-full -mr-16 sm:-mr-20 -mt-16 sm:-mt-20 opacity-20 group-hover:scale-150 transition-transform duration-700"></div>
              <CardHeader className="text-center pb-6 sm:pb-8 relative z-10">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-gradient-to-br from-pink-500 to-pink-600 rounded-3xl flex items-center justify-center mb-6 sm:mb-8 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <ShoppingCart className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                </div>
                <CardTitle className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3 sm:mb-4">
                  Bazar Solidário
                </CardTitle>
                <CardDescription className="text-gray-600 text-base sm:text-lg leading-relaxed">
                  Produtos feitos com carinho, 100% da renda revertida para nossa causa
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center relative z-10">
                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white py-5 sm:py-6 text-base sm:text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Link to="/loja" className="flex items-center justify-center">
                    Ver Produtos
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="group p-6 sm:p-8 md:p-10 bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-0 ring-1 ring-black/5 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 sm:w-40 h-32 sm:h-40 bg-gradient-to-br from-purple-200 to-purple-300 rounded-full -mr-16 sm:-mr-20 -mt-16 sm:-mt-20 opacity-20 group-hover:scale-150 transition-transform duration-700"></div>
              <CardHeader className="text-center pb-6 sm:pb-8 relative z-10">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl flex items-center justify-center mb-6 sm:mb-8 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <Heart className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                </div>
                <CardTitle className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3 sm:mb-4">
                  Doações
                </CardTitle>
                <CardDescription className="text-gray-600 text-base sm:text-lg leading-relaxed">
                  Contribua diretamente para manter nossos serviços funcionando
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center relative z-10">
                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-5 sm:py-6 text-base sm:text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Link to="/donations" className="flex items-center justify-center">
                    Fazer Doação
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* About Section */}
      <section id="about-section" className="py-16 md:py-24 bg-gradient-to-br from-white via-purple-50 to-pink-50 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-10 right-20 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute bottom-10 left-20 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-10 md:mb-16 px-2">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4 md:mb-6">
              Rede Feminina de Combate ao Câncer
            </h2>
            <div className="max-w-5xl mx-auto space-y-4 md:space-y-6">
              <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed font-medium">
                Somos uma Organização não Governamental (ONG), sem fins lucrativos, criada em 1962 que presta serviço de assistência e apoio aos pacientes portadores de câncer em tratamento no Hospital Napoleão Laureano.
              </p>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed">
                Tudo isso é possível graças a nossa equipe de voluntariados composta de aproximadamente 200 pessoas (voluntários efetivos) e também por meio da sociedade civil (voluntários colaboradores), que contribui através de doações de natureza variada.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 mt-12 md:mt-16">
            <div className="group text-center p-6 sm:p-8 rounded-3xl bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 ring-1 ring-black/5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <Phone className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Telefone</h3>
              <p className="text-base sm:text-lg text-gray-700 font-semibold">☎️ (083) 3241-5373</p>
            </div>
            
            <div className="group text-center p-6 sm:p-8 rounded-3xl bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 ring-1 ring-black/5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <MapPin className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Endereço</h3>
              <p className="text-sm sm:text-base text-gray-700 font-semibold">📍 Av. Doze de Outubro, 858 - Jaguaribe, João Pessoa</p>
            </div>
            
            <div className="group text-center p-6 sm:p-8 rounded-3xl bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 ring-1 ring-black/5 sm:col-span-2 md:col-span-1">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Horário</h3>
              <div className="text-sm sm:text-base text-gray-700 font-medium space-y-1.5">
                <p>Segunda a quinta: 8h às 17h</p>
                <p>Sexta: 7h às 13:00h</p>
                <p>Sábados e domingos: fechado</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      
      
      {/* Contact Section */}
      {/* <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent mb-4">
              Entre em Contato
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Estamos aqui para ajudar. Entre em contato conosco para mais informações
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-300">
              <div className="w-12 h-12 mx-auto bg-pink-600 rounded-full flex items-center justify-center mb-4">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Telefone</h3>
              <p className="text-gray-600">(83) 3216-7200</p>
            </div>
            
            <div className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-300">
              <div className="w-12 h-12 mx-auto bg-pink-600 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Email</h3>
              <p className="text-gray-600">contato@rfcc.org.br</p>
            </div>
            
            <div className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-300">
              <div className="w-12 h-12 mx-auto bg-pink-600 rounded-full flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Endereço</h3>
              <p className="text-gray-600">João Pessoa, PB</p>
            </div>
          </div>
        </div>
      </section> */}
    </div>
  );
}
